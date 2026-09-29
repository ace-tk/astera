import mongoose from 'mongoose'

const { Schema } = mongoose

// Same draft/live/rev/publishedRev pattern as Menu.js and SectionNav.js. Content is
// validated in depth by the zod schema at the API boundary (cms/schemas.js) — Mongoose
// just stores whatever shape that schema already approved.
const footerVersion = new Schema(
  {
    content: { type: Schema.Types.Mixed, default: null },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

/**
 * The site footer — a single, always-one-document CMS resource (there is only ever
 * one footer, unlike Menu/SectionNav which are keyed by many). `getFooter()` in
 * footerService.js creates this document, seeded with the site's real hardcoded
 * content in BOTH draft and live, the first time it's ever read — so there is no
 * separate "import the built-in footer" step and the public site is never at risk
 * of rendering an empty footer.
 */
const footerSchema = new Schema(
  {
    draft: { type: footerVersion, default: () => ({ content: null }) },
    live: { type: footerVersion, default: () => ({ content: null }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false },
)

// Compared by content, not by the rev counter (same fix as Page.js's hasUnpublishedChanges):
// a "rev !== publishedRev" check would read discarding a draft back to the live content
// as still having unpublished changes, because discarding still bumps rev.
footerSchema.methods.hasUnpublishedChanges = function () {
  return JSON.stringify(this.draft.content) !== JSON.stringify(this.live.content)
}

footerSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    draft: o.draft,
    live: o.live,
    rev: o.rev,
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    publishedAt: o.publishedAt,
  }
}

export const Footer = mongoose.model('Footer', footerSchema)
