/**
 * Rewrites the internal links found *inside* the extracted markdown bodies
 * (which use the original atoopv.com paths, e.g. `/redaction-pv-cse/` or
 * `/contact/`) to the right destination in this app.
 *
 * Built by enumerating every relative/atoopv.com link that actually appears
 * across content/resources/*.md (`grep -ohE '\]\(...\)'`) and classifying
 * each one — not guessed.
 */
import { RESOURCES_BY_SLUG, VEILLE_JURIDIQUE_SLUGS } from '@/services/resourcesContent'
import { serviceRouteForSlug } from '@/constants/servicesLinks'

// A handful of resource pages are linked under a second, older slug that
// 301-redirects on the live site (discovered while writing extract_resources.py).
const ALIASES = {
  'livres-blancs': 'guides-livres-blancs-cse',
  'tickets-restaurant-teletravail-droit-teletravailleur': 'tickets-restaurant-teletravail-droit-teletravailleurs',
}

// Every other internal slug referenced from a Ressources page belongs to a
// nav section that isn't ported markdown content: Services slugs are
// resolved by serviceRouteForSlug below (real pages, now that the Services
// section is ported too — see servicesLinks.js); everything left here is
// Contact, Simulateur, Autodiagnostic, À propos, or atoosavoir.
const SECTION_MAP = {
  contact: '/atoopv/contact',
  tarification: '/atoopv/simulateur',
  'simulateur-de-prix': '/atoopv/simulateur',
  autodiagnostic: '/atoopv/autodiagnostic',
  'autodiagnostic-cse': '/atoopv/autodiagnostic', // dead link on the live site itself (404) -- closest real destination
  'a-propos': '/atoopv/a-propos',
  faq: '/atoopv/a-propos',
  atoosavoir: '/atoopv/atoosavoir',
  'atoosavoir/exemple': '/atoopv/atoosavoir/exemple',
  'atoosavoir/cgv': '/atoopv/atoosavoir/cgv',
}

const ASSET_EXT_RE = /\.(jpe?g|png|webp|gif|pdf|mp4)$/i

function stripDomain(href) {
  if (href.startsWith('https://atoopv.com')) return href.slice('https://atoopv.com'.length) || '/'
  return href
}

/**
 * Classifies a raw href from the markdown body into where it should
 * actually go. Returns { href, external }.
 */
export function resolveResourceHref(rawHref) {
  if (!rawHref.startsWith('/') && !rawHref.startsWith('https://atoopv.com')) {
    return { href: rawHref, external: true } // legifrance.gouv.fr, youtube, linkedin, mailto:, tel:, #...
  }

  const path = stripDomain(rawHref)
  if (ASSET_EXT_RE.test(path)) return { href: rawHref, external: true }

  const slug = path.replace(/^\/+|\/+$/g, '')
  if (slug === '') return { href: '/atoopv', external: false }
  if (slug === 'category/veille-juridique-cse') return { href: '/atoopv/ressources/veille-juridique-cse', external: false }

  const resolvedSlug = ALIASES[slug] || slug
  if (RESOURCES_BY_SLUG.has(resolvedSlug)) return { href: `/atoopv/ressources/${resolvedSlug}`, external: false }
  if (VEILLE_JURIDIQUE_SLUGS.includes(resolvedSlug)) return { href: `/atoopv/ressources/${resolvedSlug}`, external: false }

  const serviceRoute = serviceRouteForSlug(slug)
  if (serviceRoute) return { href: serviceRoute, external: false }

  return { href: SECTION_MAP[slug] || '/atoopv', external: false }
}
