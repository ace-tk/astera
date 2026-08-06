/**
 * Rewrites the internal links found *inside* the extracted Services markdown
 * bodies (original atoopv.com paths, e.g. `/redaction-pv-cse/` or
 * `/contact/`) to the right destination in this app. Same job as
 * resourcesLinks.js's resolveResourceHref, for the Services section.
 *
 * Built by enumerating every relative/atoopv.com link that actually appears
 * across content/{drafting,by-city,tarifs-infos,guides,communication,
 * training}/*.md (`grep -ohE '\]\(...\)'`) and classifying each one — not
 * guessed.
 */
import { SERVICE_PAGES_BY_SLUG, CATEGORY_HUB_SLUG } from '@/services/servicesContent'
import { RESOURCES_BY_SLUG } from '@/services/resourcesContent'

// A page reached under a second, older slug that redirects on the live site
// (discovered while writing extract_services.py).
const ALIASES = {
  'formations-elus-cse-esss': 'formations-elus-cse-agree',
}

const HUB_SLUG_TO_CATEGORY = Object.fromEntries(Object.entries(CATEGORY_HUB_SLUG).map(([category, slug]) => [slug, category]))

/**
 * Route for a known Services slug, or null if it isn't one. Exported (not
 * just used internally) so resourcesLinks.js can resolve a cross-link from
 * a Ressources page into a Services page without needing its own copy of
 * this mapping and without importing resolveServiceHref itself, which would
 * create resourcesLinks.js <-> servicesLinks.js import cycle.
 */
export function serviceRouteForSlug(rawSlug) {
  const slug = ALIASES[rawSlug] || rawSlug
  if (slug === 'services') return '/services'
  if (HUB_SLUG_TO_CATEGORY[slug]) return `/services/${HUB_SLUG_TO_CATEGORY[slug]}`
  const page = SERVICE_PAGES_BY_SLUG.get(slug)
  return page ? `/services/${page.category}/${slug}` : null
}

// Every other internal slug referenced from a Services page belongs to a
// nav section that isn't ported markdown content (Contact, Autodiagnostic,
// Tarification/Simulateur, À propos, AtooSavoir), a site-wide utility page
// that was never meant to be a "Services page" (a news archive, an HTML
// sitemap), or a Ressources alias.
const SECTION_MAP = {
  contact: '/atoopv/contact',
  tarification: '/atoopv/simulateur',
  'simulateur-de-prix': '/atoopv/simulateur',
  autodiagnostic: '/atoopv/autodiagnostic',
  'autodiagnostic-cse': '/atoopv/autodiagnostic',
  'a-propos': '/atoopv/a-propos',
  faq: '/atoopv/a-propos',
  atoosavoir: '/atoopv/atoosavoir',
  'atoosavoir/exemple': '/atoopv/atoosavoir/exemple',
  'atoosavoir/cgv': '/atoopv/atoosavoir/cgv',
  actualites: '/services',
  'plan-du-site': '/services',
}

const ASSET_EXT_RE = /\.(jpe?g|png|webp|gif|pdf|docx?|mp4)$/i

function stripDomain(href) {
  if (href.startsWith('https://www.atoopv.com')) return href.slice('https://www.atoopv.com'.length) || '/'
  if (href.startsWith('https://atoopv.com')) return href.slice('https://atoopv.com'.length) || '/'
  return href
}

/**
 * Classifies a raw href from the markdown body into where it should
 * actually go. Returns { href, external }.
 */
export function resolveServiceHref(rawHref) {
  if (!rawHref.startsWith('/') && !rawHref.startsWith('https://atoopv.com') && !rawHref.startsWith('https://www.atoopv.com')) {
    return { href: rawHref, external: true } // legifrance.gouv.fr, youtube, linkedin, mailto:, tel:, #...
  }

  const path = stripDomain(rawHref)
  if (ASSET_EXT_RE.test(path)) return { href: rawHref, external: true }

  const slug = path.replace(/^\/+|\/+$/g, '')
  if (slug === '') return { href: '/atoopv', external: false }
  if (slug === 'livres-blancs') return { href: '/atoopv/ressources/guides-livres-blancs-cse', external: false }

  const serviceRoute = serviceRouteForSlug(slug)
  if (serviceRoute) return { href: serviceRoute, external: false }

  if (RESOURCES_BY_SLUG.has(slug)) return { href: `/atoopv/ressources/${slug}`, external: false }

  return { href: SECTION_MAP[slug] || '/services', external: false }
}
