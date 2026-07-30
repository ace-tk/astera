import { api } from './api'

/** Public — the Homepage's Blog section reads only this. No auth required. */
export const fetchFeaturedBlog = () => api.get('/blog/featured').then((r) => r.blog)

/** Public — the Read More destination. */
export const fetchBlogBySlug = (slug) => api.get(`/blog/${slug}`).then((r) => r.blog)
