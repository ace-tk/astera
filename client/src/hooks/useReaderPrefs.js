import { useCallback, useEffect, useState } from 'react'

/**
 * Persisted reading preferences per report — bookmarks and sticky notes survive
 * reloads (localStorage), while view settings (zoom, focus, texture) live for
 * the session. Keyed by report id so each report keeps its own annotations.
 */
const key = (id) => `astera:reader:${id}`

export function useReaderPrefs(reportId) {
  const [state, setState] = useState({ bookmarks: [], notes: {} })
  const [zoom, setZoom] = useState(1) // 0 = compact, 1 = default, 2 = large
  const [focus, setFocus] = useState(false)
  const [texture, setTexture] = useState(true)

  useEffect(() => {
    if (!reportId) return
    try {
      const saved = JSON.parse(localStorage.getItem(key(reportId)) || '{}')
      setState({ bookmarks: saved.bookmarks || [], notes: saved.notes || {} })
    } catch {
      setState({ bookmarks: [], notes: {} })
    }
  }, [reportId])

  const persist = useCallback(
    (next) => {
      setState(next)
      if (reportId) localStorage.setItem(key(reportId), JSON.stringify(next))
    },
    [reportId],
  )

  const toggleBookmark = useCallback(
    (sectionId) =>
      persist({
        ...state,
        bookmarks: state.bookmarks.includes(sectionId)
          ? state.bookmarks.filter((b) => b !== sectionId)
          : [...state.bookmarks, sectionId],
      }),
    [persist, state],
  )

  const setNote = useCallback(
    (sectionId, text) => {
      const notes = { ...state.notes }
      if (text.trim()) notes[sectionId] = text
      else delete notes[sectionId]
      persist({ ...state, notes })
    },
    [persist, state],
  )

  return {
    bookmarks: state.bookmarks,
    notes: state.notes,
    toggleBookmark,
    setNote,
    zoom,
    setZoom,
    focus,
    setFocus,
    texture,
    setTexture,
  }
}
