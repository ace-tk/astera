import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../models/Report.js'
import { generateReport } from '../services/intelligence.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

const TEXT_RE = /\.(txt|vtt|srt|md|csv|json)$/i
const isTextUpload = (f) => f && (f.mimetype?.startsWith('text/') || TEXT_RE.test(f.originalname || ''))

const slugify = (s) =>
  `${s || 'report'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'report'

/** Every report belongs to the authenticated user (routes enforce requireAuth). */
export async function listReports(req, res) {
  if (needDB(res)) return
  const reports = await Report.find({ owner: req.userId }).sort('-createdAt').limit(100)
  res.json({ reports: reports.map((r) => r.toClientJSON()) })
}

export async function getReport(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne({ ...query, owner: req.userId })
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json({ report: report.toClientJSON() })
}

const createSchema = z.object({
  title: z.string().max(160).optional(),
  subtitle: z.string().max(160).optional(),
  duration: z.string().optional(),
  transcript: z.string().optional(),
})

/**
 * Create a report from a real upload — a transcript in the body, or an uploaded
 * file (`media`). Text files are read as the transcript; audio/video are stored
 * as source metadata (browser transcription isn't available, so the heuristic
 * runs on whatever text is present). Emits `report:stage` over the socket.
 */
export async function createReport(req, res) {
  if (needDB(res)) return
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid report request', issues: parsed.error.flatten() })
  }

  const file = req.file
  let transcript = (parsed.data.transcript || '').trim()
  let source
  if (file) {
    source = { fileName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size }
    if (isTextUpload(file) && !transcript) transcript = file.buffer.toString('utf8').trim()
  }

  // A report needs *something* to analyze: a transcript, or a text file.
  if (!transcript && !file) {
    return res.status(422).json({ error: 'Provide a transcript or upload a file to analyze.' })
  }

  const title =
    parsed.data.title?.trim() ||
    (file ? file.originalname.replace(/\.[^.]+$/, '') : 'Untitled meeting')

  const io = req.app.get('io')
  const room = `user:${req.userId}`
  const draft = await generateReport(transcript, { ...parsed.data, title }, (stage) => {
    io?.to(room).emit('report:stage', { stage })
  })

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`
  const report = await Report.create({
    ...draft,
    slug,
    owner: req.userId,
    date: new Date().toISOString().slice(0, 10),
    source,
    // audio/video with no transcript → be honest the analysis is source-limited
    subtitle: file && !transcript ? 'Uploaded recording (no transcript)' : draft.subtitle,
  })
  io?.to(room).emit('report:ready', { id: report.slug })
  res.status(201).json({ report: report.toClientJSON() })
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

/** Edit a report (Review Mode / feedback). Owner-scoped. */
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
  if (p.title !== undefined) report.title = p.title
  if (p.headline !== undefined) report.headline = p.headline
  if (p.priority !== undefined) report.priority = p.priority
  if (p.notes !== undefined) report.notes = p.notes
  if (p.commitments !== undefined) {
    report.commitments = p.commitments
    report.metrics.commitments = p.commitments.length
  }
  if (p.feedback !== undefined) report.feedback = { ...p.feedback, at: new Date() }

  await report.save()
  res.json({ report: report.toClientJSON() })
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
