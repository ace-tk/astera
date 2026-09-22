import mongoose from 'mongoose'

const { Schema } = mongoose

/**
 * A PDF report an admin uploaded for one client. The file itself lives in GridFS
 * (bucket 'clientReports', via services/attachments.js); this document only records who
 * it belongs to and what it is. There is deliberately no public URL: every read goes
 * through an authenticated endpoint that checks `client` against the signed-in user.
 */
const clientReportSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    gridFsId: { type: Schema.Types.ObjectId, required: true, select: false },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    mimeType: { type: String, required: true, default: 'application/pdf' },
    sizeBytes: { type: Number, required: true, min: 1 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

clientReportSchema.index({ client: 1, createdAt: -1 })

// The client-facing shape: never exposes the storage id, the uploader or the original path.
clientReportSchema.methods.toClientJSON = function () {
  return { id: this._id, title: this.title, sizeBytes: this.sizeBytes, createdAt: this.createdAt }
}

clientReportSchema.methods.toAdminJSON = function () {
  return { ...this.toClientJSON(), originalName: this.originalName, mimeType: this.mimeType, client: this.client, updatedAt: this.updatedAt }
}

export const ClientReport = mongoose.model('ClientReport', clientReportSchema)
export const CLIENT_REPORTS_BUCKET = 'clientReports'
