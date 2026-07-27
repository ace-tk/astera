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

// A handful of resource pages are linked under a second, older slug that
// 301-redirects on the live site (discovered while writing extract_resources.py).
const ALIASES = {
  'livres-blancs': 'guides-livres-blancs-cse',
  'tickets-restaurant-teletravail-droit-teletravailleur': 'tickets-restaurant-teletravail-droit-teletravailleurs',
}

// Every other internal slug referenced from a Ressources page belongs to a
// nav section that hasn't been ported yet (Services incl. its Rédaction PV /
// Par ville / Tarifs / Guides pratiques / Communication / Formations
// sub-groups, Contact, Simulateur, Autodiagnostic, À propos, atoosavoir).
// Point each at the forward-looking /atoopv/* stub for that section so the
// link works today and resolves to the real page once that phase ships,
// instead of leaking out to the live atoopv.com site.
const SECTION_MAP = {
  services: '/atoopv/services',
  'nos-services-pv': '/atoopv/services',
  'redaction-pv-cse': '/atoopv/services',
  'redaction-pv-cse-a-lacte': '/atoopv/services',
  'redaction-pv-cssct': '/atoopv/services',
  'redaction-pv-irp': '/atoopv/services',
  'redaction-pv-csec': '/atoopv/services',
  'redaction-du-pv': '/atoopv/services',
  'externaliser-pv-cse': '/atoopv/services',
  'externaliser-redaction-pv-cse': '/atoopv/services',
  'audiotypie-pv-cse': '/atoopv/services',
  'proces-verbal-cse': '/atoopv/services',
  'delai-redaction-pv-cse': '/atoopv/services',
  'tarif-redaction-pv-cse': '/atoopv/services',
  'redacteur-pv-cse': '/atoopv/services',
  'pv-cse-code-travail': '/atoopv/services',
  'qui-redige-pv-cse': '/atoopv/services',
  'approbation-pv-cse': '/atoopv/services',
  'pv-cse-contenu-obligatoire': '/atoopv/services',
  'communication-cse': '/atoopv/services',
  'newsletter-actucse': '/atoopv/services',
  'communication-asc': '/atoopv/services',
  'guide-du-comite': '/atoopv/services',
  formations: '/atoopv/services',
  'formations-elus-cse-agree': '/atoopv/services',
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

  return { href: SECTION_MAP[slug] || '/atoopv', external: false }
}
