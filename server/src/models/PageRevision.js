import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * An immutable snapshot taken when something notable happens to a page
 * (import, publish, unpublish, restore). Gives history and a rollback path.
 */
const pageRevisionSchema = new Schema(
  {
    page: { type: Schema.Types.ObjectId, ref: 'Page', required: true, index: true },
    seq: { type: Number, required: true },
    kind: { type: String, enum: ['import', 'publish', 'unpublish', 'restore'], required: true },
    path: String,
    snapshot: { type: Schema.Types.Mixed, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false },
)
pageRevisionSchema.index({ page: 1, seq: -1 }, { unique: true })

pageRevisionSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { id: String(o._id), seq: o.seq, kind: o.kind, path: o.path, createdAt: o.createdAt, createdBy: o.createdBy && String(o.createdBy), snapshot: o.snapshot }
}

export const PageRevision = mongoose.model('PageRevision', pageRevisionSchema)
