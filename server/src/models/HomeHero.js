import mongoose from 'mongoose'

const { Schema } = mongoose

// Same draft/live/rev/publishedRev pattern as Footer.js/Menu.js/SectionNav.js.
// Content is validated in depth by the zod schema at the API boundary
// (cms/schemas.js's homeHeroContentSchema) — Mongoose just stores whatever
// shape that schema already approved.
const homeHeroVersion = new Schema(
  {
    content: { type: Schema.Types.Mixed, default: null },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

/**
 * The homepage hero carousel's 3 slide images — a single, always-one-document
 * CMS resource (there is only ever one). `getHomeHero()` in homeHeroService.js
 * creates this document, seeded with the site's real current images (both
 * draft and live) the first time it's ever read — same "no separate import
 * step, never blank on the public site" behaviour as Footer.
 */
const homeHeroSchema = new Schema(
  {
    draft: { type: homeHeroVersion, default: () => ({ content: null }) },
    live: { type: homeHeroVersion, default: () => ({ content: null }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false },
)

// Compared by content, not the rev counter — same fix as Footer.js/Page.js's
// hasUnpublishedChanges (a rev-counter check would read "Discard" as still
// having unpublished changes, since discarding still bumps rev).
homeHeroSchema.methods.hasUnpublishedChanges = function () {
  return JSON.stringify(this.draft.content) !== JSON.stringify(this.live.content)
}

homeHeroSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    draft: o.draft,
    live: o.live,
    rev: o.rev,
    hasUnpublishedChanges: this.hasUnpublishedChanges(),
    publishedAt: o.publishedAt,
  }
}

export const HomeHero = mongoose.model('HomeHero', homeHeroSchema)
