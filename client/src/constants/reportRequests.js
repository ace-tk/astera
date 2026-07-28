// Mirrors server/src/constants.js — the Report Requests workflow enums.
export const REPORT_TYPES = ['Essential', 'Scope', 'Premium', 'Speaker Analysis', 'Compliance']
export const DELIVERY_MODES = ['Normal', 'Urgent']
export const REQUEST_STATUSES = ['pending_review', 'in_progress', 'ready', 'delivered']

// A friendly turnaround estimate shown on request cards — purely informational,
// doesn't affect the actual delivery pipeline.
const ESTIMATED_DELIVERY = { Normal: 'Within 48 hours', Urgent: 'Within 24 hours' }
export const estimatedDelivery = (deliveryMode) => ESTIMATED_DELIVERY[deliveryMode] || null
