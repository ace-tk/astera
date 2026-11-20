// <lastmod> for every URL of the sitemap (client request 19 Nov 2026: "every URL must have a lastmod date").
//   * a CMS page            → its own updatedAt (GET /cms/index)
//   * an editable site page → when it was last published (GET /cms/dates), the home page also counts the home hero
//   * a hub (section page)  → the most recent date among the hub and its child pages
//   * a page nobody has ever edited in the admin → the date of the last commit of the file that holds its text
import { execFileSync } from 'node:child_process'

/** URL → key of the editable site page (src/cms/sitePageRegistry.js; a test keeps both in step). */
export const KEY_BY_PATH = {
  '/': 'accueil',
  '/tarification': 'tarification',
  '/a-propos': 'a-propos',
  '/contact': 'contact',
  '/atoosavoir': 'atoosavoir',
  '/atoosavoir/exemple': 'atoosavoir-exemple',
  '/atoosavoir/cgv': 'atoosavoir-cgv',
  '/autodiagnostic': 'autodiagnostic',
  '/boutique': 'boutique',
  '/ressources/veille-juridique-cse': 'veille-juridique',
  '/services': 'hub-services',
  '/services/drafting': 'hub-nos-services-pv',
  '/services/communication': 'hub-communication-cse',
  '/services/training': 'hub-formations-elus-cse-agree',
  '/services/tarifs-infos': 'hub-tarif-redaction-pv-cse',
  '/ressources': 'hub-guides-livres-blancs-cse',
}

/** hub URL → the prefixes of its child pages */
export const HUB_CHILDREN = {
  '/services': ['/services/'],
  '/services/drafting': ['/services/drafting/'],
  '/services/by-city': ['/services/by-city/'],
  '/services/tarifs-infos': ['/services/tarifs-infos/'],
  '/services/guides': ['/services/guides/'],
  '/services/communication': ['/services/communication/'],
  '/services/training': ['/services/training/'],
  '/ressources': ['/ressources/'],
  '/ressources/guides-livres-blancs-cse': ['/ressources/'],
  '/atoosavoir': ['/atoosavoir/'],
}

/** where the built-in text of a site page lives (used only while the page was never edited in the admin) */
export const FALLBACK_SOURCES = {
  accueil: ['client/src/constants/atoopvHome.js', 'client/src/constants/content.js'],
  tarification: ['client/src/constants/tarificationHome.js'],
  'a-propos': ['client/src/constants/aProposHome.js'],
  contact: ['client/src/constants/contactHome.js'],
  atoosavoir: ['client/src/constants/atoosavoirHome.js'],
  'atoosavoir-exemple': ['client/src/constants/atoosavoirHome.js'],
  'atoosavoir-cgv': ['client/src/constants/atoosavoirHome.js'],
  autodiagnostic: ['client/src/constants/autodiagnosticHome.js'],
  boutique: ['client/src/constants/boutique.js'],
  'veille-juridique': ['client/src/constants/content.js'],
}

const maxIso = (...list) => list.filter(Boolean).sort().at(-1) || null
export const ymd = (iso) => (iso ? String(iso).slice(0, 10) : null)

/** Date of the last commit that touched these files (ISO), or null. Needs the full git history (CI: fetch-depth 0). */
export function gitDate(files, cwd) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...files], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return out || null
  } catch {
    return null
  }
}

/**
 * @param urls        every URL of the sitemap ('/' and '/services/...')
 * @param cmsDates    Map path → ISO updatedAt (published CMS pages)
 * @param dates       the answer of GET /cms/dates ({ sitePages: { key: iso }, homeHero, ... }) or {}
 * @param fallback    (siteKey) → ISO date of the source file, or null
 * @returns Map url → 'YYYY-MM-DD' | null
 */
export function resolveLastmods({ urls, cmsDates, dates = {}, fallback = () => null }) {
  const sitePages = dates.sitePages || {}
  const own = (url) => {
    if (cmsDates.has(url)) return cmsDates.get(url)
    const key = KEY_BY_PATH[url]
    if (!key) return null
    const edited = sitePages[key] || null
    return url === '/' ? maxIso(edited || fallback(key), dates.homeHero) : edited || fallback(key)
  }
  const result = new Map()
  for (const url of urls) {
    const prefixes = HUB_CHILDREN[url]
    if (!prefixes) {
      result.set(url, ymd(own(url)))
      continue
    }
    const children = urls.filter((u) => u !== url && !HUB_CHILDREN[u] && prefixes.some((p) => u.startsWith(p))).map(own)
    result.set(url, ymd(maxIso(own(url), ...children)))
  }
  return result
}
