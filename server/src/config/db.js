import mongoose from 'mongoose'
import { env } from './env.js'

/**
 * Connect to MongoDB. The server can still boot in demo mode without a live
 * database — routes that need persistence will report it, but the app shell and
 * seeded demo data keep working.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 4000 })
    console.log('✓ MongoDB connected')
    return true
  } catch (err) {
    console.warn('⚠ MongoDB unavailable — running in demo mode:', err.message)
    return false
  }
}
