import { config } from '@/config'

/**
 * Tiny fetch wrapper around the Astera API. Attaches the auth token, parses
 * JSON, and throws a normalized error. Kept dependency-free on purpose.
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
}
