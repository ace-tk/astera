// Generates client/public/sitemap.xml at build time (wired as npm's "prebuild"
// hook in package.json, so `npm run build` always ships a current sitemap).
//
// SEO audit fix — item 6 (sitemap must use https://atoopv.com, list only real
// public/indexable URLs, and exclude duplicates/redirects/non-indexable routes).
//
// Two lists are written, on purpose:
//   public/sitemap.xml                       what Google should index: indexable pages only, with <lastmod> (CMS "updatedAt").
//                                            Left out: legal pages, pages hidden from search engines ("noindex" in the CMS),
//                                            pages whose canonical points to another URL, redirected URLs.
//   scripts/seo/generated/prerender-routes.json   every URL that must exist and be pre-rendered (legal and noindex pages
//                                            included, they stay reachable). prerender.mjs and the release .htaccess use THIS.
//
// Every URL comes from a real, existing source: the app's own route structure
// (App.jsx) for static pages, and the actual content/<category>/*.md filenames
// for dynamic ones — exactly the same slugs servicesContent.js/resourcesContent.js
// load at runtime. Nothing here is invented.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { normalizeCanonicalPath } from '../src/hooks/canonicalStore.js'
import { fetchRetry } from './seo/apiFetch.mjs'
import { resolveLastmods, gitDate, FALLBACK_SOURCES } from './seo/lastmod.mjs'

const CLIENT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.resolve(CLIENT_ROOT, '..')
const CONTENT_DIR = path.join(REPO_ROOT, 'content')
const SITE_URL = 'https://atoopv.com'

