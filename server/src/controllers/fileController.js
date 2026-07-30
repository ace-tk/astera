import mongoose from 'mongoose'
import { z } from 'zod'
import { Report } from '../models/Report.js'
import { ReportRequest } from '../models/ReportRequest.js'
import { User } from '../models/User.js'
import { deleteAttachment } from '../services/attachments.js'
import { logActivity } from '../models/ActivityLog.js'
import { runReportIngestPipeline } from './reportController.js'
import { REPORT_TYPES } from '../constants.js'

const dbReady = () => mongoose.connection.readyState === 1
const needDB = (res) => {
  if (dbReady()) return false
  res.status(503).json({ error: 'Database unavailable' })
  return true
}

// All Files is a browsing layer over data that already exists — Reports (the
// generated deliverable) and ReportRequest attachments (the one real stored
// binary in the app, via GridFS). No new file storage is introduced here.
const REPORT_PREFIX = 'report:'
const ATTACHMENT_PREFIX = 'attachment:'

// Placeholder cap for the Storage widget — there is no real storage
// quota/billing system; this only gives the "X of 500 GB used" bar something
// to divide against, matching the task's explicit "Upgrade Storage (placeholder)".
const TOTAL_STORAGE_BYTES = 500 * 1024 * 1024 * 1024

const categoryOfMime = (mimeType = '') => {
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') return 'docx'
  return 'document'
}

const CATEGORY_MATCH = {
  recording: (f) => f.kind === 'attachment' && (f.category === 'audio' || f.category === 'video'),
  audio: (f) => f.category === 'audio',
  video: (f) => f.category === 'video',
  pdf: (f) => f.category === 'pdf',
  docx: (f) => f.category === 'docx',
  image: (f) => f.category === 'image',
  report: (f) => f.kind === 'report',
  transcript: (f) => f.kind === 'report',
}

const ownerSummary = (owner) => (owner && typeof owner === 'object' && owner._id ? { id: String(owner._id), name: owner.name, email: owner.email } : null)

/** A Report as a browsable "file" — the deliverable itself; the original
 * recording/document (if any) was never retained, so this is never downloadable
 * as a raw file — only viewable/printable via the existing report page. */
function reportToFile(r) {
  const status = r.archived ? 'archived' : r.publishStatus === 'draft' ? 'draft' : r.reviewStatus === 'pending' ? 'pending' : 'published'
  return {
    id: `${REPORT_PREFIX}${r._id}`,
    kind: 'report',
    category: 'report',
    name: r.title,
    customer: ownerSummary(r.owner),
    mimeType: r.source?.mimeType || null,
    sizeBytes: r.source?.sizeBytes || 0,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    status,
    archived: Boolean(r.archived),
    downloadable: false,
    reportId: String(r._id),
    reportSlug: r.slug,
    requestId: r.request ? String(r.request) : null,
    reportType: r.reportType || null,
    meetingDate: r.date || null,
  }
}

/** A ReportRequest's attachment as a browsable "file" — a real GridFS-backed
 * binary, always downloadable. Only requests that actually have an attachment
 * count as a file here (a bare request with no upload isn't a "file"). */
function attachmentToFile(request) {
  const a = request.attachment
  return {
    id: `${ATTACHMENT_PREFIX}${request._id}`,
    kind: 'attachment',
    category: categoryOfMime(a.mimeType),
    name: a.fileName,
    customer: ownerSummary(request.customer),
    mimeType: a.mimeType,
    sizeBytes: a.sizeBytes || 0,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    status: request.status,
    archived: false,
    downloadable: true,
    reportId: request.report ? String(request.report) : null,
    requestId: String(request._id),
    reportType: request.reportType || null,
    meetingDate: request.meetingDate || null,
  }
}

const SORT_COMPARATORS = {
  latest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
  size: (a, b) => b.sizeBytes - a.sizeBytes,
}

/** The unified file browser — search/filter/sort/paginate across Reports and
 * ReportRequest attachments. Two capped `.find()`s merged in JS, same style
 * (and same 500-doc cap) as the existing `listReports`/`listRequests`. */
