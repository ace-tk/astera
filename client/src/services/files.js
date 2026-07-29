import { api } from './api'

/**
 * Admin — All Files. A browsing layer over existing Reports + Report Request
 * attachments (see server/src/controllers/fileController.js) — no separate
 * file storage exists; ids are prefixed (`report:<id>` / `attachment:<id>`)
 * so a single flat list/detail/action surface can address either kind.
 */
export const fetchAdminFiles = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
  return api.get(`/admin/files${qs ? `?${qs}` : ''}`)
}
export const fetchAdminFileStats = () => api.get('/admin/files/stats').then((r) => r.stats)
export const fetchAdminFile = (id, opts = {}) => {
  const qs = new URLSearchParams(Object.entries(opts).filter(([, v]) => v)).toString()
  return api.get(`/admin/files/${encodeURIComponent(id)}${qs ? `?${qs}` : ''}`)
}
export const renameAdminFile = (id, name) => api.patch(`/admin/files/${encodeURIComponent(id)}/rename`, { name }).then((r) => r.file)
export const archiveAdminFile = (id, archived) => api.patch(`/admin/files/${encodeURIComponent(id)}/archive`, { archived }).then((r) => r.file)
export const bulkArchiveAdminFiles = (ids, archived) => api.patch('/admin/files/bulk-archive', { ids, archived })
export const deleteAdminFile = (id) => api.del(`/admin/files/${encodeURIComponent(id)}`)
export const bulkDeleteAdminFiles = (ids) => api.del('/admin/files/bulk-delete', { body: { ids } })
export const uploadAdminFile = (formData) => api.post('/admin/files/upload', formData).then((r) => r.file)