// One markdown file per page; slug = filename without extension (same rule
// utils/contentMarkdown.js's slugFromPath uses).
function slugsIn(dir) {
  return fs
    .readdirSync(path.join(CONTENT_DIR, dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort()
}

// The one file per Services category that stands in for that category's own
// "hub" (served at the bare /services/<category> URL — see each category's
// index route in App.jsx) — its slug must NOT also get its own /services/<category>/<slug>
// entry, or the sitemap would list the same page twice under two URLs.
// by-city and guides have no such file: their bare category URL is a
// synthesized directory listing (ServiceCategoryDirectory), not a content page.
const SERVICE_HUB_SLUG = {
  drafting: 'nos-services-pv',
  'tarifs-infos': 'tarif-redaction-pv-cse',
  communication: 'communication-cse',
  training: 'formations-elus-cse-agree',
}
const SERVICE_CATEGORIES = ['drafting', 'by-city', 'tarifs-infos', 'guides', 'communication', 'training']

// Same rule for Ressources: guides-livres-blancs-cse is the file served at the
// bare /ressources URL (App.jsx's index route), not at its own slug URL.
const RESSOURCES_HUB_SLUG = 'guides-livres-blancs-cse'

// Legal texts: reachable and pre-rendered, but not search landing pages, so not in the sitemap (client request 17 Nov 2026).
const LEGAL_PATHS = new Set(['/cgv', '/mentions-legales', '/politique-de-confidentialite', '/cookies', '/atoosavoir/cgv', '/services/tarifs-infos/cgu'])

// Static ATOOPV pages that aren't backed by a content/<category>/<slug>.md file.
// "/" is the real ATOOPV homepage (Accueil) since the page-content swap and is
// indexed here; the English/demo Story page lives at "/accueil" (renamed from
// "/atoopv" — same page, same content, only the URL changed).
// Deliberately excludes:
//   "/services/pricing"  an old English pricing page superseded by /tarification,
//                        not linked from any nav — left in place but not indexed.
//   "/simulateur"        duplicate of /tarification; 301-redirected, not indexed.
//   "/atoopv", "/atoopv/*"  the old pre-rename URLs — 301-redirected, not indexed.
//   "/blog/:slug"        dynamic, database-backed posts; not enumerable at build time.
//   /login, /register, /forgot, /verify-email, /app/*  non-indexable / private.
const STATIC_PAGES = [
  '/',
  '/boutique',
  '/tarification',
  '/contact',
  '/a-propos',
  '/autodiagnostic',
  '/atoosavoir',
  '/atoosavoir/exemple',
  '/atoosavoir/cgv',
  '/mentions-legales',
  '/cgv',
  '/politique-de-confidentialite',
  '/cookies',
  '/services',
  '/ressources',
  '/ressources/veille-juridique-cse',
  // Renders correctly on its own address and is the target of two legacy redirects (SEO brief 2.6),
  // although the bare /ressources URL serves the same page.
  '/ressources/guides-livres-blancs-cse',
]

// Pages that exist as a markdown file but must not be listed: exact duplicates of another page.
//   drafting/services → same title/H1 as /services (SEO brief 2.6); 301-redirected to /services.
//   every legacy source of the redirect map (e.g. /services/guides/delai-pv-cse, merged into
//   /services/tarifs-infos/delai-redaction-pv-cse): a URL that answers 301 must never be in the sitemap.
const { REDIRECTS } = await import(pathToFileURL(path.join(CLIENT_ROOT, 'scripts/seo/redirectMap.mjs')).href)
const SITEMAP_EXCLUDE = new Set(['/services/drafting/services', ...REDIRECTS.flatMap((r) => r.from.map((f) => `/${f}`))])

/**
 * Fetches the live CMS index (public, published pages only). Returns a Set of published paths, or
 * null if the CMS could not be reached — in which case the caller must not guess.
 */
async function fetchPublishedPaths() {
  const api = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || envFileApiUrl() || 'https://api.atoopv.com/api').replace(/\/$/, '')
  try {
    const res = await fetchRetry(`${api}/cms/index`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { pages } = await res.json()
    if (!Array.isArray(pages)) throw new Error('unexpected response')
    // The index does not carry the SEO fields: read each published page (public, read-only GET) for noindex / canonical.
    const info = new Map()
    const queue = [...pages]
    const worker = async () => {
      while (queue.length) {
        const p = queue.shift()
        const r = await fetchRetry(`${api}/cms/pages?path=${encodeURIComponent(p.path)}`)
        if (!r.ok) throw new Error(`page ${p.path}: HTTP ${r.status}`)
        const { page } = await r.json()
        info.set(p.path, { noindex: Boolean(page?.seo?.noindex), canonical: normalizeCanonicalPath(page?.seo?.canonicalPath), updatedAt: p.updatedAt || page?.updatedAt || null })
      }
    }
    await Promise.all(Array.from({ length: 3 }, worker))
    // when the editable non-article content was last published (home, Tarification, Contact, hubs ...); an API older than
    // this endpoint answers 404: then those pages fall back to the date of the source file
    let dates = {}
    const dr = await fetchRetry(`${api}/cms/dates`)
    if (dr.ok) dates = await dr.json()
    else if (dr.status !== 404) throw new Error(`dates: HTTP ${dr.status}`)
    else console.warn('! sitemap: the API has no /cms/dates yet (backend not updated): site pages use the date of their source file')
    return { paths: new Set(pages.map((p) => p.path)), pages, info, dates }
  } catch (err) {
    console.warn(`! sitemap: could not read the CMS (${err.message})`)
    return null
  }
}

function envFileApiUrl() {
  try {
    const m = fs.readFileSync(path.join(CLIENT_ROOT, '.env.production'), 'utf8').match(/^VITE_API_URL=(.+)$/m)
    return m ? m[1].trim() : null
  } catch {
    return null
  }
}

async function loadDrivenSlugs() {
  const m = await import(pathToFileURL(path.join(CLIENT_ROOT, 'src/cms/drivenSlugs.js')).href)
  return { services: m.CMS_DRIVEN_SLUGS, ressources: m.CMS_DRIVEN_RESSOURCES }
}

/**
 * Rule: a page that was migrated into the CMS is listed ONLY while it is published there. A migrated
 * page that is a draft/removed in the CMS is not served by the app (it redirects/404s), so listing it
 * would hand Google a URL that does not answer 200. A page that never entered the CMS is always served
 * from its markdown file and is listed.
 */
function buildUrls({ published, driven }) {
  const urls = [...STATIC_PAGES]
  const skipped = []
  const addedFromCms = []
  const isLive = (urlPath, slug, drivenSet) => !published || !drivenSet.has(slug) || published.paths.has(urlPath)

  for (const category of SERVICE_CATEGORIES) {
    urls.push(`/services/${category}`)
    const hubSlug = SERVICE_HUB_SLUG[category]
    for (const slug of slugsIn(category)) {
      if (slug === hubSlug) continue
      const u = `/services/${category}/${slug}`
      if (SITEMAP_EXCLUDE.has(u)) { skipped.push([u, 'merged or redirected — answers 301']); continue }
      if (!isLive(u, slug, driven.services)) { skipped.push([u, 'not published in the CMS']); continue }
      urls.push(u)
    }
  }

  for (const slug of slugsIn('resources')) {
    if (slug === RESSOURCES_HUB_SLUG) continue
    const u = `/ressources/${slug}`
    if (SITEMAP_EXCLUDE.has(u)) { skipped.push([u, 'merged or redirected — answers 301']); continue }
    if (!isLive(u, slug, driven.ressources)) { skipped.push([u, 'not published in the CMS']); continue }
    urls.push(u)
  }

  // Pages that exist ONLY in the CMS (no markdown file, e.g. /services/tarifs-infos/cgu): without this they would
  // not be pre-rendered and the server would answer 404 for a page that is published and linked from the menu.
  if (published) {
    const have = new Set(urls)
    for (const page of published.pages) {
      const u = page.path
      if (page.isHub || have.has(u) || SITEMAP_EXCLUDE.has(u)) continue
      if (!/^\/(services\/[a-z-]+|ressources)\/[a-z0-9-]+$/.test(u)) continue
      urls.push(u)
      addedFromCms.push(u)
    }
  }

  return { urls, skipped, addedFromCms }
}

function toXml(entries) {
  const lines = entries.map((e) => `  <url>\n    <loc>${SITE_URL}${e.path}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ''}\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`
}

const outPath = path.join(CLIENT_ROOT, 'public', 'sitemap.xml')
const strict = process.env.SEO_STRICT === '1'
const published = process.env.SITEMAP_OFFLINE === '1' ? null : await fetchPublishedPaths()

if (!published && strict) {
  console.error('generate-sitemap: the CMS index is unreachable and SEO_STRICT=1 — refusing to write a sitemap that might list unpublished pages.')
  process.exit(1)
}
if (!published && fs.existsSync(outPath)) {
  // Never replace a good sitemap by a guess made without the CMS (e.g. a server build while the API is down).
  console.warn(`! sitemap: keeping the existing ${path.relative(REPO_ROOT, outPath)} unchanged.`)
  process.exit(0)
}

const { urls, skipped, addedFromCms } = buildUrls({ published, driven: await loadDrivenSlugs() })
const unique = new Set(urls)
if (unique.size !== urls.length) {
  throw new Error(`generate-sitemap: duplicate URL(s) detected — refusing to write a sitemap with duplicates.`)
}
// Every URL listed must be a redirect-map TARGET-safe path: never a path the server redirects away.
const redirected = new Set((await import('./seo/redirectMap.mjs')).REDIRECTS.flatMap((r) => r.from.map((f) => `/${f}`)))
const clash = urls.filter((u) => redirected.has(u))
if (clash.length) throw new Error(`generate-sitemap: URL(s) listed that the server redirects away: ${clash.join(', ')}`)

// ---- which of the valid URLs belong in the sitemap
const info = published?.info
const listed = []
const notListed = []
for (const u of urls) {
  const i = info?.get(u)
  if (LEGAL_PATHS.has(u)) { notListed.push([u, 'legal page']); continue }
  if (i?.noindex) { notListed.push([u, 'hidden from search engines (noindex) in the CMS']); continue }
  if (i?.canonical && i.canonical !== u) { notListed.push([u, `canonical points to ${i.canonical}`]); continue }
  listed.push(u)
}
// every listed URL gets a <lastmod> (see scripts/seo/lastmod.mjs for the rules)
const cmsDates = new Map([...(info || new Map())].filter(([, v]) => v.updatedAt).map(([k, v]) => [k, v.updatedAt]))
const lastmods = published
  ? resolveLastmods({ urls: listed, cmsDates, dates: published.dates, fallback: (key) => (FALLBACK_SOURCES[key] ? gitDate(FALLBACK_SOURCES[key], REPO_ROOT) : null) })
  : new Map()
const sitemapEntries = listed.map((u) => ({ path: u, lastmod: lastmods.get(u) || null }))
const undated = sitemapEntries.filter((e) => !e.lastmod).map((e) => e.path)
if (published && undated.length) {
  const msg = `generate-sitemap: no <lastmod> for ${undated.length} URL(s): ${undated.join(', ')}`
  if (strict) { console.error(msg); process.exit(1) }
  console.warn(`! ${msg}`)
}

// ---- every URL that must exist and be pre-rendered (a superset of the sitemap)
const routes = urls
  .map((u) => {
    const i = info?.get(u)
    return { path: u, ...(info?.has(u) ? { cms: true } : {}), ...(i?.canonical && i.canonical !== u ? { canonical: i.canonical } : {}), ...(i?.noindex ? { noindex: true } : {}) }
  })
  .sort((x, y) => x.path.localeCompare(y.path))
const routesPath = path.join(CLIENT_ROOT, 'scripts', 'seo', 'generated', 'prerender-routes.json')
fs.mkdirSync(path.dirname(routesPath), { recursive: true })
fs.writeFileSync(routesPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2)}\n`)

fs.writeFileSync(outPath, toXml(sitemapEntries))
console.log(`✓ sitemap.xml written (${sitemapEntries.length} URLs${published ? ', indexable published pages only' : ', OFFLINE — CMS filter not applied'}) → ${path.relative(REPO_ROOT, outPath)}`)
console.log(`✓ prerender-routes.json written (${routes.length} routes, ${routes.length - sitemapEntries.length} not in the sitemap) → ${path.relative(REPO_ROOT, routesPath)}`)
for (const [u, why] of notListed) console.log(`  – not in the sitemap: ${u} (${why})`)
for (const [u, why] of skipped) console.log(`  – left out: ${u} (${why})`)
for (const u of addedFromCms) console.log(`  + added from the CMS (no markdown file): ${u}`)
