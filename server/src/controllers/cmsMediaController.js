import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { z } from 'zod'
import { Media } from '../models/Media.js'
import { Page } from '../models/Page.js'
import { Blog } from '../models/Blog.js'
import { saveImage, streamImage, deleteImage, sniffImageType } from '../cms/mediaStorage.js'
import { CmsError } from '../cms/pageService.js'
import { inlineText } from '../cms/schemas.js'

const safeName = (name, ext) => {
  const base = String(name || 'image').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image'
  return `${base}.${ext}`
}
const isId = (id) => mongoose.isValidObjectId(id) && /^[a-f0-9]{24}$/i.test(String(id))

export const uploadMedia = async (req, res) => {
  if (!req.file) throw new CmsError(422, 'NO_FILE', 'Attach an image in the "file" field.')
  const type = sniffImageType(req.file.buffer)
  if (!type) throw new CmsError(415, 'UNSUPPORTED_IMAGE', 'Only JPEG, PNG, GIF and WebP images are accepted.')

  const sha256 = crypto.createHash('sha256').update(req.file.buffer).digest('hex')
  const existing = await Media.findOne({ sha256 })
  if (existing) return res.json({ media: existing.toClientJSON(), deduped: true })

  const filename = safeName(req.file.originalname, type.ext)
  const gridFsId = await saveImage(req.file.buffer, filename, type.mime)
  const media = await Media.create({
    filename,
    mimeType: type.mime,
    sizeBytes: req.file.size,
    sha256,
    alt: String(req.body?.alt || '').slice(0, 300),
    title: String(req.body?.title || '').slice(0, 200),
    storage: { provider: 'gridfs', gridFsId },
    uploadedBy: req.adminUser._id,
  })
  res.status(201).json({ media: media.toClientJSON(), deduped: false })
}

export const listMedia = async (req, res) => {
  const items = await Media.find().sort('-createdAt').limit(200)
  res.json({ media: items.map((m) => m.toClientJSON()) })
}

const patchBody = z.object({ title: inlineText(200).optional(), alt: inlineText(300).optional() }).strict()

export const updateMedia = async (req, res) => {
  const parsed = patchBody.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  if (!isId(req.params.id)) throw new CmsError(404, 'NOT_FOUND', 'Media not found')
  const media = await Media.findByIdAndUpdate(req.params.id, parsed.data, { new: true })
  if (!media) throw new CmsError(404, 'NOT_FOUND', 'Media not found')
  res.json({ media: media.toClientJSON() })
}

export const deleteMedia = async (req, res) => {
  if (!isId(req.params.id)) throw new CmsError(404, 'NOT_FOUND', 'Media not found')
  const media = await Media.findById(req.params.id)
  if (!media) throw new CmsError(404, 'NOT_FOUND', 'Media not found')

  const needle = `/api/media/${media._id}`
  const pages = await Page.find({ status: { $ne: 'archived' } })
  const users = pages.filter((p) => JSON.stringify([p.draft?.content, p.live?.content, p.draft?.seo, p.live?.seo]).includes(needle))
  const inText = new RegExp(needle.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'))
  const blogs = await Blog.find({ $or: [{ imageUrl: inText }, { content: inText }, { 'draft.imageUrl': inText }, { 'draft.content': inText }] }).select('title')
  if (users.length || blogs.length) {
    throw new CmsError(409, 'MEDIA_IN_USE', 'This image is used by a page or a blog post and cannot be deleted.', {
      pages: users.map((p) => ({ id: String(p._id), title: p.draft.title })),
      blogs: blogs.map((b) => ({ id: String(b._id), title: b.title })),
    })
  }
  await deleteImage(media.storage.gridFsId)
  await media.deleteOne()
  res.json({ ok: true, id: req.params.id })
}

/** Public. The bytes are immutable per id, so they can be cached hard. */
export const serveMedia = async (req, res, next) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ error: 'Not found' })
    const media = await Media.findById(req.params.id)
    if (!media) return res.status(404).json({ error: 'Not found' })
    res.set({
      'Content-Type': media.mimeType,
      'Content-Length': String(media.sizeBytes),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': `inline; filename="${media.filename}"`,
    })
    await streamImage(media.storage.gridFsId, res)
  } catch (err) {
    next(err)
  }
}
