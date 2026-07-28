import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth, requireAdmin } from '../middleware/index.js'
import { signup, login, me } from '../controllers/authController.js'
import { updateMe } from '../controllers/userController.js'
import { listReports, getReport, createReport, updateReport, deleteReport } from '../controllers/reportController.js'
import * as admin from '../controllers/adminController.js'
import * as reportRequests from '../controllers/reportRequestController.js'

const router = Router()

// In-memory upload buffer, capped to 100 MB to avoid memory exhaustion. Files
// are never written to disk — the buffer is passed straight to the ingest
// pipeline and garbage-collected after the response.
const MAX_UPLOAD_MB = 100
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } })

// Wrap multer so file-size / upload errors return a friendly JSON message.
const uploadMedia = (req, res, next) =>
  upload.single('media')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `That file is too large. The limit is ${MAX_UPLOAD_MB} MB — try a shorter recording or extract the audio.` })
    }
    return res.status(400).json({ error: 'Upload failed. Please try again.' })
  })

router.get('/health', (req, res) => res.json({ ok: true, service: 'astera-api', ts: Date.now() }))

// Auth
router.post('/auth/signup', asyncHandler(signup))
router.post('/auth/login', asyncHandler(login))
router.get('/auth/me', requireAuth, asyncHandler(me))
router.patch('/auth/me', requireAuth, asyncHandler(updateMe))

// Reports — every route is owner-scoped and REQUIRES auth. Demo data lives on
// the client; the API only ever serves a user their own persisted reports.
router.get('/reports', requireAuth, asyncHandler(listReports))
router.get('/reports/:id', requireAuth, asyncHandler(getReport))
router.post('/reports', requireAuth, uploadMedia, asyncHandler(createReport))
router.patch('/reports/:id', requireAuth, asyncHandler(updateReport))
router.delete('/reports/:id', requireAuth, asyncHandler(deleteReport))

// Report Requests — customer submits, admin manages. Distinct from /reports:
// no AI runs on these until an admin manually authors a report from one.
router.post('/report-requests', requireAuth, uploadMedia, asyncHandler(reportRequests.createRequest))
router.get('/report-requests', requireAuth, asyncHandler(reportRequests.listMyRequests))

// Admin — every route requires an authenticated admin (403 otherwise).
router.get('/admin/stats', requireAuth, requireAdmin, asyncHandler(admin.stats))
router.get('/admin/users', requireAuth, requireAdmin, asyncHandler(admin.listUsers))
router.get('/admin/reports', requireAuth, requireAdmin, asyncHandler(admin.listReports))
router.get('/admin/reports/:id', requireAuth, requireAdmin, asyncHandler(admin.getReport))
router.patch('/admin/reports/:id', requireAuth, requireAdmin, asyncHandler(admin.updateReport))
router.delete('/admin/reports/:id', requireAuth, requireAdmin, asyncHandler(admin.deleteReport))

router.get('/admin/report-requests', requireAuth, requireAdmin, asyncHandler(reportRequests.listRequests))
router.get('/admin/report-requests/:id', requireAuth, requireAdmin, asyncHandler(reportRequests.getRequest))
router.get('/admin/report-requests/:id/attachment', requireAuth, requireAdmin, asyncHandler(reportRequests.getAttachment))
router.patch('/admin/report-requests/:id', requireAuth, requireAdmin, asyncHandler(reportRequests.updateStatus))
router.post('/admin/report-requests/:id/report', requireAuth, requireAdmin, asyncHandler(reportRequests.createReportFromRequest))

export default router
