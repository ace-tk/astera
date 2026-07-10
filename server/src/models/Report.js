import mongoose from 'mongoose'

/**
 * The Report is Astera's core artifact — mirrors the client's report shape so
 * the frontend can render it with zero transformation. Sub-documents keep the
 * intelligence (decisions/risks/commitments/timeline) queryable.
 */
const decisionSchema = new mongoose.Schema(
  { text: String, owner: String, at: String, confidence: Number },
  { _id: false },
)
const riskSchema = new mongoose.Schema(
  { text: String, level: { type: String, enum: ['low', 'medium', 'high'] }, at: String },
  { _id: false },
)
const commitmentSchema = new mongoose.Schema(
  { text: String, owner: String, due: String, at: String },
  { _id: false },
)
const timelineSchema = new mongoose.Schema(
  { at: String, label: String, color: String, kind: String },
  { _id: false },
)

const reportSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    slug: { type: String, index: true },
    title: { type: String, required: true },
    subtitle: String,
    color: { type: String, default: 'royal' },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    sentiment: { type: String, enum: ['positive', 'mixed', 'negative'], default: 'positive' },
    duration: String,
    participants: [String],
    headline: String,
    metrics: {
      decisions: Number,
      owners: Number,
      risks: Number,
      commitments: Number,
      talkBalance: Number,
    },
    decisions: [decisionSchema],
    risks: [riskSchema],
    commitments: [commitmentSchema],
    timeline: [timelineSchema],
    talkTime: [{ name: String, pct: Number, _id: false }],
    source: {
      fileName: String,
      fileUrl: String,
      mimeType: String,
      sizeBytes: Number,
    },
  },
  { timestamps: true },
)

reportSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { ...o, id: o.slug || String(o._id) }
}

export const Report = mongoose.model('Report', reportSchema)
