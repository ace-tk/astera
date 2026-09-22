import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A blog post (public: the Homepage's Blog card and /blog/:slug).
 *
 * The top-level fields are the LIVE version — exactly what the public API serves, and exactly what
 * every pre-existing post already is. Editing in the Admin panel happens on `draft` (the working
 * copy); nothing reaches the live fields until the post is published, so a draft can never
 * replace live content. `published: false` hides the live version from the public.
 */
const draftSchema = new Schema(
  {
    title: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    contentFormat: { type: String, enum: ['text', 'markdown'], default: 'markdown' },
    imageUrl: { type: String, default: '' },
    author: { type: String, default: 'ATOOPV Team' },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
)

const blogSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, index: true },
    // Required to PUBLISH (checked by the publish rule), not to save a draft.
    excerpt: { type: String, default: '', maxlength: 400 },
    content: { type: String, maxlength: 20000 },
    // Existing posts are plain text (shown with line breaks preserved); posts written in the Admin
    // editor are Markdown (the CMS's whitelisted formatting).
    contentFormat: { type: String, enum: ['text', 'markdown'], default: 'text' },
    imageUrl: { type: String, default: '' },
    author: { type: String, default: 'ATOOPV Team' },
    // Homepage shows the featured post if one exists, else the latest
    // published one — see getFeaturedBlog. Unpublished posts are drafts.
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    // Set on first publish. Only a never-published post may be deleted for good.
    everPublished: { type: Boolean, default: false },
    draft: { type: draftSchema, default: null },
    // Optimistic locking, like CMS pages.
    rev: { type: Number, default: 1 },
  },
  { timestamps: true },
)

const LIVE_FIELDS = ['title', 'excerpt', 'content', 'contentFormat', 'imageUrl', 'author', 'featured', 'publishedAt']

/** The live version as a plain object. */
blogSchema.methods.liveVersion = function () {
  return Object.fromEntries(LIVE_FIELDS.map((k) => [k, this[k]]))
}

/** What an admin edits: the saved draft, or (for a post never edited in the Admin) its live version. */
blogSchema.methods.workingVersion = function () {
  if (!this.draft) return this.liveVersion()
  const d = this.draft.toObject()
  return Object.fromEntries(LIVE_FIELDS.map((k) => [k, d[k]]))
}

blogSchema.methods.status = function () {
  if (this.published) return 'published'
  return this.everPublished ? 'unpublished' : 'draft'
}

const sameVersion = (a, b) => LIVE_FIELDS.every((k) => (k === 'publishedAt' ? new Date(a[k]).getTime() === new Date(b[k]).getTime() : (a[k] ?? '') === (b[k] ?? '')))

blogSchema.methods.hasUnpublishedChanges = function () {
  return this.published && Boolean(this.draft) && !sameVersion(this.workingVersion(), this.liveVersion())
}

/** The public shape: LIVE fields only. Never includes the draft or any admin bookkeeping. */
blogSchema.methods.toClientJSON = function () {
  return {
    id: String(this._id),
    title: this.title,
    slug: this.slug,
    excerpt: this.excerpt,
    content: this.content,
    contentFormat: this.contentFormat,
    imageUrl: this.imageUrl,
    author: this.author,
    featured: this.featured,
    published: this.published,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

/** Admin list/detail: the working copy plus what is live and where the post stands. */
blogSchema.methods.toAdminJSON = function () {
  return {
    id: String(this._id),
    slug: this.slug,
    status: this.status(),
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    everPublished: this.everPublished || this.published,
    rev: this.rev,
    working: this.workingVersion(),
    live: this.published ? this.liveVersion() : null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

export const Blog = mongoose.model('Blog', blogSchema)
