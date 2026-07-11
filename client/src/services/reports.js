import { api } from './api'
import { config } from '@/config'
import { getReports as getMockReports, getReport as getMockReport } from './mockData'

/**
 * Report data access. In demo mode (default) it resolves the local seeded data
 * so the whole product is explorable with no backend. Flip VITE_DEMO_MODE=false
 * and point VITE_API_URL at the server to use the live API — the shapes match.
 */
export async function fetchReports() {
  if (config.demoMode) return getMockReports()
  const { reports } = await api.get('/reports')
  return reports
}

export async function fetchReport(id) {
  if (config.demoMode) return getMockReport(id)
  const { report } = await api.get(`/reports/${id}`)
  return report
}
