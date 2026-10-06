/**
 * "Site pages" (Tarification, À propos, Contact, …): every page's content has a FIXED shape — the
 * page's own hardcoded content (client/src/cms/sitePageRegistry.js, mirrored here as the
 * generated sitePageDefaults.json). The admin can change the VALUES inside it, nothing else:
 *
 *   - same keys, same nesting, same array lengths (nothing can be added, removed or reordered —
 *     the design owns the structure);
 *   - same types (text stays text, a price stays a number);
 *   - design tokens (LOCKED_KEYS: id/type/color/…) must equal the default;
 *   - a text that is not empty by default can't be emptied;
 *   - link fields (to/href/src) must be a site path, an http(s) URL, mailto: or tel:; no text
 *     may start with a script-ish scheme (javascript:, data:, vbscript:).
 *
 * Mirrors client/src/cms/mergeContent.js, which applies the same rules when rendering.
 */
export const LOCKED_KEYS = new Set([
  'id', 'type', 'color', 'ordered', 'featured', 'kind', 'variant',
  'icon', 'anchor', 'score', 'level', 'min', 'accent', 'filter', 'categories',
])
const LINK_KEYS = new Set(['to', 'href', 'src'])
const MAX_TEXT = 6000
// Whole-page Markdown bodies (hub pages, CGV) are far longer than a heading or a paragraph.
const MAX_MARKDOWN = 60000
const MARKDOWN_KEY = 'markdown'
const MAX_NUMBER = 1_000_000

const SAFE_LINK = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i
const BAD_SCHEME = /^\s*(javascript|data|vbscript):/i
// A Markdown link/image whose target uses a script-ish scheme: [x](javascript:…)
const BAD_MD_LINK = /\]\(\s*<?\s*(javascript|data|vbscript):/i

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/** Fills anything missing in `content` (a page saved before a field existed) from the defaults. Never throws. */
export function fillMissing(defaults, content, key) {
  if (key && LOCKED_KEYS.has(key)) return defaults
  if (Array.isArray(defaults)) {
    if (!Array.isArray(content) || content.length !== defaults.length) return defaults
    return defaults.map((d, i) => fillMissing(d, content[i]))
  }
  if (isPlainObject(defaults)) {
    const c = isPlainObject(content) ? content : {}
    return Object.fromEntries(Object.keys(defaults).map((k) => [k, fillMissing(defaults[k], c[k], k)]))
  }
  return typeof content === typeof defaults && content !== undefined && content !== null && !(typeof defaults === 'string' && content === '') ? content : defaults
}

/**
 * Strictly checks `content` against `defaults`. Returns `{ content, issues }` — `issues` is a list
 * of `{ path, message }` (empty when valid). `content` is only meaningful when there are no issues.
 */
export function validateSitePageContent(defaults, content) {
  const issues = []
  const bad = (path, message) => issues.push({ path: path.join('.'), message })

  const walk = (d, c, path, key) => {
    if (key && LOCKED_KEYS.has(key)) {
      if (!same(d, c)) bad(path, 'This value is part of the page design and cannot be changed')
      return d
    }
    if (Array.isArray(d)) {
      if (!Array.isArray(c)) { bad(path, 'Must be a list'); return d }
      if (c.length !== d.length) { bad(path, `Must have exactly ${d.length} items (items cannot be added or removed)`); return d }
      return d.map((item, i) => walk(item, c[i], [...path, i]))
    }
    if (isPlainObject(d)) {
      if (!isPlainObject(c)) { bad(path, 'Must be an object'); return d }
      for (const k of Object.keys(c)) if (!(k in d)) bad([...path, k], 'Unknown field')
      return Object.fromEntries(Object.keys(d).map((k) => [k, walk(d[k], c[k], [...path, k], k)]))
    }
    if (typeof d === 'string') {
      if (typeof c !== 'string') { bad(path, 'Must be text'); return d }
      if (d !== '' && c.trim() === '') { bad(path, 'This text cannot be empty'); return d }
      const max = key === MARKDOWN_KEY ? MAX_MARKDOWN : MAX_TEXT
      if (c.length > max) { bad(path, `At most ${max} characters`); return d }
      if (BAD_SCHEME.test(c)) { bad(path, 'This kind of link is not allowed'); return d }
      if (key === MARKDOWN_KEY && BAD_MD_LINK.test(c)) { bad(path, 'This kind of link is not allowed'); return d }
      if (key && LINK_KEYS.has(key) && c !== '' && !SAFE_LINK.test(c)) { bad(path, 'Must be a site path (/page), a web address (https://…), mailto: or tel:'); return d }
      return c
    }
    if (typeof d === 'number') {
      if (typeof c !== 'number' || !Number.isFinite(c)) { bad(path, 'Must be a number'); return d }
      if (c < 0 || c > MAX_NUMBER) { bad(path, `Must be between 0 and ${MAX_NUMBER}`); return d }
      return c
    }
    if (typeof d === 'boolean') {
      if (typeof c !== 'boolean') { bad(path, 'Must be true or false'); return d }
      return c
    }
    return d
  }

  const out = walk(defaults, content, [])
  return { content: out, issues }
}
