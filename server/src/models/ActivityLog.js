import mongoose from 'mongoose'
import { ACTIVITY_TYPES } from '../constants.js'

/**
 * A read-only, admin-only log of notable events for a customer account —
 * backs both the "Customer Activity Timeline" and "Audit History" views
 * (the same underlying facts, just framed differently: what happened to this
 * account vs. what an admin did). Never exposed on any customer-facing route.
 */
const activityLogSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    actor: { type: String, default: 'System' }, // admin name, 'Customer', or 'System'
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
)

activityLogSchema.methods.toClientJSON = function () {
  const o = this.toObject()
  return { id: String(o._id), type: o.type, actor: o.actor, meta: o.meta, at: o.createdAt }
}

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema)

/** Best-effort write — an activity-log failure should never break the action it's recording. */
export async function logActivity(customerId, type, actor, meta) {
  try {
    await ActivityLog.create({ customer: customerId, type, actor, meta })
  } catch (err) {
    console.error('[activityLog] failed to record', type, err.message)
  }
}
