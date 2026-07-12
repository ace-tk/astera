import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth } from '../middleware/index.js'
import { signup, login, me } from '../controllers/authController.js'
import { listReports, getReport, createReport, updateReport, deleteReport } from '../controllers/reportController.js'

const router = Router()

// In-memory upload buffer, capped to a sane size to avoid memory exhaustion.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

router.get('/health', (req, res) => res.json({ ok: true, service: 'astera-api', ts: Date.now() }))

// Auth
router.post('/auth/signup', asyncHandler(signup))
router.post('/auth/login', asyncHandler(login))
router.get('/auth/me', requireAuth, asyncHandler(me))

// Reports — every route is owner-scoped and REQUIRES auth. Demo data lives on
// the client; the API only ever serves a user their own persisted reports.
router.get('/reports', requireAuth, asyncHandler(listReports))
router.get('/reports/:id', requireAuth, asyncHandler(getReport))
router.post('/reports', requireAuth, upload.single('media'), asyncHandler(createReport))
router.patch('/reports/:id', requireAuth, asyncHandler(updateReport))
router.delete('/reports/:id', requireAuth, asyncHandler(deleteReport))

export default router
