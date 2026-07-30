import crypto from 'crypto'
import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../models/User.js'
import { Report } from '../models/Report.js'
import { ActivityLog, logActivity } from '../models/ActivityLog.js'
import { CustomerNote } from '../models/CustomerNote.js'
import { env } from '../config/env.js'
import { COUNTRIES, ACCOUNT_STATUSES } from '../constants.js'
import { sendMail, invitationEmail, passwordResetEmail, verificationEmail } from '../services/mailer.js'
import { reportComposerSchema, createReportForOwner } from '../services/reportBuilder.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i
const PHONE_RE = /^\+[1-9]\d{7,14}$/
const VAT_RE = /^[A-Za-z0-9\s-]{4,20}$/

const genPassword = () => crypto.randomBytes(9).toString('base64url') // ~12 char temp password
const loginUrl = () => `${env.clientUrl.replace(/\/$/, '')}/login`

const customerJSON = (u, reportsCount) => ({
  ...u.toSafeJSON(),
  ...(reportsCount !== undefined ? { reportsCount } : {}),
})

/** Every account that isn't an admin — the Customers module's audience. */
const customerFilter = () => ({ role: { $ne: 'admin' } })

/** List customers with search, filters, sort, and real pagination. */
export async function listCustomers(req, res) {
  if (needDB(res)) return
  const { q, status, country, verified, sort = '-createdAt', page = '1', pageSize = '20' } = req.query

  const filter = { ...customerFilter() }
  if (status && ACCOUNT_STATUSES.includes(status)) filter.status = status
  if (country && COUNTRIES.includes(country)) filter.country = country
  if (verified === 'true') filter.emailVerified = true
  if (verified === 'false') filter.emailVerified = false
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape regex metacharacters in free-text search
    filter.$or = [
      { companyName: { $regex: safe, $options: 'i' } },
      { name: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } },
      { firstName: { $regex: safe, $options: 'i' } },
      { lastName: { $regex: safe, $options: 'i' } },
      { vatNumber: { $regex: safe, $options: 'i' } },
      { phone: { $regex: safe, $options: 'i' } },
    ]
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))
  const sortField = sort.replace(/^-/, '')
  const sortableFields = ['createdAt', 'companyName', 'name', 'email', 'country']
  const sortSpec = sortableFields.includes(sortField) ? sort : '-createdAt'

  const [customers, total] = await Promise.all([
    User.find(filter).sort(sortSpec).skip((pageNum - 1) * size).limit(size),
    User.countDocuments(filter),
  ])

  const counts = await Report.aggregate([
    { $match: { owner: { $in: customers.map((c) => c._id) } } },
    { $group: { _id: '$owner', n: { $sum: 1 } } },
  ])
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]))

  res.json({
    customers: customers.map((c) => customerJSON(c, countMap.get(String(c._id)) || 0)),
    total,
    page: pageNum,
    pageSize: size,
  })
}

/** Full profile + every report belonging to this customer + summary stats. */
export async function getCustomer(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: 'Customer not found' })
  const customer = await User.findOne({ _id: id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const reports = await Report.find({ owner: id }).sort('-createdAt').limit(200)
  const delivered = reports.filter((r) => r.publishStatus === 'published').length
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.length - delivered,
    deliveredReports: delivered,
    lastReportAt: reports[0]?.createdAt || null,
  }
  res.json({ customer: customerJSON(customer), reports: reports.map((r) => r.toClientJSON()), stats })
}

/**
 * The customer's activity timeline / audit history (same underlying log —
 * admin-only, read-only). Persisted events are combined with two facts that
 * are always derivable from the account itself rather than logged on every
 * occurrence: "Account Created" (for legacy accounts with no persisted
 * creation event) and "Last Login" (logging every single login would make
 * this collection grow unbounded for no benefit).
 */
