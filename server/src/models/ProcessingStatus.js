import mongoose from 'mongoose'

/**
 * Transient, best-effort record of an in-flight upload's processing stage —
 * exists solely so a client whose WebSocket drops mid-upload can recover
 * exactly where it left off (GET /api/reports/progress/:jobId) instead of
 * the progress bar silently losing stages. Not part of the application's
 * durable data model — auto-expires an hour after creation (TTL index),
 * since it has no value once an upload has resolved one way or another.
 */
const processingStatusSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // client-generated job id (crypto.randomUUID())
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stage: {
      type: String,
      enum: ['queued', 'transcript', 'intelligence', 'timeline', 'report', 'compliance', 'delivery', 'ready', 'error'],
      default: 'queued',
    },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', default: null },
    error: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
  },
  { versionKey: false },
)

export const ProcessingStatus = mongoose.model('ProcessingStatus', processingStatusSchema)
