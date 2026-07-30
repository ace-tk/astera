import mongoose from 'mongoose'

/** Private admin-only notes about a customer. Never returned on any
 * customer-facing route — only the admin Customer Detail controllers touch this. */
const customerNoteSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, maxlength: 4000 },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Admin' },
  },
  { timestamps: true },
)

customerNoteSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { id: String(o._id), text: o.text, authorName: o.authorName, createdAt: o.createdAt, updatedAt: o.updatedAt }
}

export const CustomerNote = mongoose.model('CustomerNote', customerNoteSchema)
