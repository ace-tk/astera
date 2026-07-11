import { useCallback, useEffect, useState } from 'react'

/**
 * Persisted, per-report edits captured in Review Mode. Stored locally so a user
 * can correct a title, sharpen the summary, re-prioritize, add notes, or fix
 * action items — and see it reflected immediately on the report.
 */
const key = (id) => `astera:review:${id}`

export function useReportEdits(reportId) {
  const [edits, setEdits] = useState({})

  useEffect(() => {
    try {
      setEdits(JSON.parse(localStorage.getItem(key(reportId)) || '{}'))
    } catch {
      setEdits({})
    }
  }, [reportId])

  const save = useCallback(
    (next) => {
      const clean = { ...next }
      // Drop empty keys so an unedited report has no stored override.
      Object.keys(clean).forEach((k) => {
        if (clean[k] == null || clean[k] === '') delete clean[k]
      })
      setEdits(clean)
      if (Object.keys(clean).length) localStorage.setItem(key(reportId), JSON.stringify(clean))
      else localStorage.removeItem(key(reportId))
    },
    [reportId],
  )

  const reset = useCallback(() => {
    localStorage.removeItem(key(reportId))
    setEdits({})
  }, [reportId])

  return { edits, save, reset, edited: Object.keys(edits).length > 0 }
}
