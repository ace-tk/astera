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
