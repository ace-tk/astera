import { api } from './api'

/** Admin API — all routes are gated server-side to admin users (403 otherwise). */
export const fetchAdminStats = () => api.get('/admin/stats').then((r) => r.stats)
export const fetchAdminUsers = () => api.get('/admin/users').then((r) => r.users)
export const fetchAdminReports = (owner) => api.get(`/admin/reports${owner ? `?owner=${owner}` : ''}`).then((r) => r.reports)
export const fetchAdminReport = (id) => api.get(`/admin/reports/${id}`).then((r) => r.report)
export const updateAdminReport = (id, patch) => api.patch(`/admin/reports/${id}`, patch).then((r) => r.report)
export const deleteAdminReport = (id) => api.del(`/admin/reports/${id}`)
