import { api } from './api'

/** Customer-facing Report Requests API — submit a request, see your own. */
export async function submitReportRequest(formData) {
  const { request } = await api.post('/report-requests', formData)
  return request
}

export async function fetchMyRequests() {
  const { requests } = await api.get('/report-requests')
  return requests
}
