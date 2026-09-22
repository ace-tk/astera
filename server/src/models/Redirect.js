import mongoose from 'mongoose'

/** Created automatically when a published page's URL changes or a page is removed. */
const redirectSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, unique: true },
    to: { type: String, required: true },
    status: { type: Number, default: 301 },
    source: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  },
  { timestamps: true },
)

export const Redirect = mongoose.model('Redirect', redirectSchema)
