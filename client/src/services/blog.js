import { api } from './api'

/** Public — the Homepage's Blog section reads only this. No auth required. */
export const fetchFeaturedBlog = () => api.get('/blog/featured').then((r) => r.blog)

/** Public — the Read More destination. Only published posts; drafts are 404. */
export const fetchBlogBySlug = (slug) => api.get(`/blog/${slug}`).then((r) => r.blog)

/** Admin preview — the working copy in the same shape the public page renders. */
export const fetchBlogPreview = (id) => api.get(`/admin/blogs/${id}/preview`).then((r) => r.blog)

/* ---------------------------------- admin ---------------------------------- */

const A = '/admin/blogs'
export const fetchAdminBlogs = () => api.get(A).then((r) => r.blogs)
export const fetchAdminBlog = (id) => api.get(`${A}/${id}`).then((r) => r.blog)
export const createAdminBlog = (body) => api.post(A, body).then((r) => r.blog)
export const saveAdminBlogDraft = (id, patch, rev) => api.patch(`${A}/${id}`, { ...patch, rev }).then((r) => r.blog)
export const publishAdminBlog = (id) => api.post(`${A}/${id}/publish`).then((r) => r.blog)
export const unpublishAdminBlog = (id) => api.post(`${A}/${id}/unpublish`).then((r) => r.blog)
export const discardAdminBlogDraft = (id) => api.post(`${A}/${id}/discard-draft`).then((r) => r.blog)
export const deleteAdminBlog = (id) => api.del(`${A}/${id}`)
