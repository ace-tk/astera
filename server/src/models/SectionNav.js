import mongoose from 'mongoose'
import { MAX_SECTION_NAV_ENTRIES } from '../cms/constants.js'

const { Schema } = mongoose

const version = new Schema(
  {
    entries: {
      type: [Schema.Types.Mixed],
      default: [],
      validate: { validator: (e) => e.length <= MAX_SECTION_NAV_ENTRIES, message: `A section can list at most ${MAX_SECTION_NAV_ENTRIES} pages` },
    },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

/**
 * The ordered page list behind a section's side navigation and its
 * previous/next links. Optional: a section with no document keeps its built-in
 * list, and published CMS pages are appended to it automatically.
 */
const sectionNavSchema = new Schema(
  {
    section: { type: String, required: true, unique: true },
    draft: { type: version, default: () => ({ entries: [] }) },
    live: { type: version, default: () => ({ entries: [] }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
    configured: { type: Boolean, default: false }, // false until the built-in list has been imported
  },
  { timestamps: true, minimize: false },
)

sectionNavSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    section: o.section,
    configured: o.configured,
    draft: o.draft,
    live: o.live,
    rev: o.rev,
    hasUnpublishedChanges: o.rev !== o.publishedRev,
    publishedAt: o.publishedAt,
  }
}

export const SectionNav = mongoose.model('SectionNav', sectionNavSchema)
