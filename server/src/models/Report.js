import mongoose from 'mongoose'
import { REPORT_TYPES, DELIVERY_MODES } from '../constants.js'

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

const dnaSchema = new mongoose.Schema(
  {
    decisionDriven: Number,
    collaboration: Number,
    conflict: Number,
    energy: Number,
    energyLabel: String,
    compliance: Number,
    aiConfidence: Number,
  },
  { _id: false },
)

const reportSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    slug: { type: String, index: true },
    title: { type: String, required: true },
    subtitle: String,
    category: { type: String, default: 'Your upload' },
    date: String, // display date (YYYY-MM-DD)
    color: { type: String, default: 'royal' },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    // Admin review state — distinct from the generation `status` above.
    reviewStatus: { type: String, enum: ['draft', 'pending', 'approved'], default: 'pending' },
    sentiment: { type: String, enum: ['positive', 'mixed', 'negative'], default: 'positive' },
    duration: String,
    participants: [String],
    engine: { type: String, default: 'heuristic' }, // honest label: which analyzer ran
    headline: String,
    metrics: {
      decisions: Number,
      owners: Number,
      risks: Number,
      commitments: Number,
      talkBalance: Number,
    },
    dna: dnaSchema,
    decisions: [decisionSchema],
    risks: [riskSchema],
    commitments: [commitmentSchema],
    timeline: [timelineSchema],
    talkTime: [{ name: String, pct: Number, _id: false }],
    // User-editable (Review Mode) — persisted server-side for real accounts.
    priority: { type: String, enum: ['high', 'medium', 'low', null], default: null },
    notes: String,
    // Customer's private overlay for Review Mode's title/headline/commitments
    // edits. Kept separate from the fields above so a customer's edits are
    // their own personal copy and never overwrite the admin-authoritative
    // report those same fields hold (see reportController.withCustomerView).
    customerEdits: {
      title: String,
      headline: String,
      commitments: [commitmentSchema],
      editedAt: Date,
    },
    // Admin-authored report fields (Report Requests workflow). Additive —
    // AI-generated reports never set these.
    reportType: { type: String, enum: REPORT_TYPES }, // "Report Category" in the admin form
    meetingType: String,
    clientOrg: String,
    meetingOwner: String,
    language: String,
    complianceNotes: String,
    riskNotes: String,
    tags: [String],
    reportContent: String,
    deliveryMode: { type: String, enum: DELIVERY_MODES },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportRequest', default: null },
    // Customer visibility gate. Defaults to 'published' so every existing (and
    // every future AI-generated) report keeps today's visibility unchanged —
    // only reports created via the admin Report Requests workflow start as
    // 'draft' and stay admin-only until explicitly published.
    publishStatus: { type: String, enum: ['draft', 'published'], default: 'published' },
    // All Files module — soft archive, independent of publish/review state.
    archived: { type: Boolean, default: false },
    feedback: {
      useful: Boolean,
      reasons: [String],
      at: Date,
    },
    source: {
      fileName: String,
      fileUrl: String,
      mimeType: String,
      sizeBytes: Number,
    },
    // Full transcript stored with the report but never sent to clients (select:false).
    transcript: { type: String, select: false },
    // Audio-intelligence metadata (Deepgram). Light enough to send to the client.
    transcription: {
      engine: String, // 'deepgram'
      model: String, // 'nova-3'
      language: String, // detected language code
      durationSec: Number, // audio length in seconds
      speakerCount: Number, // diarized speaker count
      summary: String, // Deepgram summary
      topics: [String], // detected discussion topics
      sentiment: String, // overall sentiment (positive | neutral | negative)
    },
    // Diarized speaker timeline (utterances). Stored, never sent (select:false).
    diarization: {
      type: [{ speaker: String, start: Number, end: Number, text: String, sentiment: String, _id: false }],
      select: false,
    },
    // Full computed analytics (speaker/topic/risk/compliance/quality/insights).
    // Stored; returned only on single-report fetch (select:false + explicit select).
    analysis: { type: mongoose.Schema.Types.Mixed, select: false },
  },
  { timestamps: true },
)

reportSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  delete o.transcript // stored server-side only; never leaves the API
  delete o.diarization // heavy speaker timeline stays server-side
  return {
    ...o,
    id: o.slug || String(o._id),
    date: o.date || (o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : undefined),
  }
}

export const Report = mongoose.model('Report', reportSchema)
