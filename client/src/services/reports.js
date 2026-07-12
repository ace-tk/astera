import { api } from './api'

/**
 * Real-product report access — the authenticated user's own reports, straight
 * from MongoDB. Demo data is resolved separately (services/mockData) and routed
 * by the useReports hook based on auth, so these calls only ever return the
 * signed-in user's data. The response shapes match the demo shape exactly.
 */
export async function fetchMyReports() {
  const { reports } = await api.get('/reports')
  return reports
}

export async function fetchMyReport(id) {
  const { report } = await api.get(`/reports/${id}`)
  return report
}

export async function updateMyReport(id, patch) {
  const { report } = await api.patch(`/reports/${id}`, patch)
  return report
}

export async function deleteMyReport(id) {
  await api.del(`/reports/${id}`)
  return id
}
