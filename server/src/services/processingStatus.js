import { ProcessingStatus } from '../models/ProcessingStatus.js'

/**
 * Best-effort persistence of an in-flight upload's current stage. Never
 * throws — a Mongo hiccup here must not affect the report pipeline itself,
 * which already succeeds or fails independently of this. A no-op when
 * `jobId` wasn't provided (older clients, or callers that don't need
 * reconnect recovery).
 *
 * Returns a promise so the FIRST call for a given job (creating the
 * document) can be awaited by the caller — this serializes document
 * creation ahead of the pipeline's own (unawaited, fire-and-forget) stage
 * updates and avoids a duplicate-key race where two concurrent upserts both
 * try to insert the same not-yet-existing `_id`. Every call after that first
 * one is a plain update against an existing document, which has no such race.
 */
export function recordStage(jobId, ownerId, stage, extra = {}) {
  if (!jobId) return Promise.resolve()
  return ProcessingStatus.updateOne(
    { _id: jobId, owner: ownerId },
    { $set: { stage, ...extra } },
    { upsert: true },
  ).catch((err) => console.warn('[processingStatus] persist failed:', err.message))
}

/** Read back a job's last known stage — owner-scoped, so a client can only recover its own in-flight uploads. */
export function getStage(jobId, ownerId) {
  return ProcessingStatus.findOne({ _id: jobId, owner: ownerId })
}
