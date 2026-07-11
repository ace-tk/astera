/**
 * Three exceptional palettes surfaced in the theme switcher. `swatch` values
 * only paint the preview dots — the real palette lives in theme.css. Each theme
 * re-skins the entire product (backgrounds, cards, charts, shadows, reader).
 */
export const THEMES = [
  { id: 'light', name: 'Light', hint: 'Warm paper', swatch: ['#F8F7F4', '#365DF5', '#FF6B6B'] },
  { id: 'sunset', name: 'Sunset', hint: 'Warm dusk', swatch: ['#FCF5F0', '#EA5833', '#F59E0B'] },
  { id: 'royal', name: 'Royal', hint: 'Deep indigo', swatch: ['#141226', '#818CF8', '#FACC15'] },
]

export const DEFAULT_THEME = 'light'

// Themes we no longer ship; anyone with one saved falls back to Light.
export const RETIRED_THEMES = ['aurora', 'ocean', 'forest']