export async function listFiles(req, res) {
  if (needDB(res)) return
  const { q, category, customer, status, reportType, from, to, sort = 'latest', page = '1', pageSize = '20' } = req.query

  const reportFilter = {}
  const requestFilter = { 'attachment.gridFsId': { $exists: true, $ne: null } }

  if (customer && mongoose.isValidObjectId(customer)) {
    reportFilter.owner = customer
    requestFilter.customer = customer
  }
  if (reportType && REPORT_TYPES.includes(reportType)) {
    reportFilter.reportType = reportType
    requestFilter.reportType = reportType
  }
  if (from || to) {
    const range = {}
    if (from) range.$gte = new Date(from)
    if (to) range.$lte = new Date(to)
    reportFilter.createdAt = range
    requestFilter.createdAt = range
  }

  const [reports, requests] = await Promise.all([
    Report.find(reportFilter).populate('owner', 'name email').sort('-createdAt').limit(500),
    ReportRequest.find(requestFilter).populate('customer', 'name email').sort('-createdAt').limit(500),
  ])

  let files = [...reports.map(reportToFile), ...requests.map(attachmentToFile)]

  const matcher = category && CATEGORY_MATCH[category]
  if (matcher) files = files.filter(matcher)
  if (status) files = files.filter((f) => f.status === status)

  if (q) {
    const needle = q.toLowerCase()
    files = files.filter((f) => [f.name, f.customer?.name, f.customer?.email].filter(Boolean).join(' ').toLowerCase().includes(needle))
  }

  files.sort(SORT_COMPARATORS[sort] || SORT_COMPARATORS.latest)

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20))
  const total = files.length
  const paged = files.slice((pageNum - 1) * size, pageNum * size)

  res.json({ files: paged, total, page: pageNum, pageSize: size })
}

/** Summary counters for the Storage dashboard cards. */
export async function getFileStats(req, res) {
  if (needDB(res)) return
  const [totalReports, archivedReports, pendingReports, requestsWithAttachment, reportSizeAgg] = await Promise.all([
    Report.countDocuments({}),
    Report.countDocuments({ archived: true }),
    Report.countDocuments({ status: 'processing' }),
    ReportRequest.find({ 'attachment.gridFsId': { $exists: true, $ne: null } }).select('attachment.sizeBytes'),
    Report.aggregate([{ $group: { _id: null, total: { $sum: '$source.sizeBytes' } } }]),
  ])
  const reportBytes = reportSizeAgg[0]?.total || 0
  const attachmentBytes = requestsWithAttachment.reduce((sum, r) => sum + (r.attachment?.sizeBytes || 0), 0)

  res.json({
    stats: {
      totalFiles: totalReports + requestsWithAttachment.length,
      totalReports,
      archivedFiles: archivedReports,
      pendingProcessing: pendingReports,
      usedBytes: reportBytes + attachmentBytes,
      totalBytes: TOTAL_STORAGE_BYTES,
    },
  })
}

/** A single file's full detail — includes report metrics / transcript text
 * (admin-only read of the select:false field) when relevant. */
export async function getFile(req, res) {
  if (needDB(res)) return
  const { id } = req.params

  if (id.startsWith(REPORT_PREFIX)) {
    const reportId = id.slice(REPORT_PREFIX.length)
    if (!mongoose.isValidObjectId(reportId)) return res.status(404).json({ error: 'File not found' })
    const query = Report.findById(reportId).populate('owner', 'name email')
    if (req.query.include === 'transcript') query.select('+transcript')
    const report = await query
    if (!report) return res.status(404).json({ error: 'File not found' })
    const payload = { file: reportToFile(report), report: report.toClientJSON() }
    if (req.query.include === 'transcript') payload.transcript = report.transcript || ''
    return res.json(payload)
  }

  if (id.startsWith(ATTACHMENT_PREFIX)) {
    const requestId = id.slice(ATTACHMENT_PREFIX.length)
    if (!mongoose.isValidObjectId(requestId)) return res.status(404).json({ error: 'File not found' })
    const request = await ReportRequest.findById(requestId).populate('customer', 'name email')
    if (!request?.attachment?.gridFsId) return res.status(404).json({ error: 'File not found' })
    return res.json({ file: attachmentToFile(request), request: request.toClientJSON() })
  }

  res.status(404).json({ error: 'File not found' })
}

const renameSchema = z.object({ name: z.string().min(1).max(200) })

/** Reports can be renamed (title); attachment file names are additive — never
 * touches anything else on the owning request. */
export async function renameFile(req, res) {
  if (needDB(res)) return
  const parsed = renameSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid name', issues: parsed.error.flatten() })
  const { id } = req.params

  if (id.startsWith(REPORT_PREFIX)) {
    const report = await Report.findByIdAndUpdate(id.slice(REPORT_PREFIX.length), { title: parsed.data.name }, { new: true }).populate('owner', 'name email')
    if (!report) return res.status(404).json({ error: 'File not found' })
    return res.json({ file: reportToFile(report) })
  }

  if (id.startsWith(ATTACHMENT_PREFIX)) {
    const request = await ReportRequest.findById(id.slice(ATTACHMENT_PREFIX.length)).populate('customer', 'name email')
    if (!request?.attachment?.gridFsId) return res.status(404).json({ error: 'File not found' })
    request.attachment.fileName = parsed.data.name
    await request.save()
    return res.json({ file: attachmentToFile(request) })
  }

  res.status(404).json({ error: 'File not found' })
}

