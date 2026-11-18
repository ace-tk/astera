// The 301 redirects that editors manage in the CMS (page editor → "Redirects (301)") as a list for the generated
// .htaccess, so they become real HTTP 301s at the next release instead of only a browser-side redirect.
//
//   strict: true  → the release build: if the CMS cannot be read, STOP (a release made without them would silently
//                   drop redirects that are live today).
//   strict: false → ordinary builds: fall back to the last list read successfully (scripts/seo/generated/), or none.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchRetry } from './apiFetch.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const CACHE = path.join(here, 'generated', 'cms-redirects.json')
const PATH_RE = /^\/[A-Za-z0-9\-._~%/]*$/

/** Keeps only well-formed `{ from, to }` pairs (site paths, not the same, no placeholders). */
export function cleanRedirects(list) {
  const seen = new Set()
  const out = []
  for (const r of Array.isArray(list) ? list : []) {
    const from = typeof r?.from === 'string' ? r.from.trim() : ''
    const to = typeof r?.to === 'string' ? r.to.trim() : ''
    if (!PATH_RE.test(from) || !PATH_RE.test(to) || from === '/' || from === to || seen.has(from)) continue
    seen.add(from)
    out.push({ from, to })
  }
  return out.sort((a, b) => a.from.localeCompare(b.from))
}

export async function loadCmsRedirects({ strict = false, api = process.env.VITE_API_URL || 'https://api.atoopv.com/api' } = {}) {
  if (process.env.SEO_OFFLINE === '1') return []
  try {
    const res = await fetchRetry(`${api.replace(/\/$/, '')}/cms/redirects`)
    // 404: the API in production is older than the redirect manager, so no redirect can exist yet. Nothing to drop.
    if (res.status === 404) { console.warn('! CMS redirects: the API has no /cms/redirects yet (backend not updated): none added'); return [] }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const list = cleanRedirects((await res.json()).redirects)
    fs.mkdirSync(path.dirname(CACHE), { recursive: true })
    fs.writeFileSync(CACHE, `${JSON.stringify(list, null, 2)}\n`)
    return list
  } catch (err) {
    if (strict) throw new Error(`cannot read the CMS redirects (${err.message}). A release without them would drop live redirects: fix the connection or set SEO_OFFLINE=1 to build without.`)
    if (fs.existsSync(CACHE)) {
      console.warn(`! CMS redirects: ${err.message} — using the last list read (${path.relative(process.cwd(), CACHE)})`)
      return cleanRedirects(JSON.parse(fs.readFileSync(CACHE, 'utf8')))
    }
    console.warn(`! CMS redirects: ${err.message} — none added to this .htaccess`)
    return []
  }
}
