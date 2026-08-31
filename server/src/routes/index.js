import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth, requireAdmin } from '../middleware/index.js'
import { signup, login, me, verifyEmail, resendVerification } from '../controllers/authController.js'
import { updateMe } from '../controllers/userController.js'
import { listReports, getReport, createReport, updateReport, deleteReport, getProgress } from '../controllers/reportController.js'
import * as admin from '../controllers/adminController.js'
import * as reportRequests from '../controllers/reportRequestController.js'
import * as customers from '../controllers/customerController.js'
import * as files from '../controllers/fileController.js'
import * as blog from '../controllers/blogController.js'

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
router.get('/auth/verify-email/:token', asyncHandler(verifyEmail))
router.post('/auth/resend-verification', asyncHandler(resendVerification))

// Reports — every route is owner-scoped and REQUIRES auth. Demo data lives on
// the client; the API only ever serves a user their own persisted reports.
router.get('/reports', requireAuth, asyncHandler(listReports))
// Reconnect recovery for the live upload progress bar — registered before
// "/reports/:id" for clarity, though the extra path segment means there's no
// actual ambiguity between the two (unlike the bulk-status/:id case below).
router.get('/reports/progress/:jobId', requireAuth, asyncHandler(getProgress))
router.get('/reports/:id', requireAuth, asyncHandler(getReport))
router.post('/reports', requireAuth, uploadMedia, asyncHandler(createReport))
router.patch('/reports/:id', requireAuth, asyncHandler(updateReport))
router.delete('/reports/:id', requireAuth, asyncHandler(deleteReport))

// Report Requests — customer submits, admin manages. Distinct from /reports:
// no AI runs on these until an admin manually authors a report from one.
router.post('/report-requests', requireAuth, uploadMedia, asyncHandler(reportRequests.createRequest))
router.get('/report-requests', requireAuth, asyncHandler(reportRequests.listMyRequests))

// Blog — public, no auth. Homepage's Blog section reads only the "featured"
// one; ":slug" backs the Read More destination. NOTE: "featured" must be
// registered before ":slug" or Express would treat it as a slug value.
router.get('/blog/featured', asyncHandler(blog.getFeaturedBlog))
router.get('/blog/:slug', asyncHandler(blog.getBlogBySlug))

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

// Admin — Customer Management.
// NOTE: the static "bulk-status" path must be registered before ":id" routes
// — Express matches in registration order, so a dynamic segment declared
// first would otherwise swallow the literal "bulk-status" as an :id value.
router.get('/admin/customers', requireAuth, requireAdmin, asyncHandler(customers.listCustomers))
router.post('/admin/customers', requireAuth, requireAdmin, asyncHandler(customers.createCustomer))
router.patch('/admin/customers/bulk-status', requireAuth, requireAdmin, asyncHandler(customers.bulkUpdateCustomerStatus))
router.get('/admin/customers/:id', requireAuth, requireAdmin, asyncHandler(customers.getCustomer))
router.patch('/admin/customers/:id', requireAuth, requireAdmin, asyncHandler(customers.updateCustomer))
router.patch('/admin/customers/:id/status', requireAuth, requireAdmin, asyncHandler(customers.updateCustomerStatus))
router.post('/admin/customers/:id/resend-invitation', requireAuth, requireAdmin, asyncHandler(customers.resendInvitation))
router.post('/admin/customers/:id/resend-verification', requireAuth, requireAdmin, asyncHandler(customers.resendCustomerVerification))
router.post('/admin/customers/:id/reset-password', requireAuth, requireAdmin, asyncHandler(customers.resetPassword))
router.post('/admin/customers/:id/reports', requireAuth, requireAdmin, asyncHandler(customers.uploadReportToCustomer))
router.get('/admin/customers/:id/activity', requireAuth, requireAdmin, asyncHandler(customers.getCustomerActivity))
router.get('/admin/customers/:id/notes', requireAuth, requireAdmin, asyncHandler(customers.listCustomerNotes))
router.post('/admin/customers/:id/notes', requireAuth, requireAdmin, asyncHandler(customers.createCustomerNote))
router.patch('/admin/customers/:id/notes/:noteId', requireAuth, requireAdmin, asyncHandler(customers.updateCustomerNote))
router.delete('/admin/customers/:id/notes/:noteId', requireAuth, requireAdmin, asyncHandler(customers.deleteCustomerNote))

// Admin — All Files. A browsing layer over existing Reports + Report Request
// attachments (see fileController.js) — introduces no new file storage.
// NOTE: static paths ("stats", "bulk-archive", "bulk-delete", "upload") must be
// registered before ":id" for the same reason as "bulk-status" above.
router.get('/admin/files', requireAuth, requireAdmin, asyncHandler(files.listFiles))
router.get('/admin/files/stats', requireAuth, requireAdmin, asyncHandler(files.getFileStats))
router.post('/admin/files/upload', requireAuth, requireAdmin, uploadMedia, asyncHandler(files.uploadFileForCustomer))
router.patch('/admin/files/bulk-archive', requireAuth, requireAdmin, asyncHandler(files.bulkArchiveFiles))
router.delete('/admin/files/bulk-delete', requireAuth, requireAdmin, asyncHandler(files.bulkDeleteFiles))
router.get('/admin/files/:id', requireAuth, requireAdmin, asyncHandler(files.getFile))
router.patch('/admin/files/:id/rename', requireAuth, requireAdmin, asyncHandler(files.renameFile))
router.patch('/admin/files/:id/archive', requireAuth, requireAdmin, asyncHandler(files.archiveFile))
router.delete('/admin/files/:id', requireAuth, requireAdmin, asyncHandler(files.deleteFile))

// Admin — Blog management (CRUD). The public /blog/featured route above is
// the only thing the Homepage reads; these let an admin actually populate it.
router.get('/admin/blogs', requireAuth, requireAdmin, asyncHandler(blog.listBlogs))
router.post('/admin/blogs', requireAuth, requireAdmin, asyncHandler(blog.createBlog))
router.get('/admin/blogs/:id', requireAuth, requireAdmin, asyncHandler(blog.getBlog))
router.patch('/admin/blogs/:id', requireAuth, requireAdmin, asyncHandler(blog.updateBlog))
router.delete('/admin/blogs/:id', requireAuth, requireAdmin, asyncHandler(blog.deleteBlog))

export default router
