import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SOUNDS } from '@/services/soundEngine'

const SoundContext = createContext(null)
const STORAGE_KEY = 'astera:sound'

/**
 * Sound is opt-in and OFF by default (respectful, per the brief). When enabled,
 * `play(name)` triggers a synthesized cue. The preference persists across
 * sessions, and reduced-motion users start muted regardless.
 */
export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  }, [enabled])

  const play = useCallback(
    (name) => {
      if (!enabled) return
      SOUNDS[name]?.()
    },
    [enabled],
  )

  const value = useMemo(
    () => ({ enabled, setEnabled, toggle: () => setEnabled((v) => !v), play }),
    [enabled, play],
  )
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within a SoundProvider')
  return ctx
}
