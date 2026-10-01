import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../models/User.js'
import { Media } from '../models/Media.js'
import { saveImage, sniffImageType } from '../cms/mediaStorage.js'
import { COUNTRIES, INDUSTRIES } from '../constants.js'

const dbReady = () => mongoose.connection.readyState === 1

const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i
const PHONE_RE = /^\+[1-9]\d{7,14}$/
const VAT_RE = /^[A-Za-z0-9\s-]{4,20}$/

// Self-service profile edit. Email stays immutable here, same as before —
// company/personal fields are new and all optional (a customer fills them in
// whenever they like; nothing here is required to keep using the account).
// companyLogoUrl is deliberately absent: it is only ever set by uploadCompanyLogo below.
const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  companyName: z.string().min(1).max(160).optional(),
  vatNumber: z.string().regex(VAT_RE, 'Enter a valid VAT number').optional(),
  country: z.enum(COUNTRIES).optional(),
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  phone: z.string().regex(PHONE_RE, 'Enter a valid phone number with country code').optional(),
  linkedinUrl: z.string().regex(LINKEDIN_RE, 'Enter a valid LinkedIn profile URL').optional(),
  industry: z.enum(INDUSTRIES).optional(),
  state: z.string().min(1).max(120).optional(),
  taxNumber: z.string().min(1).max(40).optional(),
  companyAddress: z.string().min(1).max(300).optional(),
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

/** Self-service company logo upload. Reuses the same GridFS-backed image
 * storage as the CMS Media Library (server/src/cms/mediaStorage.js) so there
 * is no separate storage mechanism to maintain — but this route is
 * `requireAuth`-only (no `requireAdmin`), it stores under the caller's own
 * `uploadedBy`, and it never touches the shared cms/media library list; it
 * only ever writes the resulting path onto that one user's own record. */
export async function uploadCompanyLogo(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  if (!req.file) return res.status(422).json({ error: 'Attach an image in the "media" field.' })

  const type = sniffImageType(req.file.buffer)
  if (!type) return res.status(415).json({ error: 'Only JPEG, PNG, GIF and WebP images are accepted.' })

  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex')
  let media = await Media.findOne({ sha256 })
  if (!media) {
    const filename = `company-logo-${Date.now()}.${type.ext}`
    const gridFsId = await saveImage(req.file.buffer, filename, type.mime)
    media = await Media.create({
      filename,
      mimeType: type.mime,
      sizeBytes: req.file.size,
      sha256,
      title: 'Company logo',
      storage: { provider: 'gridfs', gridFsId },
      uploadedBy: req.userId,
    })
  }

  user.companyLogoUrl = media.path
  await user.save()
  res.json({ user: user.toSafeJSON() })
}
