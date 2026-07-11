import { useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'

/**
 * Resolves a feature-accent name to a concrete hex for the *current* theme, so
 * SVG charts (which can't read Tailwind's alpha tokens) shift with the palette.
 * Kept as a plain lookup — synchronous and reliable — mirroring theme.css.
 */
const DEFAULTS = {
  royal: '#365DF5', coral: '#FF6B6B', golden: '#F6C453', emerald: '#16B364',
  orange: '#FF9F43', sky: '#38BDF8', rose: '#F43F5E', purple: '#7C3AED', mint: '#4ADE80',
}

// Per-theme overrides (see theme.css). Light uses the defaults.
const OVERRIDES = {
  sunset: { royal: '#EA5833', golden: '#F59E0B' },
  royal: { royal: '#818CF8', golden: '#FACC15', coral: '#FB7185' },
}

export function themeHex(theme, name) {
  return OVERRIDES[theme]?.[name] || DEFAULTS[name] || DEFAULTS.royal
}

export function useThemeHex() {
  const { theme } = useTheme()
  return useCallback((name) => themeHex(theme, name), [theme])
}
