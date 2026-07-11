import { useQuery } from '@tanstack/react-query'
import { fetchReports, fetchReport } from '@/services/reports'

/** React Query hooks over the reports service (demo-aware). */
export function useReports() {
  return useQuery({ queryKey: ['reports'], queryFn: fetchReports })
}

export function useReport(id) {
  return useQuery({ queryKey: ['report', id], queryFn: () => fetchReport(id), enabled: Boolean(id) })
}
