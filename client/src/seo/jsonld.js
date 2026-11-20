import { SITE_URL } from '@/config'
import { COMPANY, ORG_ID, LOCAL_BUSINESS_ID } from './siteData'

/** '/services/x' → 'https://atoopv.com/services/x'; '/' → 'https://atoopv.com/'. Always an absolute URL. */
export const absoluteUrl = (path) => `${SITE_URL}${path === '/' || !path ? '/' : path.startsWith('/') ? path : `/${path}`}`

const postalAddress = () => ({ '@type': 'PostalAddress', ...COMPANY.address })

/** The company. Defined on the home page, referred to by @id from the other pages. */
export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    logo: { '@type': 'ImageObject', url: COMPANY.logo },
    email: COMPANY.email,
    telephone: COMPANY.telephone,
    address: postalAddress(),
    sameAs: COMPANY.sameAs,
  }
}

/** ProfessionalService is a LocalBusiness type: the same company as a place customers can reach. */
export function professionalServiceNode() {
  return {
    '@type': 'ProfessionalService',
    '@id': LOCAL_BUSINESS_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    image: COMPANY.logo,
    logo: COMPANY.logo,
    email: COMPANY.email,
    telephone: COMPANY.telephone,
    address: postalAddress(),
    sameAs: COMPANY.sameAs,
    parentOrganization: { '@id': ORG_ID },
  }
}

/** A short, resolvable reference to the company for pages that only point at it (author / publisher). */
export const organizationStub = () => ({ '@type': 'Organization', '@id': ORG_ID, name: COMPANY.name, url: COMPANY.url, logo: { '@type': 'ImageObject', url: COMPANY.logo } })

/**
 * trail: [{ name, path }] in order, the LAST item is the page itself.
 * Items are listed with their full URL.
 */
export function breadcrumbNode(trail) {
  const items = (trail || []).filter((t) => t && t.name && t.path)
  if (!items.length) return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  }
}

const iso = (v) => {
  if (!v) return undefined
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

/** Article of a guide or a Ressources page. Dates only when the CMS has them. author and publisher are the company, by @id. */
export function articleNode({ headline, description, canonicalUrl, image, publishedAt, updatedAt }) {
  const node = {
    '@type': 'Article',
    '@id': `${canonicalUrl}#article`,
    headline,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  }
  if (description) node.description = description
  if (image) node.image = image
  if (iso(publishedAt)) node.datePublished = iso(publishedAt)
  if (iso(updatedAt)) node.dateModified = iso(updatedAt)
  return node
}

/** One <script type="application/ld+json"> payload with an @graph. Null nodes are dropped; returns null when nothing is left. */
export function graphOf(nodes) {
  const list = (nodes || []).filter(Boolean)
  return list.length ? { '@context': 'https://schema.org', '@graph': list } : null
}

/* ----------------------------- default trails ----------------------------- */

const HOME = { name: 'Accueil', path: '/' }

/** Visible names of the pages that are not articles (no per-page data needed). */
export const STATIC_TRAILS = {
  '/services': [HOME, { name: 'Services', path: '/services' }],
  '/ressources': [HOME, { name: 'Ressources', path: '/ressources' }],
  '/ressources/guides-livres-blancs-cse': [{ name: 'Ressources', path: '/ressources' }, { name: 'Guides et livres blancs', path: '/ressources/guides-livres-blancs-cse' }],
  '/ressources/veille-juridique-cse': [{ name: 'Ressources', path: '/ressources' }, { name: 'Veille juridique', path: '/ressources/veille-juridique-cse' }],
  '/contact': [HOME, { name: 'Contact', path: '/contact' }],
  '/tarification': [HOME, { name: 'Tarification', path: '/tarification' }],
  '/a-propos': [HOME, { name: 'À propos', path: '/a-propos' }],
  '/boutique': [HOME, { name: 'Boutique', path: '/boutique' }],
  '/autodiagnostic': [HOME, { name: 'Autodiagnostic', path: '/autodiagnostic' }],
  '/atoosavoir': [HOME, { name: 'AtooSavoir', path: '/atoosavoir' }],
  '/atoosavoir/exemple': [HOME, { name: 'AtooSavoir', path: '/atoosavoir' }, { name: 'Exemple', path: '/atoosavoir/exemple' }],
  '/atoosavoir/cgv': [HOME, { name: 'AtooSavoir', path: '/atoosavoir' }, { name: 'Conditions générales de vente AtooSavoir', path: '/atoosavoir/cgv' }],
  '/mentions-legales': [HOME, { name: 'Mentions légales', path: '/mentions-legales' }],
  '/cgv': [HOME, { name: 'Conditions générales de vente', path: '/cgv' }],
  '/politique-de-confidentialite': [HOME, { name: 'Politique de confidentialité', path: '/politique-de-confidentialite' }],
  '/cookies': [HOME, { name: 'Cookies', path: '/cookies' }],
}

/** What every route gets without any page-specific code: the home page's company data, the breadcrumb of a fixed page. */
export function defaultNodesFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path === '/') return [organizationNode(), professionalServiceNode()]
  const nodes = []
  if (path === '/contact') nodes.push(professionalServiceNode())
  const trail = STATIC_TRAILS[path]
  if (trail) nodes.push(breadcrumbNode(trail))
  return nodes
}