const archiveSchema = z.object({ archived: z.boolean() })

/** Only reports can be archived — there's no equivalent lifecycle state for a
 * bare request attachment today. */
export async function archiveFile(req, res) {
  if (needDB(res)) return
  const parsed = archiveSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  const { id } = req.params
  if (!id.startsWith(REPORT_PREFIX)) return res.status(400).json({ error: 'Only reports can be archived' })

  const report = await Report.findByIdAndUpdate(id.slice(REPORT_PREFIX.length), { archived: parsed.data.archived }, { new: true }).populate('owner', 'name email')
  if (!report) return res.status(404).json({ error: 'File not found' })
  res.json({ file: reportToFile(report) })
}

const bulkArchiveSchema = z.object({ ids: z.array(z.string()).min(1), archived: z.boolean() })

export async function bulkArchiveFiles(req, res) {
  if (needDB(res)) return
  const parsed = bulkArchiveSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  const reportIds = parsed.data.ids
    .filter((id) => id.startsWith(REPORT_PREFIX))
    .map((id) => id.slice(REPORT_PREFIX.length))
    .filter((id) => mongoose.isValidObjectId(id))

  const result = await Report.updateMany({ _id: { $in: reportIds } }, { $set: { archived: parsed.data.archived } })
  res.json({ ok: true, updated: result.modifiedCount ?? reportIds.length })
}

/** Deletes a report outright, or clears just an attachment (and its GridFS
 * blob) off a request — the request itself, and every other field on it, is
 * left untouched. */
async function deleteOneFile(id) {
  if (id.startsWith(REPORT_PREFIX)) {
    const report = await Report.findByIdAndDelete(id.slice(REPORT_PREFIX.length))
    return Boolean(report)
  }
  if (id.startsWith(ATTACHMENT_PREFIX)) {
    const request = await ReportRequest.findById(id.slice(ATTACHMENT_PREFIX.length))
    if (!request?.attachment?.gridFsId) return false
    await deleteAttachment(request.attachment.gridFsId)
    request.attachment = undefined
    await request.save()
    return true
  }
  return false
}

export async function deleteFile(req, res) {
  if (needDB(res)) return
  const ok = await deleteOneFile(req.params.id)
  if (!ok) return res.status(404).json({ error: 'File not found' })
  res.json({ ok: true, id: req.params.id })
}

const bulkDeleteSchema = z.object({ ids: z.array(z.string()).min(1) })

export async function bulkDeleteFiles(req, res) {
  if (needDB(res)) return
  const parsed = bulkDeleteSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  let deleted = 0
  for (const id of parsed.data.ids) {
    if (await deleteOneFile(id)) deleted += 1
  }
  res.json({ ok: true, deleted })
}

const uploadSchema = z.object({
  customerId: z.string().refine((v) => mongoose.isValidObjectId(v), 'Select a valid customer'),
  title: z.string().max(160).optional(),
})

/**
 * Admin "Upload" action in All Files — the exact same AI ingest pipeline as
 * the customer-facing Upload Studio (`reportController.runReportIngestPipeline`),
 * just with an admin-chosen customer as the owner instead of the uploader.
 */
export async function uploadFileForCustomer(req, res) {
  if (needDB(res)) return
  const parsed = uploadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(422).json({ error: 'Invalid request', issues: parsed.error.flatten() })
  const customer = await User.findById(parsed.data.customerId)
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  const io = req.app.get('io')
  const room = `user:${customer._id}`
  const emit = (stage) => io?.to(room).emit('report:stage', { stage })

  let report
  try {
    report = await runReportIngestPipeline({ file: req.file, title: parsed.data.title, ownerId: customer._id, emit })
  } catch (err) {
    return res.status(err.status || 422).json({ error: err.publicMessage || 'We couldn’t process that file.' })
  }

  io?.to(room).emit('report:ready', { id: report.slug })
  logActivity(customer._id, 'report_uploaded', req.adminUser?.name || 'Admin', { reportId: report._id, title: report.title })
  await report.populate('owner', 'name email')
  res.status(201).json({ file: reportToFile(report) })
}
