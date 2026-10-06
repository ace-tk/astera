/**
 * Site pages (Tarification, À propos, Contact, …): the page's content in code is the
 * DEFAULT, the CMS only ever overrides values inside that exact structure. `mergeContent`
 * is what makes that safe — it walks the defaults and takes an override only where the
 * CMS value has the same type at the same place, so a missing, stale, partial or malformed
 * CMS answer can never blank a page or change its layout.
 *
 * - strings/numbers/booleans: the CMS value wins when it has the same type (an empty
 *   string never wins over a non-empty default — a heading can't be blanked by accident);
 * - arrays: merged element by element, only when the CMS array has the SAME length
 *   (items can't be added or removed from the admin — the design owns the structure);
 * - objects: merged key by key over the DEFAULTS' keys (unknown CMS keys are ignored);
 * - anything else (components such as icons — functions OR React element-type objects like
 *   lucide's forwardRef icons —, null): always the default, returned by reference so a component
 *   keeps its identity across renders.
 *
 * Keys in LOCKED_KEYS are design tokens, never content: the default always wins.
 * Mirrors server/src/cms/sitePageShape.js, which enforces the same rules on save.
 */
export const LOCKED_KEYS = new Set([
  'id', 'type', 'color', 'ordered', 'featured', 'kind', 'variant',
  // behaviour/design tokens of the newer site pages: quiz scoring, filters, anchors, accents, icons
  'icon', 'anchor', 'score', 'level', 'min', 'accent', 'filter', 'categories',
])

export function mergeContent(defaults, override, key) {
  if (key && LOCKED_KEYS.has(key)) return defaults
  const t = typeof defaults
  if (t === 'string') return typeof override === 'string' && override !== '' ? override : defaults
  if (t === 'number') return typeof override === 'number' && Number.isFinite(override) ? override : defaults
  if (t === 'boolean') return typeof override === 'boolean' ? override : defaults
  if (Array.isArray(defaults)) {
    if (!Array.isArray(override) || override.length !== defaults.length) return defaults
    return defaults.map((d, i) => mergeContent(d, override[i]))
  }
  if (defaults && t === 'object' && !defaults.$$typeof) {
    const o = override && typeof override === 'object' && !Array.isArray(override) ? override : {}
    return Object.fromEntries(Object.keys(defaults).map((k) => [k, mergeContent(defaults[k], o[k], k)]))
  }
  return defaults
}
