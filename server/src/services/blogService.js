import { z } from 'zod'
import { Blog } from '../models/Blog.js'
import { Media } from '../models/Media.js'
import { validateMarkdown } from '../cms/markdown.js'
import { inlineText } from '../cms/schemas.js'
import { CmsError } from '../cms/errors.js'

/*
 * Blog content workflow. The Admin edits a DRAFT; nothing reaches the public (live) fields until
 * Publish. The public routes only ever read the live fields of published posts.
 */

const isId = (id) => /^[a-f0-9]{24}$/i.test(String(id))
const MEDIA_PATH = /^\/api\/media\/([a-f0-9]{24})\/[^/\s?#]+$/i

const slugify = (s) => `${s || 'post'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80) || 'post'

/** One version of a post (what a draft or the live copy holds). Strict: nothing else can be stored. */
const versionSchema = z
  .object({
    title: inlineText(200, 1),
    excerpt: inlineText(400),
    content: z.string().max(20000, 'The text is too long (20,000 characters at most).'),
    contentFormat: z.enum(['text', 'markdown']),
    imageUrl: z.string().trim().max(600),
    author: inlineText(120),
    featured: z.boolean(),
    publishedAt: z.date(),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.contentFormat !== 'markdown') return
    for (const e of validateMarkdown(v.content).errors) {
      ctx.addIssue({ code: 'custom', path: ['content'], message: e.line ? `Line ${e.line}: ${e.message}` : e.message })
    }
  })

// What an admin may send when saving a draft (any subset).
const patchSchema = z
  .object({
    title: z.string(), excerpt: z.string(), content: z.string(), contentFormat: z.enum(['text', 'markdown']),
    imageUrl: z.string(), author: z.string(), featured: z.boolean(), publishedAt: z.coerce.date(),
  })
  .partial()
  .strict()

const fail = (message, issues) => new CmsError(422, 'VALIDATION_FAILED', message, issues)

/** The cover image is an absolute web address (existing posts) or an image from the CMS media library. */
async function checkImage(url) {
  if (!url) return
  if (url.startsWith('/')) {
    const m = url.match(MEDIA_PATH)
    if (!m || !(await Media.exists({ _id: m[1] }))) throw fail('Choose an image from the media library.', { fieldErrors: { imageUrl: ['That image does not exist.'] } })
    return
  }
  let ok = false
  try { ok = ['http:', 'https:'].includes(new URL(url).protocol) } catch { /* not a URL */ }
  if (!ok) throw fail('The image must be a web address (https://…) or an image from the media library.', { fieldErrors: { imageUrl: ['Not a valid image address.'] } })
}

async function validateVersion(v) {
  const parsed = versionSchema.safeParse(v)
  if (!parsed.success) throw fail('The post is not valid.', parsed.error.flatten())
  await checkImage(parsed.data.imageUrl)
  return parsed.data
}

async function load(id) {
  if (!isId(id)) throw new CmsError(404, 'NOT_FOUND', 'Blog post not found')
  const blog = await Blog.findById(id)
  if (!blog) throw new CmsError(404, 'NOT_FOUND', 'Blog post not found')
  return blog
}

async function uniqueSlug(title) {
  const base = slugify(title)
  let slug = base
  let n = 1
  // eslint-disable-next-line no-await-in-loop
  while (await Blog.exists({ slug })) slug = `${base}-${++n}`
  return slug
}

export const listPosts = () => Blog.find().sort('-updatedAt').limit(200)
export const getPost = load

/** Create a DRAFT. Nothing is public until it is published. */
export async function createPost(input, userId) {
  const patch = patchSchema.safeParse(input || {})
  if (!patch.success) throw fail('Invalid blog post', patch.error.flatten())
  const version = await validateVersion({
    title: '', excerpt: '', content: '', contentFormat: 'markdown', imageUrl: '', author: 'ATOOPV Team', featured: false, publishedAt: new Date(),
    ...patch.data,
  })
  const blog = await Blog.create({
    title: version.title, slug: await uniqueSlug(version.title), published: false, publishedAt: version.publishedAt,
    draft: { ...version, savedAt: new Date(), savedBy: userId },
  })
  return blog
}

/** Save the working copy. Never touches the live version. */
export async function saveDraft(id, input, { expectedRev, userId } = {}) {
  const blog = await load(id)
  if (expectedRev != null && Number(expectedRev) !== blog.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'This post was changed by someone else. Reload to see the latest version.')
  }
  const patch = patchSchema.safeParse(input || {})
  if (!patch.success) throw fail('Invalid update', patch.error.flatten())
  const next = await validateVersion({ ...blog.workingVersion(), ...patch.data })
  blog.draft = { ...next, savedAt: new Date(), savedBy: userId }
  blog.rev += 1
  await blog.save()
  return blog
}

/** Make the working copy the live version. */
export async function publish(id) {
  const blog = await load(id)
  const v = await validateVersion(blog.workingVersion())
  const missing = []
  if (!v.excerpt) missing.push('a short summary')
  if (!v.imageUrl) missing.push('a cover image')
  if (missing.length) {
    throw new CmsError(422, 'PUBLISH_INCOMPLETE', `Add ${missing.join(' and ')} before publishing.`, { missing })
  }
  Object.assign(blog, v, { published: true, everPublished: true, draft: null })
  blog.rev += 1
  await blog.save()
  return blog
}

/** Take the post offline. The working copy is kept, so nothing is lost and it can be published again. */
export async function unpublish(id, userId) {
  const blog = await load(id)
  if (!blog.published) throw new CmsError(409, 'NOT_PUBLISHED', 'This post is not published.')
  blog.draft = blog.draft || { ...blog.liveVersion(), savedAt: new Date(), savedBy: userId }
  blog.published = false
  blog.rev += 1
  await blog.save()
  return blog
}

/** Throw away unpublished edits and go back to the version that was last published. */
export async function discardDraft(id) {
  const blog = await load(id)
  if (!blog.everPublished && !blog.published) throw new CmsError(409, 'NEVER_PUBLISHED', 'This post has never been published, so there is nothing to go back to.')
  blog.draft = null
  blog.rev += 1
  await blog.save()
  return blog
}

/** Permanent delete: only for a post that was never published. */
export async function removePost(id) {
  const blog = await load(id)
  if (blog.published || blog.everPublished) {
    throw new CmsError(409, 'POST_PUBLISHED', 'A post that has been published cannot be deleted. Unpublish it to take it offline.')
  }
  await blog.deleteOne()
}

/** The working copy in the PUBLIC shape, so the existing Blog page renders it as it will look. */
export async function previewOf(id) {
  const blog = await load(id)
  return { id: String(blog._id), slug: blog.slug, ...blog.workingVersion(), published: false, preview: true }
}
