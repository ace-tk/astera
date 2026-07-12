import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { getReports, getReport, isDemoId } from '@/services/mockData'
import { fetchMyReports, fetchMyReport, updateMyReport, deleteMyReport } from '@/services/reports'

/**
 * Report data hooks. The axis is authentication, not a build flag:
 *  - Signed-in users (Real Workspace) get ONLY their own reports from MongoDB.
 *  - Guests (Explore Demo) get the seeded demo data — fully client-side.
 *
 * Seeded demo reports stay reachable by id (the showcase in the Demos gallery)
 * even when signed in, so they never leak into a real user's list yet still open.
 *
 * While the session is being restored we hold `isLoading` true so consumers show
 * a loader instead of flashing an empty/demo state before the real data arrives.
 */
export function useReports() {
  const { isAuthed, isLoading: authLoading } = useAuth()
  const query = useQuery({
    queryKey: ['reports', isAuthed ? 'me' : 'demo'],
    queryFn: isAuthed ? fetchMyReports : () => getReports(),
    enabled: !authLoading,
  })
  return { ...query, isLoading: authLoading || query.isLoading }
}

export function useReport(id) {
  const { isAuthed, isLoading: authLoading } = useAuth()
  // Demo reports (and any lookup while unauthenticated) resolve from seeded data.
  const demo = !isAuthed || isDemoId(id)
  const query = useQuery({
    queryKey: ['report', demo ? 'demo' : 'me', id],
    queryFn: () => (demo ? getReport(id) : fetchMyReport(id)),
    enabled: Boolean(id) && !authLoading,
    retry: false, // a 404 (not yours / missing) shouldn't retry — surface it
  })
  return { ...query, isLoading: authLoading || query.isLoading }
}

/** Persist a report edit (rename, summary, priority, notes, action items, feedback). */
export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }) => updateMyReport(id, patch),
    onSuccess: (report) => {
      qc.setQueryData(['report', 'me', report.id], report)
      qc.invalidateQueries({ queryKey: ['reports', 'me'] })
    },
  })
}

/** Delete a report and drop it from the cached list immediately. */
export function useDeleteReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteMyReport(id),
    onSuccess: (id) => {
      qc.setQueryData(['reports', 'me'], (prev) => (Array.isArray(prev) ? prev.filter((r) => r.id !== id) : prev))
      qc.removeQueries({ queryKey: ['report', 'me', id] })
      qc.invalidateQueries({ queryKey: ['reports', 'me'] })
    },
  })
}
