import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// Report Request attachments (meeting recordings/documents customers attach to
// a request) persist in GridFS — the same Atlas cluster already in use, no new
// infra. Local disk would be wiped on every Render redeploy, and a raw Buffer
// field would risk the 16MB Mongo document cap for real recordings.
const BUCKET_NAME = 'reportRequestAttachments'

const bucket = () => new GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME })

/** Store a file buffer in GridFS, returning its file id. */
export function saveAttachment(buffer, filename, mimetype) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket().openUploadStream(filename, { contentType: mimetype })
    uploadStream.on('error', reject)
    uploadStream.on('finish', () => resolve(uploadStream.id))
    uploadStream.end(buffer)
  })
}

/** Stream a stored attachment straight to an HTTP response. */
export function streamAttachment(gridFsId, res) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket().openDownloadStream(gridFsId)
    downloadStream.on('error', reject)
    downloadStream.on('end', resolve)
    downloadStream.pipe(res)
  })
}

/** Delete a stored attachment (best-effort; used if a request is deleted). */
export async function deleteAttachment(gridFsId) {
  try {
    await bucket().delete(gridFsId)
  } catch {
    // Already gone or never existed — nothing to clean up.
  }
}
