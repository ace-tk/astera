import mongoose from 'mongoose'
import { z } from 'zod'
import { Blog } from '../models/Blog.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

const slugify = (s) =>
  `${s || 'post'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'post'

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

/* ------------------------------- Admin CRUD ------------------------------- */

export async function listBlogs(req, res) {
  if (needDB(res)) return
  const blogs = await Blog.find().sort('-publishedAt').limit(200)
  res.json({ blogs: blogs.map((b) => b.toClientJSON()) })
}

export async function getBlog(req, res) {
  if (needDB(res)) return
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Blog post not found' })
  res.json({ blog: blog.toClientJSON() })
}

const blogInputSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(400),
  content: z.string().max(20000).optional(),
  imageUrl: z.string().url(),
  author: z.string().max(120).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
})

export async function createBlog(req, res) {
  if (needDB(res)) return
  const parsed = blogInputSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid blog post', issues: parsed.error.flatten() })

  const base = slugify(parsed.data.title)
  let slug = base
  let n = 1
  // eslint-disable-next-line no-await-in-loop
  while (await Blog.findOne({ slug })) slug = `${base}-${++n}`

  const blog = await Blog.create({ ...parsed.data, slug, publishedAt: new Date() })
  res.status(201).json({ blog: blog.toClientJSON() })
}

const updateSchema = blogInputSchema.partial()

export async function updateBlog(req, res) {
  if (needDB(res)) return
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid update', issues: parsed.error.flatten() })

  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Blog post not found' })

  Object.entries(parsed.data).forEach(([k, v]) => { blog[k] = v })
  await blog.save()
  res.json({ blog: blog.toClientJSON() })
}

export async function deleteBlog(req, res) {
  if (needDB(res)) return
  const blog = await Blog.findByIdAndDelete(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Blog post not found' })
  res.json({ ok: true, id: req.params.id })
}
