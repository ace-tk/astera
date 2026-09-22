import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// Same approach as services/attachments.js (GridFS on the existing Atlas
// cluster, no new infrastructure) but a separate bucket, and behind a tiny
// adapter so it can move to an object store later without touching callers.
const bucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: 'cmsMedia' })

export function saveImage(buffer, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const up = bucket().openUploadStream(filename, { contentType: mimetype })
    up.on('error', reject)
    up.on('finish', () => resolve(up.id))
    up.end(buffer)
  })
}

export function streamImage(gridFsId, res) {
  return new Promise((resolve, reject) => {
    const down = bucket().openDownloadStream(gridFsId)
    down.on('error', reject)
    down.on('end', resolve)
    down.pipe(res)
  })
}

export async function deleteImage(gridFsId) {
  try {
    await bucket().delete(gridFsId)
  } catch {
    /* already gone */
  }
}

/** Identify a real image by its magic bytes — never trust the client's mimetype. */
export function sniffImageType(buf) {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: 'png' }
  if (buf.slice(0, 3).toString('latin1') === 'GIF') return { mime: 'image/gif', ext: 'gif' }
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') return { mime: 'image/webp', ext: 'webp' }
  return null // SVG and everything else is deliberately refused (script-capable / unknown)
}
