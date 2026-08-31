import mongoose from 'mongoose'
import { env } from './env.js'

// Cached across invocations: on Vercel a warm serverless instance reuses this
// module scope, so a second request must reuse the existing connection (or
// in-flight connect attempt) instead of opening a new one against Atlas.
let connectPromise = null

/**
 * Connect to MongoDB. The server can still boot in demo mode without a live
 * database — routes that need persistence will report it, but the app shell and
 * seeded demo data keep working. Idempotent and safe to call on every request.
 */
export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true)
  if (connectPromise) return connectPromise

  mongoose.set('strictQuery', true)
  connectPromise = mongoose
    .connect(env.mongoUri, { serverSelectionTimeoutMS: 4000 })
    .then(() => {
      console.log('✓ MongoDB connected')
      return true
    })
    .catch((err) => {
      console.warn('⚠ MongoDB unavailable — running in demo mode:', err.message)
      connectPromise = null // let the next request retry rather than staying stuck
      return false
    })
  return connectPromise
}
