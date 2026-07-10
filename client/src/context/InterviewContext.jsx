import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const InterviewContext = createContext(null)
const KEY = 'astera:interview'

/**
 * Interview Mode — a presenter aid. When enabled, small ⓘ badges appear across
 * the product; clicking one explains the engineering decision behind that
 * screen (why React Flow, why this animation, how it performs). Off by default;
 * lives only for interviews.
 */
export function InterviewProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(KEY) === '1'
  })
  useEffect(() => {
    window.localStorage.setItem(KEY, enabled ? '1' : '0')
    document.documentElement.dataset.interview = enabled ? 'on' : 'off'
  }, [enabled])

  const value = useMemo(() => ({ enabled, setEnabled, toggle: () => setEnabled((v) => !v) }), [enabled])
  return <InterviewContext.Provider value={value}>{children}</InterviewContext.Provider>
}

export function useInterview() {
  const ctx = useContext(InterviewContext)
  if (!ctx) throw new Error('useInterview must be used within an InterviewProvider')
  return ctx
}
