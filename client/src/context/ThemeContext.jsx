import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_THEME, THEMES } from '@/constants/themes'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'astera:theme'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME
  })

  // A single attribute on <html> drives the entire palette via CSS variables.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    // Keep the mobile browser chrome in sync with the paper color.
    const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()
    if (meta && paper) meta.setAttribute('content', `rgb(${paper.replaceAll(' ', ',')})`)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, themes: THEMES }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
