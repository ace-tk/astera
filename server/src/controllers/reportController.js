import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../models/Report.js'
import { generateReport } from '../services/intelligence.js'
import { ingestFile } from '../services/ingest.js'

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
  let source
  if (file) {
    source = { fileName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size }
    try {
      const ingested = await ingestFile(file, emit) // reads / extracts / transcribes
      transcript = ingested.transcript
      transcription = ingested.transcription
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

  const draft = await generateReport(transcript, meta, emit)

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-5)}`
  const report = await Report.create({
    ...draft,
    slug,
    owner: req.userId,
    date: new Date().toISOString().slice(0, 10),
    source,
    transcript, // stored (select:false) — never returned to clients
    transcription: transcription || undefined,
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