export async function getCustomerActivity(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const customer = await User.findOne({ _id: id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const logged = await ActivityLog.find({ customer: id }).sort('-createdAt').limit(300)
  const events = logged.map((e) => e.toClientJSON())

  if (!events.some((e) => e.type === 'customer_created')) {
    events.push({ id: 'synthetic-created', type: 'customer_created', actor: 'System', at: customer.createdAt })
  }
  if (customer.lastLoginAt) {
    events.push({ id: 'synthetic-login', type: 'last_login', actor: 'Customer', at: customer.lastLoginAt })
  }

  events.sort((a, b) => new Date(b.at) - new Date(a.at))
  res.json({ events })
}

const profileSchema = z.object({
  companyName: z.string().min(1).max(160),
  vatNumber: z.string().regex(VAT_RE, 'Enter a valid VAT number'),
  country: z.enum(COUNTRIES, { errorMap: () => ({ message: 'Select a valid country' }) }),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().regex(PHONE_RE, 'Enter a valid phone number with country code'),
  email: z.string().email(),
  linkedinUrl: z.string().regex(LINKEDIN_RE, 'Enter a valid LinkedIn profile URL'),
  markVerified: z.boolean().optional(),
})

/** Admin creates a customer account on a client's behalf — generates a
 * password and emails an invitation. Verified by default (optionally not). */
export async function createCustomer(req, res) {
  if (needDB(res)) return
  const parsed = profileSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid customer details', issues: parsed.error.flatten() })
  const p = parsed.data

  const exists = await User.findOne({ email: p.email })
  if (exists) return res.status(409).json({ error: 'An account with that email already exists' })

  const tempPassword = genPassword()
  const passwordHash = await User.hashPassword(tempPassword)
  const customer = await User.create({
    name: `${p.firstName} ${p.lastName}`.trim(),
    email: p.email,
    passwordHash,
    accountType: 'company', // this form always collects the full business profile
    companyName: p.companyName,
    vatNumber: p.vatNumber,
    country: p.country,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    linkedinUrl: p.linkedinUrl,
    emailVerified: p.markVerified !== false,
    invitedByAdmin: true,
  })

  const { subject, html } = invitationEmail({ email: customer.email, tempPassword, loginUrl: loginUrl() })
  sendMail({ to: customer.email, subject, html })
  logActivity(customer._id, 'customer_created', req.adminUser?.name || 'Admin')

  res.status(201).json({ customer: customerJSON(customer) })
}

/** Re-send login credentials (a fresh temp password) to an admin-invited customer. */
export async function resendInvitation(req, res) {
  if (needDB(res)) return
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const tempPassword = genPassword()
  customer.passwordHash = await User.hashPassword(tempPassword)
  await customer.save()

  const { subject, html } = invitationEmail({ email: customer.email, tempPassword, loginUrl: loginUrl() })
  sendMail({ to: customer.email, subject, html })
  res.json({ ok: true })
}

/** Admin-triggered reset — generates and emails a new temp password. */
export async function resetPassword(req, res) {
  if (needDB(res)) return
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const tempPassword = genPassword()
  customer.passwordHash = await User.hashPassword(tempPassword)
  await customer.save()

  const { subject, html } = passwordResetEmail(tempPassword)
  sendMail({ to: customer.email, subject, html })
  logActivity(customer._id, 'password_reset', req.adminUser?.name || 'Admin')
  res.json({ ok: true })
}

const statusSchema = z.object({ status: z.enum(ACCOUNT_STATUSES) })

/** Activate / suspend / disable. Never touches their reports. */
export async function updateCustomerStatus(req, res) {
  if (needDB(res)) return
  const parsed = statusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid status', issues: parsed.error.flatten() })
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })
  const from = customer.status
  customer.status = parsed.data.status
  await customer.save()
  if (from !== parsed.data.status) logActivity(customer._id, 'status_changed', req.adminUser?.name || 'Admin', { from, to: parsed.data.status })
  res.json({ customer: customerJSON(customer) })
}

const bulkStatusSchema = z.object({ ids: z.array(z.string()).min(1), status: z.enum(ACCOUNT_STATUSES) })

/** Bulk activate/suspend across several customers at once. */
export async function bulkUpdateCustomerStatus(req, res) {
  if (needDB(res)) return
  const parsed = bulkStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  const ids = parsed.data.ids.filter((id) => mongoose.isValidObjectId(id))
  const customers = await User.find({ _id: { $in: ids }, ...customerFilter() })

  await User.updateMany({ _id: { $in: customers.map((c) => c._id) } }, { $set: { status: parsed.data.status } })
  customers.forEach((c) => {
    if (c.status !== parsed.data.status) logActivity(c._id, 'status_changed', req.adminUser?.name || 'Admin', { from: c.status, to: parsed.data.status })
  })

  res.json({ ok: true, updated: customers.length })
}

