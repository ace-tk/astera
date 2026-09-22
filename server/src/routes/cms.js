import { Router } from 'express'
import multer from 'multer'
import { asyncHandler, requireAuth, requireAdmin } from '../middleware/index.js'
import { cms } from '../cms/http.js'
import { MEDIA_MAX_BYTES } from '../cms/constants.js'
import * as pageCtl from '../controllers/cmsPageController.js'
import * as menuCtl from '../controllers/cmsMenuController.js'
import * as mediaCtl from '../controllers/cmsMediaController.js'
import * as navCtl from '../controllers/cmsSectionNavController.js'

const router = Router()
const adminOnly = [requireAuth, requireAdmin]

const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MEDIA_MAX_BYTES, files: 1 } }).single('file')
const uploadImage = (req, res, next) =>
  imageUpload(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `That image is too large. The limit is ${MEDIA_MAX_BYTES / 1024 / 1024} MB.`, code: 'FILE_TOO_LARGE' })
    }
    return res.status(400).json({ error: 'Upload failed. Please try again.', code: 'UPLOAD_FAILED' })
  })

/* ---------------- Public: read-only, LIVE content only ---------------- */
router.get('/cms/index', cms(pageCtl.publicIndex))
router.get('/cms/pages', cms(pageCtl.publicPage))
router.get('/cms/menus/:key', cms(menuCtl.publicMenu))
router.get('/cms/navigation', cms(navCtl.publicNavigation))
router.get('/media/:id/:filename', mediaCtl.serveMedia)

/* ---------------- Admin: templates (read-only — code-defined) ---------------- */
router.get('/admin/cms/templates', ...adminOnly, cms(pageCtl.listTemplates))
router.get('/admin/cms/templates/:key', ...adminOnly, cms(pageCtl.getTemplateDefinition))

/* ---------------- Admin: pages ---------------- */
router.get('/admin/cms/pages', ...adminOnly, cms(pageCtl.listPages))
router.post('/admin/cms/pages', ...adminOnly, cms(pageCtl.createPage))
router.get('/admin/cms/pages/:id', ...adminOnly, cms(pageCtl.getPage))
router.patch('/admin/cms/pages/:id', ...adminOnly, cms(pageCtl.updatePage))
router.delete('/admin/cms/pages/:id', ...adminOnly, cms(pageCtl.removePage))
router.get('/admin/cms/pages/:id/preview', ...adminOnly, cms(pageCtl.previewPage))
router.get('/admin/cms/pages/:id/usages', ...adminOnly, cms(pageCtl.usages))
router.get('/admin/cms/pages/:id/revisions', ...adminOnly, cms(pageCtl.listRevisions))
router.post('/admin/cms/pages/:id/revisions/:seq/restore', ...adminOnly, cms(pageCtl.restoreRevision))
router.post('/admin/cms/pages/:id/publish', ...adminOnly, cms(pageCtl.publishPage))
router.post('/admin/cms/pages/:id/unpublish', ...adminOnly, cms(pageCtl.unpublishPage))
router.post('/admin/cms/pages/:id/discard-draft', ...adminOnly, cms(pageCtl.discardDraft))
router.post('/admin/cms/pages/:id/duplicate', ...adminOnly, cms(pageCtl.duplicatePage))
router.post('/admin/cms/pages/:id/restore', ...adminOnly, cms(pageCtl.restorePage))

/* ---------------- Admin: menus ---------------- */
router.get('/admin/cms/menus/:key', ...adminOnly, cms(menuCtl.getMenu))
router.patch('/admin/cms/menus/:key', ...adminOnly, cms(menuCtl.saveMenuDraft))
router.post('/admin/cms/menus/:key/publish', ...adminOnly, cms(menuCtl.publishMenu))
router.post('/admin/cms/menus/:key/discard', ...adminOnly, cms(menuCtl.discardMenuDraft))
router.post('/admin/cms/menus/:key/initialize', ...adminOnly, cms(menuCtl.initializeMenu))

/* ---------------- Admin: section navigation (side nav + previous/next order) ---------------- */
router.get('/admin/cms/section-navs', ...adminOnly, cms(navCtl.listSectionNavs))
router.get('/admin/cms/section-navs/:section', ...adminOnly, cms(navCtl.getSectionNav))
router.patch('/admin/cms/section-navs/:section', ...adminOnly, cms(navCtl.saveDraft))
router.post('/admin/cms/section-navs/:section/initialize', ...adminOnly, cms(navCtl.initialize))
router.post('/admin/cms/section-navs/:section/publish', ...adminOnly, cms(navCtl.publish))
router.post('/admin/cms/section-navs/:section/discard', ...adminOnly, cms(navCtl.discard))

/* ---------------- Admin: media ---------------- */
router.get('/admin/cms/media', ...adminOnly, cms(mediaCtl.listMedia))
router.post('/admin/cms/media', ...adminOnly, uploadImage, cms(mediaCtl.uploadMedia))
router.patch('/admin/cms/media/:id', ...adminOnly, cms(mediaCtl.updateMedia))
router.delete('/admin/cms/media/:id', ...adminOnly, cms(mediaCtl.deleteMedia))

// (asyncHandler is intentionally unused here: `cms()` already handles async errors.)
void asyncHandler

export default router
