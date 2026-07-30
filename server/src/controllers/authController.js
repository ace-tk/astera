import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { COUNTRIES } from '../constants.js'
import { sendMail, verificationEmail } from '../services/mailer.js'
import { logActivity } from '../models/ActivityLog.js'

const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i
const PHONE_RE = /^\+[1-9]\d{7,14}$/
const VAT_RE = /^[A-Za-z0-9\s-]{4,20}$/

const passwordFields = {
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
}

// Guest — for individuals; no company profile at all. Plain ZodObjects only
// (no .refine() per-branch) — z.discriminatedUnion needs direct access to
// each member's `.shape` to find the discriminator key; wrapping a branch in
// .refine() first hides that behind a ZodEffects wrapper and breaks it.
const guestSignupSchema = z.object({
  accountType: z.literal('guest'),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().regex(PHONE_RE, 'Enter a valid phone number with country code, e.g. +14155550123'),
  ...passwordFields,
})

// Company — the existing full business-profile registration.
const companySignupSchema = z.object({
  accountType: z.literal('company'),
  companyName: z.string().min(1).max(160),
  vatNumber: z.string().regex(VAT_RE, 'Enter a valid VAT number'),
  country: z.enum(COUNTRIES, { errorMap: () => ({ message: 'Select a valid country' }) }),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().regex(PHONE_RE, 'Enter a valid phone number with country code, e.g. +14155550123'),
  email: z.string().email(),
  linkedinUrl: z.string().regex(LINKEDIN_RE, 'Enter a valid LinkedIn profile URL'),
  ...passwordFields,
})

// The password-match check is applied to the union as a whole, after it's built.
const signupSchema = z
  .discriminatedUnion('accountType', [guestSignupSchema, companySignupSchema])
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

const signToken = (id) => jwt.sign({ sub: String(id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })
const dbReady = () => mongoose.connection.readyState === 1
const newToken = () => crypto.randomBytes(32).toString('hex')
const verifyLink = (token) => `${env.clientUrl.replace(/\/$/, '')}/verify-email?token=${token}`

/** Guest (individual) or Company (business) signup — both start unverified. */
export async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid signup details', issues: parsed.error.flatten() })
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable — running in demo mode' })

  const p = parsed.data
  const exists = await User.findOne({ email: p.email })
  if (exists) return res.status(409).json({ error: 'An account with that email already exists' })

  const passwordHash = await User.hashPassword(p.password)
  const verificationToken = newToken()
  const user = await User.create({
    name: `${p.firstName} ${p.lastName}`.trim(),
    email: p.email,
    passwordHash,
    accountType: p.accountType,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    // Guest accounts simply never set these — they stay blank/null, not
    // faked, per "Guest users should simply have company-related fields
    // empty/null. Do not require fake company data."
    ...(p.accountType === 'company'
      ? { companyName: p.companyName, vatNumber: p.vatNumber, country: p.country, linkedinUrl: p.linkedinUrl }
      : {}),
    emailVerified: false,
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  const { subject, html } = verificationEmail(verifyLink(verificationToken))
  sendMail({ to: user.email, subject, html })
  // Self-registration — no admin actor. (Admin-created accounts log their own
  // 'customer_created' entry with the admin's name in customerController.)
  logActivity(user._id, 'customer_created', 'Customer', { via: p.accountType })

  res.status(201).json({ message: 'Account created. Check your email to verify it before signing in.' })
}

/** Verification and account status gate login — never issue a token otherwise. */
export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid credentials' })
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable — running in demo mode' })

  const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash')
  if (!user || !(await user.verifyPassword(parsed.data.password))) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email before signing in. Check your inbox for the verification link.' })
  }
  if (user.status !== 'active') {
    return res.status(403).json({
      error: user.status === 'suspended' ? 'Your account has been suspended. Contact support.' : 'Your account has been disabled. Contact support.',
    })
  }

  user.lastLoginAt = new Date()
  await user.save()

  res.json({ token: signToken(user._id), user: user.toSafeJSON() })
}

export async function me(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: user.toSafeJSON() })
}

/** Public — clicking the emailed link lands here. */
export async function verifyEmail(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const { token } = req.params
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  }).select('+verificationToken +verificationTokenExpires')
  if (!user) return res.status(400).json({ error: 'This verification link is invalid or has expired.' })

  user.emailVerified = true
  user.verificationToken = undefined
  user.verificationTokenExpires = undefined
  await user.save()
  logActivity(user._id, 'email_verified', 'Customer')
  res.json({ ok: true })
}

const resendSchema = z.object({ email: z.string().email() })

/** Doesn't reveal whether the account exists — same response either way. */
export async function resendVerification(req, res) {
  const parsed = resendSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid email' })
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })

  const user = await User.findOne({ email: parsed.data.email })
  if (user && !user.emailVerified) {
    const verificationToken = newToken()
    user.verificationToken = verificationToken
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.save()
    const { subject, html } = verificationEmail(verifyLink(verificationToken))
    sendMail({ to: user.email, subject, html })
  }
  res.json({ message: 'If an account with that email exists and isn’t verified yet, a new verification email has been sent.' })
}
