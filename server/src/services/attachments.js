import mongoose from 'mongoose'
import { GridFSBucket } from 'mongodb'

// Report Request attachments (meeting recordings/documents customers attach to
// a request) persist in GridFS — the same Atlas cluster already in use, no new
// infra. Local disk would be wiped on every Render redeploy, and a raw Buffer
// field would risk the 16MB Mongo document cap for real recordings.
const BUCKET_NAME = 'reportRequestAttachments'

// Other private document types reuse these same helpers with their own bucket name
// (e.g. Client Reports use 'clientReports'); the default keeps every existing caller unchanged.
const bucket = (bucketName = BUCKET_NAME) => new GridFSBucket(mongoose.connection.db, { bucketName })

/** Store a file buffer in GridFS, returning its file id. */
export function saveAttachment(buffer, filename, mimetype, bucketName) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket(bucketName).openUploadStream(filename, { contentType: mimetype })
    uploadStream.on('error', reject)
    uploadStream.on('finish', () => resolve(uploadStream.id))
    uploadStream.end(buffer)
  })
}

/** Stream a stored attachment straight to an HTTP response. */
export function streamAttachment(gridFsId, res, bucketName) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket(bucketName).openDownloadStream(gridFsId)
    downloadStream.on('error', reject)
    downloadStream.on('end', resolve)
    downloadStream.pipe(res)
  })
}

/** Delete a stored attachment (best-effort; used if a request is deleted). */
export async function deleteAttachment(gridFsId, bucketName) {
  try {
    await bucket(bucketName).delete(gridFsId)
  } catch {
    // Already gone or never existed — nothing to clean up.
  }
}
