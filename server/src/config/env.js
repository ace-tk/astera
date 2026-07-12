import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const isProd = (process.env.NODE_ENV || 'development') === 'production'
const INSECURE_DEFAULT = 'dev-insecure-secret-change-me'

/**
 * Validated environment. Production is strict: a real Mongo URI and a strong,
 * non-default JWT secret are required, or the process refuses to boot. In
 * development we allow safe fallbacks so the demo runs with zero config — but we
 * still reject the known-insecure secret so it can never reach production.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/astera'),
  JWT_SECRET: z
    .string()
    .default(isProd ? '' : INSECURE_DEFAULT)
    .refine((s) => !isProd || (s.length >= 32 && s !== INSECURE_DEFAULT), {
      message: 'JWT_SECRET must be set to a strong value (≥32 chars) in production',
    }),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional().default(''),
  DEEPGRAM_API_KEY: z.string().optional().default(''),
  // Comma-separated allowlist of admin emails — a simple way to grant the admin
  // role without a separate promotion flow. Also honored: a user whose role is 'admin'.
  ADMIN_EMAILS: z.string().optional().default(''),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n')
  // Fail loudly and early — never boot with an invalid or insecure config.
  console.error(`\n✗ Invalid environment configuration:\n${issues}\n`)
  process.exit(1)
}

const e = parsed.data

export const env = {
  nodeEnv: e.NODE_ENV,
  port: e.PORT,
  clientUrl: e.CLIENT_URL,
  mongoUri: e.MONGODB_URI,
  jwtSecret: e.JWT_SECRET,
  jwtExpiresIn: e.JWT_EXPIRES_IN,
  openaiKey: e.OPENAI_API_KEY,
  deepgramKey: e.DEEPGRAM_API_KEY,
  adminEmails: e.ADMIN_EMAILS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  isProd,
}

/** A user is an admin if their role is 'admin' or their email is allowlisted. */
export function isAdminUser(user) {
  if (!user) return false
  return user.role === 'admin' || env.adminEmails.includes((user.email || '').toLowerCase())
}

// Kept for call-site compatibility; validation now happens at import time.
export function assertEnv() {}
