import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth } from '../middleware/index.js'
import { signup, login, me } from '../controllers/authController.js'
import { listReports, getReport, createReport } from '../controllers/reportController.js'

const router = Router()

// In-memory upload buffer, capped to a sane size to avoid memory exhaustion.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

router.get('/health', (req, res) => res.json({ ok: true, service: 'astera-api', ts: Date.now() }))

// Auth
router.post('/auth/signup', asyncHandler(signup))
router.post('/auth/login', asyncHandler(login))
router.get('/auth/me', requireAuth, asyncHandler(me))

// Reports — reads are scoped to the caller (or demo data); writes REQUIRE auth
// so a report can never be persisted with an undefined owner.
router.get('/reports', asyncHandler(listReports))
router.get('/reports/:id', asyncHandler(getReport))
router.post('/reports', requireAuth, upload.single('media'), asyncHandler(createReport))

export default router
