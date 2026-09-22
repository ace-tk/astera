/** JSON.stringify with sorted keys, so two structurally equal values compare equal. */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  return `{${Object.keys(value)
    .filter((k) => value[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`
}

/** The parts of a page version that matter for "does the draft differ from live". */
export const versionFingerprint = (v) => {
  if (!v) return ''
  const p = typeof v.toObject === 'function' ? v.toObject() : v
  return stableStringify({ title: p.title, slug: p.slug, content: p.content, seo: p.seo })
}

/** Plain, detached copy of a version (drops Mongoose internals). */
export const cloneVersion = (v) => JSON.parse(JSON.stringify(v))

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function normalizePath(input) {
  if (typeof input !== 'string') return ''
  let p = input.split('#')[0].split('?')[0].trim()
  if (!p.startsWith('/')) p = `/${p}`
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p
}
