import dotenv from 'dotenv'

dotenv.config()

/**
 * Single source of truth for environment config. Fail loud in production if a
 * required secret is missing, but stay forgiving in development so the demo
 * pipeline runs without any third-party keys.
 */
const required = ['JWT_SECRET']

export const env = {
  port: Number(process.env.PORT) || 5050,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/astera',
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiKey: process.env.OPENAI_API_KEY || '',
  deepgramKey: process.env.DEEPGRAM_API_KEY || '',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
}

export function assertEnv() {
  if (!env.isProd) return
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(`Missing required env vars in production: ${missing.join(', ')}`)
  }
}
