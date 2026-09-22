import mongoose from 'mongoose'
import { Blog } from '../models/Blog.js'
import * as posts from '../services/blogService.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

/**
 * Public — the single card the Homepage's Blog section renders. Prefers a
 * post explicitly marked `featured`; falls back to the latest published post
 * so the section isn't empty just because nothing's been flagged featured
 * yet. Returns `{ blog: null }` (not a 404) when there's genuinely nothing to
 * show — an empty blog list isn't an error, it's a valid empty state.
 */
export async function getFeaturedBlog(req, res) {
  if (needDB(res)) return
  const featured = await Blog.findOne({ published: true, featured: true }).sort('-publishedAt')
  const blog = featured || (await Blog.findOne({ published: true }).sort('-publishedAt'))
  res.json({ blog: blog ? blog.toClientJSON() : null })
}

/** Public — a single post by slug, for the Read More destination. Drafts 404
 * the same as a genuinely missing post, so unpublished content never leaks. */
export async function getBlogBySlug(req, res) {
  if (needDB(res)) return
  const blog = await Blog.findOne({ slug: req.params.slug, published: true })
  if (!blog) return res.status(404).json({ error: 'Blog post not found' })
  res.json({ blog: blog.toClientJSON() })
}

/* ------------------------------- Admin (draft → preview → publish) ------------------------------- */
// Routes wrap these with cms() (DB check + CmsError → JSON). See services/blogService.js.

const rev = (req) => {
  const raw = req.get('If-Match')?.replace(/"/g, '') ?? req.body?.rev
  const n = Number(raw)
  return raw != null && raw !== '' && Number.isInteger(n) ? n : null
}
const send = (res, blog, status = 200) => res.status(status).json({ blog: blog.toAdminJSON() })

export const listBlogs = async (req, res) => res.json({ blogs: (await posts.listPosts()).map((b) => b.toAdminJSON()) })
export const getBlog = async (req, res) => send(res, await posts.getPost(req.params.id))
export const createBlog = async (req, res) => send(res, await posts.createPost(req.body, req.adminUser._id), 201)
export const updateBlog = async (req, res) => {
  const { rev: _ignored, ...patch } = req.body || {}
  send(res, await posts.saveDraft(req.params.id, patch, { expectedRev: rev(req), userId: req.adminUser._id }))
}
export const publishBlog = async (req, res) => send(res, await posts.publish(req.params.id))
export const unpublishBlog = async (req, res) => send(res, await posts.unpublish(req.params.id, req.adminUser._id))
export const discardBlogDraft = async (req, res) => send(res, await posts.discardDraft(req.params.id))
export const previewBlog = async (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ blog: await posts.previewOf(req.params.id) })
}
export const deleteBlog = async (req, res) => {
  await posts.removePost(req.params.id)
  res.json({ ok: true, id: req.params.id })
}
