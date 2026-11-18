// A page can say "my canonical is another URL" (CMS field seo.canonicalPath). useCanonical() runs once at the app
// level and owns the <link rel="canonical">; pages tell it about their override through this tiny store, so the
// result does not depend on which effect runs first.
let override = null
const listeners = new Set()

/** '/services/guides/x/' -> '/services/guides/x'; '' / null / not a path -> null. */
export function normalizeCanonicalPath(value) {
  const v = typeof value === 'string' ? value.trim() : ''
  if (!v.startsWith('/') || v.startsWith('//')) return null
  const clean = v.split(/[?#]/)[0]
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean
}

export function setCanonicalOverride(path) {
  const next = normalizeCanonicalPath(path)
  if (next === override) return
  override = next
  listeners.forEach((fn) => fn())
}

export const getCanonicalOverride = () => override
export function subscribeCanonicalOverride(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
