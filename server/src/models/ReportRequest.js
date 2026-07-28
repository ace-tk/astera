import mongoose from 'mongoose'
import { REPORT_TYPES, DELIVERY_MODES, REQUEST_STATUSES } from '../constants.js'

/**
 * A customer's ask for a manually-authored report — created before any
 * `Report` exists. An admin picks it up, authors a `Report` from it (see
 * reportRequestController.createReportFromRequest), and publishing that
 * report bumps this request's status to 'delivered'.
 */
const reportRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    meetingName: { type: String, required: true },
    reportType: { type: String, enum: REPORT_TYPES, default: 'Essential' },
    deliveryMode: { type: String, enum: DELIVERY_MODES, default: 'Portal' },
    meetingDate: String, // YYYY-MM-DD
    meetingTime: String, // HH:MM
    customerNotes: String,
    attachment: {
      fileName: String,
      mimeType: String,
      sizeBytes: Number,
      gridFsId: mongoose.Schema.Types.ObjectId,
    },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending_review', index: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
  },
  { timestamps: true },
)

reportRequestSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { ...o, id: String(o._id) }
}

export const ReportRequest = mongoose.model('ReportRequest', reportRequestSchema)
