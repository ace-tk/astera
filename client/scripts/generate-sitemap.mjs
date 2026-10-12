// Generates client/public/sitemap.xml at build time (wired as npm's "prebuild"
// hook in package.json, so `npm run build` always ships a current sitemap).
//
// SEO audit fix — item 6 (sitemap must use https://atoopv.com, list only real
// public/indexable URLs, and exclude duplicates/redirects/non-indexable routes).
//
// Every URL comes from a real, existing source: the app's own route structure
// (App.jsx) for static pages, and the actual content/<category>/*.md filenames
// for dynamic ones — exactly the same slugs servicesContent.js/resourcesContent.js
// load at runtime. Nothing here is invented.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

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
const SITEMAP_EXCLUDE = new Set(['/services/drafting/services'])

/**
 * Fetches the live CMS index (public, published pages only). Returns a Set of published paths, or
 * null if the CMS could not be reached — in which case the caller must not guess.
 */
async function fetchPublishedPaths() {
  const api = process.env.SITEMAP_API_URL || process.env.VITE_API_URL || envFileApiUrl() || 'https://api.atoopv.com/api'
  try {
    const res = await fetch(`${api.replace(/\/$/, '')}/cms/index`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { pages } = await res.json()
    if (!Array.isArray(pages)) throw new Error('unexpected response')
    return new Set(pages.map((p) => p.path))
  } catch (err) {
    console.warn(`! sitemap: could not read the CMS index (${err.message})`)
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
  const isLive = (urlPath, slug, drivenSet) => !published || !drivenSet.has(slug) || published.has(urlPath)

  for (const category of SERVICE_CATEGORIES) {
    urls.push(`/services/${category}`)
    const hubSlug = SERVICE_HUB_SLUG[category]
    for (const slug of slugsIn(category)) {
      if (slug === hubSlug) continue
      const u = `/services/${category}/${slug}`
      if (SITEMAP_EXCLUDE.has(u)) { skipped.push([u, 'duplicate of /services']); continue }
      if (!isLive(u, slug, driven.services)) { skipped.push([u, 'not published in the CMS']); continue }
      urls.push(u)
    }
  }

  for (const slug of slugsIn('resources')) {
    if (slug === RESSOURCES_HUB_SLUG) continue
    const u = `/ressources/${slug}`
    if (!isLive(u, slug, driven.ressources)) { skipped.push([u, 'not published in the CMS']); continue }
    urls.push(u)
  }

  return { urls, skipped }
}

function toXml(urls) {
  const lines = urls.map((u) => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`)
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

const { urls, skipped } = buildUrls({ published, driven: await loadDrivenSlugs() })
const unique = new Set(urls)
if (unique.size !== urls.length) {
  throw new Error(`generate-sitemap: duplicate URL(s) detected — refusing to write a sitemap with duplicates.`)
}
// Every URL listed must be a redirect-map TARGET-safe path: never a path the server redirects away.
const redirected = new Set((await import('./seo/redirectMap.mjs')).REDIRECTS.flatMap((r) => r.from.map((f) => `/${f}`)))
const clash = urls.filter((u) => redirected.has(u))
if (clash.length) throw new Error(`generate-sitemap: URL(s) listed that the server redirects away: ${clash.join(', ')}`)

fs.writeFileSync(outPath, toXml(urls))
console.log(`✓ sitemap.xml written (${urls.length} URLs${published ? ', published pages only' : ', OFFLINE — CMS filter not applied'}) → ${path.relative(REPO_ROOT, outPath)}`)
for (const [u, why] of skipped) console.log(`  – left out: ${u} (${why})`)
