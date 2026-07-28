import mongoose from 'mongoose'
import { z } from 'zod'
import { User } from '../models/User.js'
import { Report } from '../models/Report.js'
import { ReportRequest } from '../models/ReportRequest.js'
import { isAdminUser } from '../config/env.js'
import { REPORT_TYPES, DELIVERY_MODES } from '../constants.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

// Serialize a report for admin views, exposing a small owner summary.
const adminReportJSON = (r) => {
  const owner = r.owner && typeof r.owner === 'object' && r.owner._id ? { id: r.owner._id, name: r.owner.name, email: r.owner.email } : null
  return { ...r.toClientJSON(), owner }
}

/** Dashboard counters. */
export async function stats(req, res) {
  if (needDB(res)) return
  const [totalUsers, totalReports, pending, approved] = await Promise.all([
    User.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ reviewStatus: 'pending' }),
    Report.countDocuments({ reviewStatus: 'approved' }),
  ])
  res.json({ stats: { totalUsers, totalReports, pending, approved } })
}

/** All users + their report counts. */
export async function listUsers(req, res) {
  if (needDB(res)) return
  const users = await User.find().sort('-createdAt').limit(500)
  const counts = await Report.aggregate([{ $group: { _id: '$owner', n: { $sum: 1 } } }])
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]))
  res.json({
    users: users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      reportsCount: countMap.get(String(u._id)) || 0,
      isAdmin: isAdminUser(u),
    })),
  })
}

/** All reports (optionally scoped to one owner), with owner summary. */
export async function listReports(req, res) {
  if (needDB(res)) return
  const filter = {}
  if (req.query.owner && mongoose.isValidObjectId(req.query.owner)) filter.owner = req.query.owner
  const reports = await Report.find(filter).populate('owner', 'name email').sort('-createdAt').limit(500)
  res.json({ reports: reports.map(adminReportJSON) })
}

/** A single report for review (any owner). */
export async function getReport(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne(query).select('+analysis').populate('owner', 'name email')
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json({ report: adminReportJSON(report) })
}

const updateSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  headline: z.string().max(2000).optional(),
  commitments: z
    .array(z.object({ text: z.string(), owner: z.string().optional(), due: z.string().optional(), at: z.string().optional() }))
    .optional(),
  decisions: z
    .array(z.object({ text: z.string(), owner: z.string().optional(), at: z.string().optional(), confidence: z.number().optional() }))
    .optional(),
  reviewStatus: z.enum(['draft', 'pending', 'approved']).optional(),
  // Admin-authored report fields (Report Requests workflow) — all optional so
  // AI-generated report edits (which never set these) are unaffected.
  reportType: z.enum(REPORT_TYPES).optional(),
  meetingType: z.string().max(160).optional(),
  clientOrg: z.string().max(160).optional(),
  meetingOwner: z.string().max(160).optional(),
  duration: z.string().optional(),
  language: z.string().max(60).optional(),
  complianceNotes: z.string().max(4000).optional(),
  riskNotes: z.string().max(4000).optional(),
  tags: z.array(z.string()).optional(),
  reportContent: z.string().max(20000).optional(),
  deliveryMode: z.enum(DELIVERY_MODES).optional(),
  publishStatus: z.enum(['draft', 'published']).optional(),
})

/** Admin edit — summary, action items, review status, and (for admin-authored
 * reports) the Report Requests fields + draft/publish state. */
export async function updateReport(req, res) {
  if (needDB(res)) return
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid update', issues: parsed.error.flatten() })
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOne(query)
  if (!report) return res.status(404).json({ error: 'Report not found' })

  const p = parsed.data
  if (p.title !== undefined) report.title = p.title
  if (p.headline !== undefined) report.headline = p.headline
  if (p.commitments !== undefined) {
    report.commitments = p.commitments
    report.metrics.commitments = p.commitments.length
  }
  if (p.decisions !== undefined) {
    report.decisions = p.decisions
    report.metrics.decisions = p.decisions.length
  }
  if (p.reviewStatus !== undefined) report.reviewStatus = p.reviewStatus
  if (p.reportType !== undefined) report.reportType = p.reportType
  if (p.meetingType !== undefined) report.meetingType = p.meetingType
  if (p.clientOrg !== undefined) report.clientOrg = p.clientOrg
  if (p.meetingOwner !== undefined) report.meetingOwner = p.meetingOwner
  if (p.duration !== undefined) report.duration = p.duration
  if (p.language !== undefined) report.language = p.language
  if (p.complianceNotes !== undefined) report.complianceNotes = p.complianceNotes
  if (p.riskNotes !== undefined) report.riskNotes = p.riskNotes
  if (p.tags !== undefined) report.tags = p.tags
  if (p.reportContent !== undefined) report.reportContent = p.reportContent
  if (p.deliveryMode !== undefined) report.deliveryMode = p.deliveryMode

  const publishing = p.publishStatus === 'published' && report.publishStatus !== 'published'
  if (p.publishStatus !== undefined) report.publishStatus = p.publishStatus

  await report.save()

  // Publishing an admin-authored report delivers its originating request.
  if (publishing && report.request) {
    await ReportRequest.findByIdAndUpdate(report.request, { status: 'delivered' })
  }

  await report.populate('owner', 'name email')
  res.json({ report: adminReportJSON(report) })
}

/** Delete any report. */
export async function deleteReport(req, res) {
  if (needDB(res)) return
  const { id } = req.params
  const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id }
  const report = await Report.findOneAndDelete(query)
  if (!report) return res.status(404).json({ error: 'Report not found' })
  res.json({ ok: true, id })
}