/** Admin resend verification email. */
export async function resendCustomerVerification(req, res) {
  if (needDB(res)) return
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() }).select('+verificationToken +verificationTokenExpires')
  if (!customer) return res.status(404).json({ error: 'Customer not found' })
  if (customer.emailVerified) return res.status(409).json({ error: 'This account is already verified' })

  const token = crypto.randomBytes(32).toString('hex')
  customer.verificationToken = token
  customer.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await customer.save()

  const link = `${env.clientUrl.replace(/\/$/, '')}/verify-email?token=${token}`
  const { subject, html } = verificationEmail(link)
  sendMail({ to: customer.email, subject, html })
  res.json({ ok: true })
}

const editSchema = z.object({
  companyName: z.string().min(1).max(160).optional(),
  vatNumber: z.string().regex(VAT_RE).optional(),
  country: z.enum(COUNTRIES).optional(),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  phone: z.string().regex(PHONE_RE).optional(),
  linkedinUrl: z.string().regex(LINKEDIN_RE).optional(),
})

/** Admin edits a customer's profile fields (never email/password here). */
export async function updateCustomer(req, res) {
  if (needDB(res)) return
  const parsed = editSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid update', issues: parsed.error.flatten() })
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  Object.entries(parsed.data).forEach(([k, v]) => { customer[k] = v })
  if (parsed.data.firstName || parsed.data.lastName) {
    customer.name = `${parsed.data.firstName ?? customer.firstName ?? ''} ${parsed.data.lastName ?? customer.lastName ?? ''}`.trim() || customer.name
  }
  await customer.save()
  logActivity(customer._id, 'customer_updated', req.adminUser?.name || 'Admin', { fields: Object.keys(parsed.data) })
  res.json({ customer: customerJSON(customer) })
}

/** Admin uploads/authors a report directly to this customer (not tied to a
 * Report Request). Reuses the exact same builder + draft/publish mechanics. */
export async function uploadReportToCustomer(req, res) {
  if (needDB(res)) return
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const parsed = reportComposerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid report', issues: parsed.error.flatten() })

  const report = await createReportForOwner(customer._id, parsed.data)
  logActivity(customer._id, 'report_uploaded', req.adminUser?.name || 'Admin', { reportId: report._id, title: report.title })
  res.status(201).json({ report: report.toClientJSON() })
}

/* --------------------------------- Notes --------------------------------- */

/** Private admin-only notes about this customer. Never exposed to the customer. */
export async function listCustomerNotes(req, res) {
  if (needDB(res)) return
  const notes = await CustomerNote.find({ customer: req.params.id }).sort('-createdAt')
  res.json({ notes: notes.map((n) => n.toClientJSON()) })
}

const noteSchema = z.object({ text: z.string().min(1).max(4000) })

export async function createCustomerNote(req, res) {
  if (needDB(res)) return
  const parsed = noteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Note text is required', issues: parsed.error.flatten() })
  const customer = await User.findOne({ _id: req.params.id, ...customerFilter() })
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const note = await CustomerNote.create({
    customer: customer._id, text: parsed.data.text,
    authorId: req.adminUser?._id, authorName: req.adminUser?.name || 'Admin',
  })
  res.status(201).json({ note: note.toClientJSON() })
}

export async function updateCustomerNote(req, res) {
  if (needDB(res)) return
  const parsed = noteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Note text is required', issues: parsed.error.flatten() })
  const note = await CustomerNote.findOne({ _id: req.params.noteId, customer: req.params.id })
  if (!note) return res.status(404).json({ error: 'Note not found' })
  note.text = parsed.data.text
  await note.save()
  res.json({ note: note.toClientJSON() })
}

export async function deleteCustomerNote(req, res) {
  if (needDB(res)) return
  const note = await CustomerNote.findOneAndDelete({ _id: req.params.noteId, customer: req.params.id })
  if (!note) return res.status(404).json({ error: 'Note not found' })
  res.json({ ok: true })
}
