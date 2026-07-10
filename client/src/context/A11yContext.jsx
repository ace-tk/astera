import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const A11yContext = createContext(null)
const KEY = 'astera:a11y'

const DEFAULTS = { reduceMotion: false, largeText: false, alwaysFocus: false }

/**
 * Accessibility preferences. `reduceMotion` also drives Framer's global
 * MotionConfig (see App) so JS-driven animations settle instantly, not just CSS
 * ones. The rest apply via data attributes consumed in globals.css.
 */
export function A11yProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window === 'undefined') return DEFAULTS
    try {
      return { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(KEY) || '{}') }
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(prefs))
    const root = document.documentElement
    root.dataset.reduceMotion = prefs.reduceMotion ? 'on' : 'off'
    root.dataset.largeText = prefs.largeText ? 'on' : 'off'
    root.dataset.alwaysFocus = prefs.alwaysFocus ? 'on' : 'off'
  }, [prefs])

  const set = (key, val) => setPrefs((p) => ({ ...p, [key]: val }))
  const value = useMemo(() => ({ ...prefs, set }), [prefs])
  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>
}

export function useA11y() {
  const ctx = useContext(A11yContext)
  if (!ctx) throw new Error('useA11y must be used within an A11yProvider')
  return ctx
}
