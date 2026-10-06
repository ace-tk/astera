import mongoose from 'mongoose'

const { Schema } = mongoose

const sitePageVersion = new Schema(
  {
    content: { type: Schema.Types.Mixed, default: null },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

/**
 * One document per "site page" (tarification, a-propos, contact, …) — same draft/live/rev
 * pattern as Footer.js/HomeHero.js/LegalPages.js. A page has NO document until an admin first
 * saves it: until then the website simply shows the content that is hardcoded in the frontend.
 * Content is validated against the page's fixed shape (cms/sitePageShape.js) before it is stored.
 */
const sitePageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    draft: { type: sitePageVersion, default: () => ({ content: null }) },
    live: { type: sitePageVersion, default: () => ({ content: null }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false },
)

sitePageSchema.methods.hasUnpublishedChanges = function () {
  return JSON.stringify(this.draft.content) !== JSON.stringify(this.live.content)
}

export const SitePage = mongoose.model('SitePage', sitePageSchema)
