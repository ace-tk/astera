import { api } from './api'

/** Reject if the CMS API doesn't answer quickly, so a sleeping/unreachable
 * backend falls back to bundled content instead of leaving a blank page. */
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('CMS request timed out'), { status: 0, timeout: true })), ms)),
  ])

/* ---------------------------------- public --------------------------------- */

/** Resolves to `{ page }` or `{ redirect }`; rejects with status 404 when there is no live page. */
export const fetchCmsPage = (path) => withTimeout(api.get(`/cms/pages?path=${encodeURIComponent(path)}`))

export const fetchCmsIndex = () => api.get('/cms/index').then((r) => r.pages)

/** Menu + every side navigation + the light page index, in one request. */
export const fetchNavigation = () => withTimeout(api.get('/cms/navigation'), 6000)

export const fetchCmsMenu = (key) => api.get(`/cms/menus/${key}`).then((r) => r.menu)

/* ---------------------------------- admin ---------------------------------- */

const A = '/admin/cms'

export const fetchTemplates = () => api.get(`${A}/templates`).then((r) => r.templates)

export const fetchAdminPages = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()
  return api.get(`${A}/pages${qs ? `?${qs}` : ''}`).then((r) => r.pages)
}
export const fetchAdminPage = (id) => api.get(`${A}/pages/${id}`).then((r) => r.page)
export const fetchPagePreview = (id) => withTimeout(api.get(`${A}/pages/${id}/preview`)).then((r) => r.page)

export const createAdminPage = (body) => api.post(`${A}/pages`, body).then((r) => r.page)
/** Saves the DRAFT. Pass the `rev` you loaded to get conflict protection. */
export const saveAdminDraft = (id, patch, rev) => api.patch(`${A}/pages/${id}`, { ...patch, ...(rev != null ? { rev } : {}) }).then((r) => r.page)
export const publishAdminPage = (id) => api.post(`${A}/pages/${id}/publish`).then((r) => r.page)
export const unpublishAdminPage = (id) => api.post(`${A}/pages/${id}/unpublish`).then((r) => r.page)
export const discardAdminDraft = (id) => api.post(`${A}/pages/${id}/discard-draft`).then((r) => r.page)
export const duplicateAdminPage = (id) => api.post(`${A}/pages/${id}/duplicate`).then((r) => r.page)
export const archiveAdminPage = (id, redirectTo) =>
  api.del(`${A}/pages/${id}${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`).then((r) => r.page)
export const deleteAdminPagePermanently = (id) => api.del(`${A}/pages/${id}?permanent=1`)
export const restoreAdminPage = (id) => api.post(`${A}/pages/${id}/restore`).then((r) => r.page)
export const fetchPageRevisions = (id) => api.get(`${A}/pages/${id}/revisions`).then((r) => r.revisions)
export const restorePageRevision = (id, seq) => api.post(`${A}/pages/${id}/revisions/${seq}/restore`).then((r) => r.page)
export const fetchPageUsages = (id) => api.get(`${A}/pages/${id}/usages`).then((r) => r.usages)

export const fetchAdminMenu = (key) => api.get(`${A}/menus/${key}`).then((r) => r.menu)
export const saveAdminMenuDraft = (key, items, rev) => api.patch(`${A}/menus/${key}`, { items, ...(rev != null ? { rev } : {}) }).then((r) => r.menu)
export const publishAdminMenu = (key) => api.post(`${A}/menus/${key}/publish`).then((r) => r.menu)
export const discardAdminMenu = (key) => api.post(`${A}/menus/${key}/discard`).then((r) => r.menu)
export const initializeAdminMenu = (key, items) => api.post(`${A}/menus/${key}/initialize`, { items }).then((r) => r.menu)

export const fetchSectionNavList = () => api.get(`${A}/section-navs`).then((r) => r.sections)
export const fetchSectionNav = (section) => api.get(`${A}/section-navs/${section}`).then((r) => r.nav)
export const saveSectionNavDraft = (section, entries, rev) => api.patch(`${A}/section-navs/${section}`, { entries, ...(rev != null ? { rev } : {}) }).then((r) => r.nav)
export const initializeSectionNav = (section, entries) => api.post(`${A}/section-navs/${section}/initialize`, { entries }).then((r) => r.nav)
export const publishSectionNav = (section) => api.post(`${A}/section-navs/${section}/publish`).then((r) => r.nav)
export const discardSectionNav = (section) => api.post(`${A}/section-navs/${section}/discard`).then((r) => r.nav)

/** The public URL a page lives at, and the same URL in preview mode. */
export const previewUrl = (page) => `${page.path}?preview=${page.id}`

/* ------------------------------ media library ------------------------------ */

export const fetchMediaLibrary = () => api.get(`${A}/media`).then((r) => r.media)
export function uploadMediaImage(file, alt = '') {
  const body = new FormData()
  if (alt) body.append('alt', alt)
  body.append('file', file)
  return api.post(`${A}/media`, body).then((r) => r.media)
}
