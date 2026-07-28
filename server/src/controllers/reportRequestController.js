import mongoose from 'mongoose'
import { z } from 'zod'
import { ReportRequest } from '../models/ReportRequest.js'
import { Report } from '../models/Report.js'
import { saveAttachment, streamAttachment } from '../services/attachments.js'
import { REPORT_TYPES, DELIVERY_MODES, REQUEST_STATUSES } from '../constants.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

const slugify = (s) =>
  `${s || 'report'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'report'

/* ----------------------------- Customer side ----------------------------- */

const createRequestSchema = z.object({
  meetingName: z.string().min(1).max(160),
  reportType: z.enum(REPORT_TYPES).optional(),
  deliveryMode: z.enum(DELIVERY_MODES).optional(),
  meetingDate: z.string().optional(),
  meetingTime: z.string().optional(),
  customerNotes: z.string().max(4000).optional(),
})

/** Customer submits a request for a manually-authored report. No AI runs on this. */
export async function createRequest(req, res) {
  if (needDB(res)) return
  const parsed = createRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  }

  let attachment
  if (req.file) {
    const gridFsId = await saveAttachment(req.file.buffer, req.file.originalname, req.file.mimetype)
    attachment = { fileName: req.file.originalname, mimeType: req.file.mimetype, sizeBytes: req.file.size, gridFsId }
  }

  const request = await ReportRequest.create({ ...parsed.data, customer: req.userId, attachment })
  res.status(201).json({ request: request.toClientJSON() })
}

/** The signed-in customer's own requests — for their "My Requests" panel. */
export async function listMyRequests(req, res) {
  if (needDB(res)) return
  const requests = await ReportRequest.find({ customer: req.userId }).sort('-createdAt').limit(100)
  res.json({ requests: requests.map((r) => r.toClientJSON()) })
}

/* ------------------------------- Admin side ------------------------------- */

const requestJSON = (r) => {
  const o = r.toClientJSON()
  if (o.customer && typeof o.customer === 'object') {
    o.customer = { id: o.customer._id, name: o.customer.name, email: o.customer.email }
  }
  return o
}

/** All report requests, with filters + search. */
export async function listRequests(req, res) {
  if (needDB(res)) return
  const { status, reportType, deliveryMode, customer, from, to, q } = req.query

  const filter = {}
  if (status && REQUEST_STATUSES.includes(status)) filter.status = status
  if (reportType && REPORT_TYPES.includes(reportType)) filter.reportType = reportType
  if (deliveryMode && DELIVERY_MODES.includes(deliveryMode)) filter.deliveryMode = deliveryMode
  if (customer && mongoose.isValidObjectId(customer)) filter.customer = customer
  if (from || to) {
    filter.meetingDate = {}
    if (from) filter.meetingDate.$gte = from
    if (to) filter.meetingDate.$lte = to
  }
  if (q && !customer) {
    filter.$or = [
      { meetingName: { $regex: q, $options: 'i' } },
      { customerNotes: { $regex: q, $options: 'i' } },
    ]
  }

  let requests = await ReportRequest.find(filter).populate('customer', 'name email').sort('-createdAt').limit(500)

  // Free-text search also matches the customer's name/email — done in-memory
  // post-populate since this is an admin-scale list, not a customer-scale one.
  if (q) {
    const needle = q.toLowerCase()
    requests = requests.filter((r) => {
      const hay = [r.meetingName, r.customerNotes, r.customer?.name, r.customer?.email].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(needle)
    })
  }

  res.json({ requests: requests.map(requestJSON) })
}

export async function getRequest(req, res) {
  if (needDB(res)) return
  const request = await ReportRequest.findById(req.params.id).populate('customer', 'name email')
  if (!request) return res.status(404).json({ error: 'Request not found' })
  res.json({ request: requestJSON(request) })
}

/** Stream the uploaded attachment back for preview/download. */
export async function getAttachment(req, res) {
  if (needDB(res)) return
  const request = await ReportRequest.findById(req.params.id)
  if (!request?.attachment?.gridFsId) return res.status(404).json({ error: 'No attachment on this request' })
  res.setHeader('Content-Type', request.attachment.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(request.attachment.fileName || 'attachment')}"`)
  await streamAttachment(request.attachment.gridFsId, res)
}

const statusSchema = z.object({ status: z.enum(REQUEST_STATUSES) })

/** Manual Pending Review → In Progress → Ready transitions. */
export async function updateStatus(req, res) {
  if (needDB(res)) return
  const parsed = statusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid status', issues: parsed.error.flatten() })
  const request = await ReportRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ error: 'Request not found' })
  request.status = parsed.data.status
  await request.save()
  res.json({ request: request.toClientJSON() })
}

const createReportSchema = z.object({
  title: z.string().min(1).max(160),
  reportType: z.enum(REPORT_TYPES),
  meetingType: z.string().max(160).optional(),
  clientOrg: z.string().max(160).optional(),
  meetingOwner: z.string().max(160).optional(),
  duration: z.string().optional(),
  language: z.string().max(60).optional(),
  headline: z.string().max(4000).optional(), // Summary
  decisions: z.array(z.object({ text: z.string(), owner: z.string().optional(), at: z.string().optional() })).optional(),
  commitments: z
    .array(z.object({ text: z.string(), owner: z.string().optional(), due: z.string().optional(), at: z.string().optional() }))
    .optional(),
  complianceNotes: z.string().max(4000).optional(),
  riskNotes: z.string().max(4000).optional(),
  tags: z.array(z.string()).optional(),
  reportContent: z.string().max(20000).optional(),
  deliveryMode: z.enum(DELIVERY_MODES).optional(),
})

/** Admin authors a report from a request. Always starts as a draft. */
export async function createReportFromRequest(req, res) {
  if (needDB(res)) return
  const request = await ReportRequest.findById(req.params.id)
  if (!request) return res.status(404).json({ error: 'Request not found' })
  if (request.report) return res.status(409).json({ error: 'A report already exists for this request — edit it instead.' })

  const parsed = createReportSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid report', issues: parsed.error.flatten() })
  const p = parsed.data

  const slug = `${slugify(p.title)}-${Date.now().toString(36).slice(-5)}`
  const report = await Report.create({
    owner: request.customer,
    slug,
    title: p.title,
    subtitle: p.meetingType || p.reportType,
    category: p.reportType,
    date: request.meetingDate || new Date().toISOString().slice(0, 10),
    duration: p.duration,
    headline: p.headline,
    decisions: p.decisions || [],
    commitments: p.commitments || [],
    metrics: { decisions: p.decisions?.length || 0, commitments: p.commitments?.length || 0, risks: 0, owners: 0, talkBalance: 0 },
    reportType: p.reportType,
    meetingType: p.meetingType,
    clientOrg: p.clientOrg,
    meetingOwner: p.meetingOwner,
    language: p.language,
    complianceNotes: p.complianceNotes,
    riskNotes: p.riskNotes,
    tags: p.tags || [],
    reportContent: p.reportContent,
    deliveryMode: p.deliveryMode || request.deliveryMode,
    request: request._id,
    // Manually authored — never went through the AI-review pipeline.
    reviewStatus: 'approved',
    status: 'ready',
    publishStatus: 'draft',
    source: request.attachment
      ? { fileName: request.attachment.fileName, mimeType: request.attachment.mimeType, sizeBytes: request.attachment.sizeBytes }
      : undefined,
  })

  request.report = report._id
  if (request.status === 'pending_review') request.status = 'in_progress'
  await request.save()

  res.status(201).json({ report: report.toClientJSON() })
}
