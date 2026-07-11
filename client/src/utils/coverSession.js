/**
 * Tracks which reports have already played their cover reveal this session, so a
 * report opens with the cinematic cover once and skips it on subsequent visits.
 * Session-scoped (in-memory) by design — a fresh tab shows the cover again.
 */
const shown = new Set()

export const wasCovered = (id) => shown.has(id)
export const markCovered = (id) => shown.add(id)
