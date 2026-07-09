/**
 * The six palettes surfaced in the theme switcher. `swatch` values are only
 * used to paint the little preview dots — the real palette lives in theme.css.
 */
export const THEMES = [
  { id: 'light', name: 'Light', hint: 'Warm paper', swatch: ['#F8F7F4', '#365DF5', '#FF6B6B'] },
  { id: 'aurora', name: 'Aurora', hint: 'Soft dawn', swatch: ['#F9F6FC', '#7C3AED', '#F472B6'] },
  { id: 'ocean', name: 'Ocean', hint: 'Cool tide', swatch: ['#F0F7FA', '#0E74B3', '#2DD4BF'] },
  { id: 'sunset', name: 'Sunset', hint: 'Warm dusk', swatch: ['#FCF5F0', '#EA5833', '#F59E0B'] },
  { id: 'forest', name: 'Forest', hint: 'Sage & moss', swatch: ['#F4F7F2', '#15803D', '#84CC16'] },
  { id: 'royal', name: 'Royal', hint: 'Deep indigo', swatch: ['#141226', '#818CF8', '#FACC15'] },
]

export const DEFAULT_THEME = 'light'
