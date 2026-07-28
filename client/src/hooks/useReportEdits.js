import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { isDemoId } from '@/services/mockData'
import { useUpdateReport } from '@/hooks/useReports'

/**
 * Per-report edits captured in Review Mode — title, summary, priority, notes,
 * action items.
 *
 * For a signed-in user's own report the edits persist to MongoDB (the report
 * itself is the source of truth). For demo reports (or guests) they persist to
 * localStorage exactly as before, so the demo stays fully client-side.
 */
const key = (id) => `astera:review:${id}`

export function useReportEdits(report) {
  const id = report?.id
  const { isAuthed } = useAuth()
  const cloud = Boolean(isAuthed && id && !isDemoId(id))
  const update = useUpdateReport()
  const [localEdits, setLocalEdits] = useState({})

  // localStorage overlay — demo / guest reports only.
  useEffect(() => {
    if (cloud || !id) {
      setLocalEdits({})
      return
    }
    try {
      setLocalEdits(JSON.parse(localStorage.getItem(key(id)) || '{}'))
    } catch {
      setLocalEdits({})
    }
  }, [id, cloud])

  // Real reports already carry their edited values; expose the persisted review
  // fields (priority, notes) as "edits" so the report page renders them. Title,
  // summary, and commitments come straight off the (updated) report.
  const edits = cloud ? { priority: report?.priority || undefined, notes: report?.notes || undefined } : localEdits

  const save = useCallback(
    async (next) => {
      if (cloud) {
        const patch = {
          priority: next.priority ?? null, // '' / unset → clear
          notes: next.notes ?? '',
          commitments: next.commitments || [],
        }
        if (next.title !== undefined) patch.title = next.title
        if (next.headline !== undefined) patch.headline = next.headline
        await update.mutateAsync({ id, patch })
        return
      }
      // demo / guest → localStorage; drop empty keys so an unedited report has none
      const clean = { ...next }
      Object.keys(clean).forEach((k) => {
        if (clean[k] == null || clean[k] === '') delete clean[k]
      })
      setLocalEdits(clean)
      if (Object.keys(clean).length) localStorage.setItem(key(id), JSON.stringify(clean))
      else localStorage.removeItem(key(id))
    },
    [cloud, id, update],
  )

  const reset = useCallback(() => {
    if (cloud) return
    localStorage.removeItem(key(id))
    setLocalEdits({})
  }, [cloud, id])

  const edited = cloud ? Boolean(report?.priority || report?.notes || report?.hasCustomerEdits) : Object.keys(localEdits).length > 0

  return { edits, save, reset, edited, mode: cloud ? 'cloud' : 'local' }
}
