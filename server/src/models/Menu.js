import mongoose from 'mongoose'
import { MAX_MAIN_MENU_ITEMS, MENU_KEYS } from '../cms/constants.js'

const { Schema } = mongoose

// Items are validated in depth by the zod schema at the API boundary
// (cms/schemas.js). Mongoose enforces the parts that must hold no matter how a
// document is written: the allowed keys and the 7-item ceiling.
const menuVersion = new Schema(
  {
    items: {
      type: [Schema.Types.Mixed],
      default: [],
      validate: {
        validator: (items) => items.length <= MAX_MAIN_MENU_ITEMS,
        message: `A maximum of ${MAX_MAIN_MENU_ITEMS} main menu items is allowed`,
      },
    },
    savedAt: { type: Date, default: Date.now },
    savedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false, minimize: false },
)

const menuSchema = new Schema(
  {
    key: { type: String, enum: MENU_KEYS, required: true, unique: true },
    draft: { type: menuVersion, default: () => ({ items: [] }) },
    live: { type: menuVersion, default: () => ({ items: [] }) },
    rev: { type: Number, default: 1 },
    publishedRev: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true, minimize: false },
)

menuSchema.methods.toAdminJSON = function () {
  const o = this.toObject()
  return {
    key: o.key,
    draft: o.draft,
    live: o.live,
    rev: o.rev,
    hasUnpublishedChanges: o.rev !== o.publishedRev,
    publishedAt: o.publishedAt,
    limit: MAX_MAIN_MENU_ITEMS,
  }
}

export const Menu = mongoose.model('Menu', menuSchema)
