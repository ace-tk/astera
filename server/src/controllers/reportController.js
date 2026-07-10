import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../models/Report.js'
import { generateReport } from '../services/intelligence.js'
import { DEMO_REPORTS } from '../seed-data.js'

const dbReady = () => mongoose.connection.readyState === 1

const createSchema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(160).optional(),
  duration: z.string().optional(),
  participants: z.array(z.string()).optional(),
  transcript: z.string().min(1, 'A transcript is required to generate a report'),
})

/** List reports for the workspace. Falls back to demo data without a DB. */
export async function listReports(req, res) {
  if (!dbReady()) return res.json({ reports: DEMO_REPORTS, demo: true })
  const reports = await Report.find({ owner: req.userId }).sort('-createdAt').limit(50)
  res.json({ reports: reports.map((r) => r.toClientJSON()) })
}

/** Fetch one report by slug or id. */
export async function getReport(req, res) {
  const { id } = req.params
  if (!dbReady()) {
    const demo = DEMO_REPORTS.find((r) => r.id === id) || DEMO_REPORTS[0]
    return res.json({ report: demo, demo: true })
  }
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne({ ...query, owner: req.userId })
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json({ report: report.toClientJSON() })
}

/**
 * Generate a report from a transcript. Emits `report:stage` events over the
 * socket so the client's Upload Studio can animate the live pipeline.
 */
export async function createReport(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(422).json({ error: 'Invalid report request', issues: parsed.error.flatten() })
  }
  const { transcript, ...meta } = parsed.data
  const io = req.app.get('io')
  const room = `user:${req.userId || 'demo'}`

  const draft = await generateReport(transcript, meta, (stage) => {
    io?.to(room).emit('report:stage', { stage })
  })

  if (!dbReady()) {
    return res.status(201).json({ report: { ...draft, id: 'demo-generated' }, demo: true })
  }

  const slug = `${meta.title || 'report'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)

  const report = await Report.create({ ...draft, slug, owner: req.userId })
  io?.to(room).emit('report:ready', { id: report.slug })
  res.status(201).json({ report: report.toClientJSON() })
}
