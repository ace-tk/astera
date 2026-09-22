import mongoose from 'mongoose'

const { Schema } = mongoose

/** An uploaded image. The bytes live in GridFS (see cms/mediaStorage.js). */
const mediaSchema = new Schema(
  {
    kind: { type: String, enum: ['image'], default: 'image' },
    title: { type: String, default: '', maxlength: 200 },
    alt: { type: String, default: '', maxlength: 300 },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    sha256: { type: String, required: true, unique: true },
    storage: {
      provider: { type: String, enum: ['gridfs'], default: 'gridfs' },
      gridFsId: { type: Schema.Types.ObjectId, required: true },
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

mediaSchema.virtual('path').get(function () {
  return `/api/media/${this._id}/${encodeURIComponent(this.filename)}`
})

mediaSchema.methods.toClientJSON = function () {
  return {
    id: String(this._id),
    kind: this.kind,
    title: this.title,
    alt: this.alt,
    filename: this.filename,
    mimeType: this.mimeType,
    sizeBytes: this.sizeBytes,
    path: this.path,
    createdAt: this.createdAt,
  }
}

export const Media = mongoose.model('Media', mediaSchema)
