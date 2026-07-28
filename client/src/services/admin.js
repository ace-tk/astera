import { config } from '@/config'
import { api } from './api'

/** Admin API — all routes are gated server-side to admin users (403 otherwise). */
export const fetchAdminStats = () => api.get('/admin/stats').then((r) => r.stats)
export const fetchAdminUsers = () => api.get('/admin/users').then((r) => r.users)
export const fetchAdminReports = (owner) => api.get(`/admin/reports${owner ? `?owner=${owner}` : ''}`).then((r) => r.reports)
export const fetchAdminReport = (id) => api.get(`/admin/reports/${id}`).then((r) => r.report)
export const updateAdminReport = (id, patch) => api.patch(`/admin/reports/${id}`, patch).then((r) => r.report)
export const deleteAdminReport = (id) => api.del(`/admin/reports/${id}`)

/** Admin — Report Requests. */
export const fetchAdminRequests = (filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v))
  const qs = params.toString()
  return api.get(`/admin/report-requests${qs ? `?${qs}` : ''}`).then((r) => r.requests)
}
export const fetchAdminRequest = (id) => api.get(`/admin/report-requests/${id}`).then((r) => r.request)
export const updateAdminRequestStatus = (id, status) => api.patch(`/admin/report-requests/${id}`, { status }).then((r) => r.request)
export const createReportFromRequest = (id, payload) => api.post(`/admin/report-requests/${id}/report`, payload).then((r) => r.report)

/** Attachment URL for inline preview (used as <audio>/<video>/<iframe> src) — the
 * browser attaches no auth header for a plain src, so this returns a blob: URL
 * fetched with the bearer token instead. */
export async function fetchRequestAttachmentUrl(id, token) {
  const res = await fetch(`${config.apiUrl}/admin/report-requests/${id}/attachment`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw Object.assign(new Error('Could not load attachment'), { status: res.status })
  const blob = await res.blob()
  return { url: URL.createObjectURL(blob), contentType: res.headers.get('content-type') }
}

/** Trigger a real file download (bypasses the JSON-only `api` wrapper). */
export async function downloadRequestAttachment(id, filename, token) {
  const { url } = await fetchRequestAttachmentUrl(id, token)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'attachment'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
