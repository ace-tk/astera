import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../models/User.js'
import { COUNTRIES } from '../constants.js'

const dbReady = () => mongoose.connection.readyState === 1

const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i
const PHONE_RE = /^\+[1-9]\d{7,14}$/
const VAT_RE = /^[A-Za-z0-9\s-]{4,20}$/

// Self-service profile edit. Email stays immutable here, same as before —
// company/personal fields are new and all optional (a customer fills them in
// whenever they like; nothing here is required to keep using the account).
const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  companyName: z.string().min(1).max(160).optional(),
  vatNumber: z.string().regex(VAT_RE, 'Enter a valid VAT number').optional(),
  country: z.enum(COUNTRIES).optional(),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  phone: z.string().regex(PHONE_RE, 'Enter a valid phone number with country code').optional(),
  linkedinUrl: z.string().regex(LINKEDIN_RE, 'Enter a valid LinkedIn profile URL').optional(),
})

/** Update the signed-in user's own profile. */
export async function updateMe(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid profile update', issues: parsed.error.flatten() })

  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  Object.entries(parsed.data).forEach(([k, v]) => { user[k] = v })
  await user.save()
  res.json({ user: user.toSafeJSON() })
}

// Same minimum as signup (server/src/controllers/authController.js's passwordFields) — kept
// separate rather than imported to avoid a userController <-> authController import cycle.
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(128),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, { message: 'Passwords do not match', path: ['confirmNewPassword'] })

/** Self-service password change. Requires the current password — same as any
 * "change password while signed in" flow — so a hijacked, still-open session
 * can't be used to lock the real owner out by itself. */
export async function changePassword(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid password change request', issues: parsed.error.flatten() })

  const user = await User.findById(req.userId).select('+passwordHash')
  if (!user) return res.status(404).json({ error: 'User not found' })

  const ok = await user.verifyPassword(parsed.data.currentPassword)
  // 400, not 401: the session itself is fine — only the submitted current-password guess
  // was wrong. The app's API client treats ANY 401 as "session expired" and force-logs the
  // user out globally (services/api.js's onUnauthorized listeners) — a wrong-password retry
  // must never trigger that.
  if (!ok) return res.status(400).json({ error: 'Your current password is incorrect', code: 'WRONG_CURRENT_PASSWORD' })

  user.passwordHash = await User.hashPassword(parsed.data.newPassword)
  await user.save()
  res.json({ ok: true })
}
