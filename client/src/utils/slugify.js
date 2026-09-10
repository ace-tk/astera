/** Shared ASCII/kebab slug helper — anchor ids derived from this must match
 * across independent call sites (e.g. a heading renderer and a nav rail
 * built from the same raw text), so it lives in one place rather than
 * being reimplemented per page. */
export function slugify(text) {
  let out = ''
  for (const ch of String(text).normalize('NFD')) {
    const code = ch.codePointAt(0)
    if (code >= 0x300 && code <= 0x36f) continue // combining diacritical mark, drop it
    out += ch
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
