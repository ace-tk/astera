import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../models/Report.js'
import { generateReport } from '../services/intelligence.js'
import { ingestFile } from '../services/ingest.js'
import { buildMeetingAnalysis } from '../services/analysis.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

const slugify = (s) =>
  `${s || 'report'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'report'

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Deepgram sentiment → the report's sentiment enum.
const mapSentiment = (s) => (s === 'positive' ? 'positive' : s === 'negative' ? 'negative' : 'mixed')

/**
 * Customer-facing serialization. Overlays the customer's private
 * `customerEdits` (title/headline/commitments from Review Mode) on top of the
 * base report so the customer always sees their edited version — without
 * ever mutating the underlying fields the admin panel reads and writes.
 */
function withCustomerView(report) {
  const json = report.toClientJSON()
  const ce = json.customerEdits
  delete json.customerEdits
  const hasEdits = Boolean(ce && (ce.title !== undefined || ce.headline !== undefined || ce.commitments !== undefined))
  if (ce) {
    if (ce.title !== undefined) json.title = ce.title
    if (ce.headline !== undefined) json.headline = ce.headline
    if (ce.commitments !== undefined) {
      json.commitments = ce.commitments
      json.metrics = { ...json.metrics, commitments: ce.commitments.length }
    }
  }
  json.hasCustomerEdits = hasEdits
  return json
}

/** Every report belongs to the authenticated user (routes enforce requireAuth). */
export async function listReports(req, res) {
  if (needDB(res)) return
  const reports = await Report.find({ owner: req.userId }).sort('-createdAt').limit(100)
  res.json({ reports: reports.map(withCustomerView) })
}

export async function getReport(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne({ ...query, owner: req.userId }).select('+analysis')
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json({ report: withCustomerView(report) })
}

const createSchema = z.object({
  title: z.string().max(160).optional(),
  subtitle: z.string().max(160).optional(),
  duration: z.string().optional(),
  transcript: z.string().optional(),
})

/**
 * Create a report from a real upload — a transcript in the body, or an uploaded
 * file (`media`). The ingest service turns the file into text: text files are
 * read directly, DOCX/PDF are extracted, and audio/video are transcribed by
 * Deepgram. The resulting transcript is then fed into the existing report
 * pipeline unchanged. Emits `report:stage` over the socket for live progress.
 */
export async function createReport(req, res) {
  if (needDB(res)) return
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid report request', issues: parsed.error.flatten() })
  }

  const file = req.file
  const io = req.app.get('io')
  const room = `user:${req.userId}`
  const emit = (stage) => io?.to(room).emit('report:stage', { stage })

  let transcript = (parsed.data.transcript || '').trim()
  let transcription = null
  let diarization = []
  let speakers = []
  let deepgram = null
  let source
  if (file) {
    source = { fileName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size }
    try {
      const ingested = await ingestFile(file, emit) // reads / extracts / transcribes
      transcript = ingested.transcript
      transcription = ingested.transcription
      diarization = ingested.diarization || []
      speakers = ingested.speakers || []
      deepgram = ingested.deepgram || null
    } catch (err) {
      return res.status(err.status || 422).json({ error: err.publicMessage || 'We couldn’t process that file.' })
    }
  }

  if (!transcript) {
    return res.status(422).json({ error: 'We couldn’t find any text to analyze. Upload a transcript, document, or recording.' })
  }

  const title =
    parsed.data.title?.trim() ||
    (file ? file.originalname.replace(/\.[^.]+$/, '') : 'Untitled meeting')

  // A real transcription gives us the true duration — hand it to the pipeline.
  const meta = { ...parsed.data, title }
  if (transcription?.durationSec) meta.duration = formatDuration(transcription.durationSec)

  // For diarized audio, feed the pipeline one utterance per line so it extracts
  // clean per-statement decisions/risks/commitments (speakers are re-attributed
  // below). Text/DOCX/PDF keep their own structure.
  const pipelineInput = diarization.length ? diarization.map((u) => u.text).join('\n') : transcript
  const draft = await generateReport(pipelineInput, meta, emit)

  // Comprehensive analytics from the real signals (diarization/topics/sentiment
  // + the heuristic decisions/risks/commitments). Composed on top of the pipeline
  // output — the pipeline itself is not modified.
  const date = new Date().toISOString().slice(0, 10)
  const analysis = buildMeetingAnalysis({ meta, transcript, diarization, speakers, transcription, draft, deepgram })
  analysis.generatedAt = new Date()
  analysis.metadata.date = date

  // Fill the EXISTING report fields with real values (no placeholders) for audio.
  if (speakers.length) {
    draft.participants = speakers.map((s) => s.label)
    draft.talkTime = speakers.map((s) => ({ name: s.label, pct: s.pct }))
    // Decisions & action items attributed to the speaker who said them.
    draft.decisions = analysis.decisions.map((d) => ({ text: d.decision, owner: d.owner, at: d.timestamp, confidence: d.confidence / 100 }))
    draft.commitments = analysis.actionItems.map((a) => ({ text: a.task, owner: a.owner, due: a.deadline || 'This week', at: a.at }))
    draft.metrics = { ...draft.metrics, owners: new Set(draft.decisions.map((d) => d.owner)).size || speakers.length }
    // Real timeline from the attributed, timestamped events.
    const events = [
      ...draft.decisions.map((d) => ({ at: d.at, label: d.text.slice(0, 28), color: 'royal', kind: 'decision' })),
      ...draft.risks.map((r) => ({ at: r.at, label: r.text.slice(0, 28), color: 'rose', kind: 'risk' })),
      ...draft.commitments.map((c) => ({ at: c.at, label: c.text.slice(0, 28), color: 'golden', kind: 'commitment' })),
    ].filter((e) => e.at)
    if (events.length) draft.timeline = events.sort((a, b) => String(a.at).localeCompare(String(b.at)))
    // Meeting DNA driven by real signals.
    if (analysis.speakerContribution) draft.dna = { ...draft.dna, collaboration: analysis.speakerContribution.conversationBalanceScore }
    draft.dna = { ...draft.dna, compliance: analysis.compliance.complianceScore }
    const s = analysis.sentiment
    const total = (s.positive || 0) + (s.neutral || 0) + (s.negative || 0)
    if (total) draft.dna.conflict = Math.max(6, Math.min(92, Math.round(6 + (s.negative / total) * 80)))
  }
  if (transcription?.summary) draft.headline = transcription.summary
  if (transcription?.sentiment) draft.sentiment = mapSentiment(transcription.sentiment)

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`
  const report = await Report.create({
    ...draft,
    slug,
    owner: req.userId,
    date,
    source,
    transcript, // stored (select:false) — never returned to clients
    transcription: transcription || undefined,
    diarization: diarization.length ? diarization : undefined,
    analysis, // full analytics (select:false) — returned on single-report fetch
  })
  io?.to(room).emit('report:ready', { id: report.slug })
  res.status(201).json({ report: withCustomerView(report) })
}

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  headline: z.string().max(2000).optional(),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional(),
  notes: z.string().max(4000).optional(),
  commitments: z
    .array(z.object({ text: z.string(), owner: z.string().optional(), due: z.string().optional(), at: z.string().optional() }))
    .optional(),
  feedback: z
    .object({ useful: z.boolean(), reasons: z.array(z.string()).optional() })
    .optional(),
})

