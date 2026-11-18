import { Redirect } from '../models/Redirect.js'
import { Page } from '../models/Page.js'
import { CmsError } from './errors.js'
import { normalizePath } from './util.js'

/**
 * Manual 301 redirects managed by admins (the `Redirect` collection also holds the automatic ones that are written
 * when a published page changes address or is removed). One flat table: every `from` points straight at its FINAL
 * target, so there are never chains, and loops are refused.
 */

// Addresses that belong to the app or the server, never to editorial content.
const RESERVED = ['/api', '/app', '/login', '/register', '/forgot', '/verify-email', '/assets', '/fonts', '/_pre']
const PATH_RE = /^\/[A-Za-z0-9\-._~%/]*$/
const MAX_HOPS = 8

const isReserved = (p) => RESERVED.some((r) => p === r || p.startsWith(`${r}/`))

function cleanPath(value, label) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw.startsWith('/') || raw.startsWith('//')) throw new CmsError(422, 'INVALID_PATH', `${label} must be an address on this site starting with / (for example /services/guides/old-page).`)
  const p = normalizePath(raw)
  if (p.length > 300 || !PATH_RE.test(p)) throw new CmsError(422, 'INVALID_PATH', `${label} contains characters that are not allowed in an address.`)
  return p
}

export const toJSON = (r) => ({ id: String(r._id), from: r.from, to: r.to, status: r.status, source: r.source, createdAt: r.createdAt })

export async function listRedirects({ to } = {}) {
  const filter = to ? { to: normalizePath(to) } : {}
  return (await Redirect.find(filter).sort({ from: 1 })).map(toJSON)
}

/** Everything the public site needs (the browser 404 screen and the release build): from → to, status. */
export async function publicRedirects() {
  return (await Redirect.find({}).sort({ from: 1 }).select('from to status')).map((r) => ({ from: r.from, to: r.to, status: r.status }))
}

/** Follows `to` through the table until it reaches an address that is not itself redirected. */
async function finalTarget(start, origin) {
  let at = start
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    if (at === origin) throw new CmsError(409, 'REDIRECT_LOOP', 'This redirect would send visitors in a circle.')
    const next = await Redirect.findOne({ from: at })
    if (!next) return at
    at = next.to
  }
  throw new CmsError(409, 'REDIRECT_LOOP', 'This redirect chain is too long or circular.')
}

export async function createRedirect({ from, to }) {
  const f = cleanPath(from, 'The old address')
  const t = cleanPath(to, 'The new address')
  if (f === '/') throw new CmsError(422, 'INVALID_PATH', 'The home page cannot be redirected.')
  if (f === t) throw new CmsError(422, 'INVALID_REDIRECT', 'The old and the new address are the same.')
  if (isReserved(f)) throw new CmsError(422, 'RESERVED_PATH', 'This address belongs to the application and cannot be redirected.')
  if (isReserved(t)) throw new CmsError(422, 'RESERVED_PATH', 'Redirects to the application area are not allowed.')
  if (await Page.exists({ path: f, status: 'published', live: { $ne: null } })) {
    throw new CmsError(409, 'PAGE_EXISTS', 'A published page lives at the old address. Unpublish or remove that page first (Remove page → redirect), or set a Canonical URL on it instead.')
  }
  const target = await finalTarget(t, f)
  // everything that already pointed at `from` now goes straight to the final target (no chains)
  await Redirect.updateMany({ to: f }, { $set: { to: target } })
  const saved = await Redirect.findOneAndUpdate({ from: f }, { from: f, to: target, status: 301, source: 'manual' }, { upsert: true, new: true, setDefaultsOnInsert: true })
  return toJSON(saved)
}

export async function deleteRedirect(id) {
  const found = await Redirect.findByIdAndDelete(id).catch(() => null)
  if (!found) throw new CmsError(404, 'NOT_FOUND', 'Redirect not found.')
  return toJSON(found)
}
