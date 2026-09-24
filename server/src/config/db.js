import mongoose from 'mongoose'
import { env } from './env.js'

// Cached across invocations: on Vercel a warm serverless instance reuses this
// module scope, so a second request must reuse the existing connection (or
// in-flight connect attempt) instead of opening a new one against Atlas.
let connectPromise = null

// 4s was tuned for an already-warm connection, not a cold serverless
// instance's first-ever reach to Atlas (DNS SRV lookup + TLS handshake +
// server selection). On a cold start that routinely takes longer than 4s
// but well under this, so the earlier deadline was rejecting a connection
// that was actually about to succeed a moment later — the exact "first
// login fails, immediate retry works" report. This is generous enough for
// a genuine cold start while still failing well within Vercel's function
// budget (vercel.json: maxDuration 300s) if MongoDB is truly unreachable.
const SERVER_SELECTION_TIMEOUT_MS = 15000

// Invalidate the cache the moment the underlying connection actually drops —
// not just on a failed *attempt* (already handled in the .catch below).
// Without this, a connection that goes down after a prior successful
// connectDB() call (network blip, Atlas-side idle recycling, etc.) would
// leave `connectPromise` stuck holding a stale resolved(true) promise:
// mongoose.connection.readyState would correctly report "not 1" on the live
// check, but connectDB()'s second line would then blindly return that stale
// cached promise instead of re-checking anything, so every request would
// still be told the DB is up and go on to run a query against a closed
// connection. Registered once per process (mongoose's connection object is a
// singleton), so this fires for every drop for the life of the instance.
mongoose.connection.on('disconnected', () => {
  connectPromise = null
})
mongoose.connection.on('error', () => {
  connectPromise = null
})

/**
 * Connect to MongoDB, actually waiting for a cold start's connection to
 * complete rather than snapshotting a stale readyState. The server can still
 * boot without a live database for parts of the app that tolerate it, but
 * callers that need real persistence (auth, etc.) should await this directly
 * instead of only checking mongoose.connection.readyState — that check can
 * be stale mid-connect and falsely report "unavailable" on a first request.
 * Idempotent and safe to call on every request: already-connected short-
 * circuits immediately, an in-flight attempt is reused, and a previous
 * failure is retried rather than staying stuck.
 */
export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(true)
  if (connectPromise) return connectPromise

  mongoose.set('strictQuery', true)
  console.log('… MongoDB connection attempt starting (state:', mongoose.connection.readyState, ')')
  connectPromise = mongoose
    .connect(env.mongoUri, { serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS })
    .then(() => {
      console.log('✓ MongoDB connected')
      return true
    })
    .catch((err) => {
      console.warn('⚠ MongoDB connection failed:', err.message)
      connectPromise = null // let the next request retry rather than staying stuck
      return false
    })
  return connectPromise
}

/** Snapshot only — prefer `await connectDB()` wherever a request must not
 * proceed without a real connection; this is for callers that only want to
 * know the current state without triggering/awaiting a (re)connect. */
export function isDbConnected() {
  return mongoose.connection.readyState === 1
}
