import mongoose from 'mongoose'
import { CmsError } from './pageService.js'

/** 503 when Mongo isn't connected (same behaviour as the blog routes). */
export function needDB(res) {
  if (mongoose.connection.readyState === 1) return false
  res.status(503).json({ error: 'Database unavailable', code: 'DB_UNAVAILABLE' })
  return true
}

/** Route wrapper: DB check + CmsError -> stable JSON envelope. */
export const cms = (fn) => async (req, res, next) => {
  try {
    if (needDB(res)) return
    await fn(req, res)
  } catch (err) {
    if (err instanceof CmsError) {
      return res.status(err.status).json({ error: err.message, code: err.code, ...(err.issues ? { issues: err.issues } : {}) })
    }
    next(err)
  }
}

/** Read the optimistic-locking revision from `If-Match` or the body. */
export function expectedRev(req) {
  const header = req.get('If-Match')
  const raw = header != null ? header.replace(/"/g, '') : req.body?.rev
  const n = Number(raw)
  return raw != null && raw !== '' && Number.isInteger(n) ? n : null
}
