import { config } from '@/config'

/**
 * Tiny fetch wrapper around the Astera API. Auto-attaches the session token,
 * parses JSON, and throws a normalized error. Kept dependency-free on purpose.
 */

// The active session token, set once by AuthContext. Requests attach it
// automatically so callers never thread the token through by hand.
let authToken = null
export function setAuthToken(token) {
  authToken = token || null
}

// AuthContext subscribes here so an expired/invalid session (a 401 on an
// authenticated request) can clear itself app-wide. Login failures don't fire
// this — those requests carry no token, so they're handled locally instead.
const unauthorizedListeners = new Set()
export function onUnauthorized(fn) {
  unauthorizedListeners.add(fn)
  return () => unauthorizedListeners.delete(fn)
}

async function request(path, { method = 'GET', body, token } = {}) {
  const bearer = token ?? authToken
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: {
      // Let the browser set the multipart boundary for FormData uploads.
      ...(isForm || body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401 && bearer) unauthorizedListeners.forEach((fn) => fn())
    throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
