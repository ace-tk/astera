import jwt from 'jsonwebtoken'
import { env, isAdminUser } from '../config/env.js'
import { User } from '../models/User.js'

/** Wrap async route handlers so rejected promises hit the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/** Verify the Bearer token and attach the decoded user id to the request. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.userId = jwt.verify(token, env.jwtSecret).sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}

/** Gate a route to admins. Runs after requireAuth. 403 for everyone else. */
export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(401).json({ error: 'Authentication required' })
    if (!isAdminUser(user)) return res.status(403).json({ error: 'Admin access required' })
    req.adminUser = user
    next()
  } catch (err) {
    next(err)
  }
}

/** Consistent JSON error envelope; hides stack traces in production. */
export function errorHandler(err, req, res, _next) {
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({
    error: err.publicMessage || (status >= 500 ? 'Something went wrong' : err.message),
    ...(env.isProd ? {} : { detail: err.message }),
  })
}

/** 404 fallthrough for unknown API routes. */
export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
}
