import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../models/User.js'

const dbReady = () => mongoose.connection.readyState === 1

// MVP profile edit — name only. Email stays immutable here.
const updateSchema = z.object({ name: z.string().min(1).max(80).optional() })

/** Update the signed-in user's own profile. */
export async function updateMe(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid profile update', issues: parsed.error.flatten() })

  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })

  if (parsed.data.name !== undefined) user.name = parsed.data.name
  await user.save()
  res.json({ user: user.toSafeJSON() })
}
