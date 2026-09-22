import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { PAGE_STATUSES } from '../cms/constants.js'
import { versionFingerprint } from '../cms/util.js'

const { Schema } = mongoose

const seoSchema = new Schema(
  {
    title: { type: String, default: '', maxlength: 120 },
    description: { type: String, default: '', maxlength: 320 },
    canonicalPath: { type: String, default: '', maxlength: 200 },
    noindex: { type: Boolean, default: false },
  },
  { _id: false },
)

/**
 * One editable snapshot of a page. `Page.draft` is the working copy an admin
 * edits; `Page.live` is a frozen copy created by Publish — the ONLY thing the
 * public API can ever return.
 */
const versionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, maxlength: 100 },
    content: { type: Schema.Types.Mixed, default: () => ({}) },
    seo: { type: seoSchema, default: () => ({}) },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

const pageSchema = new Schema(
  {
    templateKey: { type: String, required: true, index: true },
    section: { type: String, required: true },
    // Canonical URL and slug of the CURRENT public identity: the live version's
    // once published, the draft's until then.
    slug: { type: String, required: true },
    path: { type: String, required: true },
    isHub: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    navLabel: { type: String, default: '', maxlength: 120 },
    showInNav: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    // Where this page appears in the main mega menu. Placement is page metadata (it
    // takes effect as soon as the page is published), not part of a content version.
    menu: {
      menuId: { type: String, default: null },
      groupId: { type: String, default: null },
    },
    // Teaser for listing cards, derived from the live body when the page is published.
    excerpt: { type: String, default: '' },

    status: { type: String, enum: PAGE_STATUSES, default: 'draft', index: true },
    draft: { type: versionSchema, required: true },
    live: { type: versionSchema, default: null },
    // Bumps on every draft save (optimistic locking); `publishedRev` is the rev
    // that was last published, so unpublished changes are `rev !== publishedRev`.
    // Content fingerprints, maintained on save, so list screens can tell whether a
    // draft differs from live without loading either body.
    draftHash: { type: String, default: '' },
    liveHash: { type: String, default: '' },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: null },
    publishedAt: Date,
    firstPublishedAt: Date,

    legacy: {
      source: { type: String, default: '' },
      file: { type: String, default: '' },
      sourceUrl: { type: String, default: '' },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, minimize: false },
)

// A canonical path can only be held by one non-archived page.
pageSchema.index(
  { path: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['draft', 'published'] } } },
)
pageSchema.index({ section: 1, order: 1 })
pageSchema.index({ templateKey: 1, status: 1 })

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex')

pageSchema.pre('save', function (next) {
  if (this.isModified('draft') || this.isNew) this.draftHash = md5(versionFingerprint(this.draft))
  if (this.isModified('live') || this.isNew) this.liveHash = this.live ? md5(versionFingerprint(this.live)) : ''
  next()
})

// Compared by content, not by counter, so "Discard changes" (or saving an edit
// back to what it was) correctly reads as "nothing to publish".
pageSchema.methods.hasUnpublishedChanges = function () {
  return this.status === 'published' && this.draftHash !== this.liveHash
}

/** Light shape for list screens — no bodies. */
pageSchema.methods.toSummaryJSON = function () {
  return {
    id: String(this._id),
    templateKey: this.templateKey,
    section: this.section,
    slug: this.slug,
    path: this.path,
    title: this.draft?.title,
    liveTitle: this.live?.title || null,
    status: this.status,
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    navLabel: this.navLabel,
    showInNav: this.showInNav,
    order: this.order,
    tags: this.tags,
    menu: { menuId: this.menu?.menuId || null, groupId: this.menu?.groupId || null },
    publishedAt: this.publishedAt,
    updatedAt: this.updatedAt,
    isLegacy: Boolean(this.legacy?.file),
  }
}

/** Everything an admin needs to manage the page (includes the draft). */
pageSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    id: String(o._id),
    templateKey: o.templateKey,
    section: o.section,
    slug: o.slug,
    path: o.path,
    isHub: o.isHub,
    order: o.order,
    navLabel: o.navLabel,
    showInNav: o.showInNav,
    tags: o.tags,
    menu: { menuId: o.menu?.menuId || null, groupId: o.menu?.groupId || null },
    status: o.status,
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    rev: o.rev,
    publishedRev: o.publishedRev,
    publishedAt: o.publishedAt,
    firstPublishedAt: o.firstPublishedAt,
    draft: o.draft,
    live: o.live,
    legacy: o.legacy,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}

/** The public shape: LIVE content only. Never includes the draft. */
pageSchema.methods.toPublicJSON = function () {
  const l = this.live
  return {
    id: String(this._id),
    templateKey: this.templateKey,
    section: this.section,
    slug: l.slug,
    path: this.path,
    isHub: this.isHub,
    navLabel: this.navLabel,
    order: this.order,
    title: l.title,
    content: l.content,
    seo: l.seo,
    publishedAt: this.publishedAt,
    updatedAt: l.savedAt,
  }
}

export const Page = mongoose.model('Page', pageSchema)
