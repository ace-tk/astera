import jwt from 'jsonwebtoken'
import { z } from 'zod'
import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { env } from '../config/env.js'

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

const signToken = (id) => jwt.sign({ sub: String(id) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })

const dbReady = () => mongoose.connection.readyState === 1

export async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid signup details', issues: parsed.error.flatten() })
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable — running in demo mode' })

  const { name, email, password } = parsed.data
  const exists = await User.findOne({ email })
  if (exists) return res.status(409).json({ error: 'An account with that email already exists' })

  const passwordHash = await User.hashPassword(password)
  const user = await User.create({ name, email, passwordHash })
  res.status(201).json({ token: signToken(user._id), user: user.toSafeJSON() })
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid credentials' })
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable — running in demo mode' })

  const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash')
  if (!user || !(await user.verifyPassword(parsed.data.password))) {
    return res.status(401).json({ error: 'Incorrect email or password' })
  }
  res.json({ token: signToken(user._id), user: user.toSafeJSON() })
}

export async function me(req, res) {
  if (!dbReady()) return res.status(503).json({ error: 'Database unavailable' })
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: user.toSafeJSON() })
}
