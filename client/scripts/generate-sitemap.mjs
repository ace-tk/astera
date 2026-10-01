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
import { fileURLToPath } from 'node:url'

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
  '/accueil',
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
]

function buildUrls() {
  const urls = [...STATIC_PAGES]

  for (const category of SERVICE_CATEGORIES) {
    urls.push(`/services/${category}`)
    const hubSlug = SERVICE_HUB_SLUG[category]
    for (const slug of slugsIn(category)) {
      if (slug === hubSlug) continue
      urls.push(`/services/${category}/${slug}`)
    }
  }

  for (const slug of slugsIn('resources')) {
    if (slug === RESSOURCES_HUB_SLUG) continue
    urls.push(`/ressources/${slug}`)
  }

  return urls
}

function toXml(urls) {
  const lines = urls.map((u) => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`
}

const urls = buildUrls()
const unique = new Set(urls)
if (unique.size !== urls.length) {
  throw new Error(`generate-sitemap: duplicate URL(s) detected — refusing to write a sitemap with duplicates.`)
}

const outPath = path.join(CLIENT_ROOT, 'public', 'sitemap.xml')
fs.writeFileSync(outPath, toXml(urls))
console.log(`✓ sitemap.xml written (${urls.length} URLs) → ${path.relative(REPO_ROOT, outPath)}`)
