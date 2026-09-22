import { api } from './api'

/** Client Reports — PDFs an admin uploads for one client. Ownership is enforced by the server. */

// Client
export const fetchMyClientReports = () => api.get('/client-reports').then((r) => r.reports)
export const fetchMyClientReportFile = (id) => api.blob(`/client-reports/${id}/file`)

// Admin
export const fetchAdminClientReports = (customerId) => api.get(`/admin/customers/${customerId}/client-reports`).then((r) => r.reports)
export const fetchAdminClientReportFile = (id) => api.blob(`/admin/client-reports/${id}/file`)
export const deleteAdminClientReport = (id) => api.del(`/admin/client-reports/${id}`)
export function uploadAdminClientReport(customerId, { file, title }) {
  const body = new FormData()
  body.append('title', title || '')
  body.append('file', file)
  return api.post(`/admin/customers/${customerId}/client-reports`, body).then((r) => r.report)
}

/** Client-side pre-check for a friendlier message; the server is the real gate. */
export const MAX_REPORT_MB = 25
export function checkReportFile(file) {
  if (!file) return 'Choose a PDF file.'
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) return 'Only PDF files can be uploaded.'
  if (file.size > MAX_REPORT_MB * 1024 * 1024) return `That file is too large. The limit is ${MAX_REPORT_MB} MB.`
  return ''
}

export const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)