/**
 * Edit a report (Review Mode / feedback). Owner-scoped.
 *
 * Title, headline, and commitments are saved into `customerEdits` — the
 * customer's own personal copy — instead of the shared top-level fields, so
 * this NEVER modifies the original report an admin sees in the admin panel.
 * Priority/notes are already customer-only fields the admin never touches.
 */
export async function updateReport(req, res) {
  if (needDB(res)) return
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid update', issues: parsed.error.flatten() })
  }
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne({ ...query, owner: req.userId })
  if (!report) return res.status(404).json({ error: 'Report not found' })

  const p = parsed.data
  if (p.title !== undefined || p.headline !== undefined || p.commitments !== undefined) {
    const ce = report.customerEdits ? report.customerEdits.toObject() : {}
    if (p.title !== undefined) ce.title = p.title
    if (p.headline !== undefined) ce.headline = p.headline
    if (p.commitments !== undefined) ce.commitments = p.commitments
    ce.editedAt = new Date()
    report.customerEdits = ce
  }
  if (p.priority !== undefined) report.priority = p.priority
  if (p.notes !== undefined) report.notes = p.notes
  if (p.feedback !== undefined) report.feedback = { ...p.feedback, at: new Date() }

  await report.save()
  res.json({ report: withCustomerView(report) })
}

/** Delete a report. Owner-scoped. */
export async function deleteReport(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOneAndDelete({ ...query, owner: req.userId })
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.status(200).json({ ok: true, id })
}
