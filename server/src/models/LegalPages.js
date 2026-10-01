import mongoose from 'mongoose'

const { Schema } = mongoose

// Same draft/live/rev/publishedRev pattern as Footer.js/HomeHero.js. Content is
// validated in depth by the zod schema at the API boundary (cms/schemas.js) —
// Mongoose just stores whatever shape that schema already approved.
const legalPagesVersion = new Schema(
  {
    content: { type: Schema.Types.Mixed, default: null },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

/**
 * The site's 4 footer legal pages (Mentions légales, CGV, Politique de
 * confidentialité, Cookies) — one singleton CMS resource holding all 4 (same
 * "only ever one document" shape as Footer.js/HomeHero.js), rather than 4
 * separate documents, since they're a small, permanently-fixed set, always
 * edited together from one admin tab. `legalPagesService.getLegalPages()`
 * seeds this document, in both draft and live, with the real current
 * (placeholder) text the first time it's ever read — see legalPagesDefaults.js.
 */
const legalPagesSchema = new Schema(
  {
    draft: { type: legalPagesVersion, default: () => ({ content: null }) },
    live: { type: legalPagesVersion, default: () => ({ content: null }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false },
)

// Compared by content, not by the rev counter — same fix as Footer.js/Page.js's
// hasUnpublishedChanges (a "rev !== publishedRev" check misreads a just-discarded
// draft, which is back to matching live, as still having unpublished changes).
legalPagesSchema.methods.hasUnpublishedChanges = function () {
  return JSON.stringify(this.draft.content) !== JSON.stringify(this.live.content)
}

legalPagesSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    draft: o.draft,
    live: o.live,
    rev: o.rev,
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    publishedAt: o.publishedAt,
  }
}

export const LegalPages = mongoose.model('LegalPages', legalPagesSchema)
