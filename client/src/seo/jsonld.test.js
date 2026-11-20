import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { COMPANY, ORG_ID, SITE_URL } from './siteData'
import { organizationNode, professionalServiceNode, organizationStub, breadcrumbNode, articleNode, graphOf, defaultNodesFor, absoluteUrl } from './jsonld'

const types = (nodes) => nodes.map((n) => n['@type'])

describe('JSON-LD builders', () => {
  it('the company data matches the legal line used on the site (ALC SAS, Caluire-et-Cuire 69300)', () => {
    const defaults = readFileSync(resolve(process.cwd(), '../server/src/cms/sitePageDefaults.json'), 'utf8')
    expect(defaults).toContain(`${COMPANY.legalName} · SIREN`)
    expect(defaults).toContain(`${COMPANY.address.addressLocality} (${COMPANY.address.postalCode})`)
    // street as printed on /mentions-legales ("Siège social : 47, Grande Rue de Saint-Clair, 69300 Caluire-et-Cuire, France")
    expect(COMPANY.address.streetAddress).toBe('47, Grande Rue de Saint-Clair')
  })

  it('Organization has the fixed @id and the required fields', () => {
    const o = organizationNode()
    expect(o['@id']).toBe('https://atoopv.com/#organization')
    expect(o.name).toBe('AtooPV')
    expect(o.legalName).toBe('ALC SAS')
    expect(o.logo.url).toMatch(/^https:\/\//)
    expect(o.address['@type']).toBe('PostalAddress')
    expect(o.sameAs[0]).toMatch(/linkedin\.com/)
  })

  it('home = Organization + ProfessionalService, no breadcrumb; /contact = ProfessionalService + breadcrumb', () => {
    expect(types(defaultNodesFor('/'))).toEqual(['Organization', 'ProfessionalService'])
    expect(types(defaultNodesFor('/contact'))).toEqual(expect.arrayContaining(['ProfessionalService', 'BreadcrumbList']))
    expect(types(defaultNodesFor('/tarification'))).toEqual(['BreadcrumbList'])
  })

  it('breadcrumb items use absolute URLs and positions', () => {
    const b = breadcrumbNode([{ name: 'Services', path: '/services' }, { name: 'Page', path: '/services/guides/x' }])
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2])
    b.itemListElement.forEach((i) => expect(i.item).toMatch(/^https:\/\/atoopv\.com\//))
  })

  it('Article references the Organization by @id and has no person', () => {
    const a = articleNode({ headline: 'H', description: 'D', canonicalUrl: absoluteUrl('/ressources/x'), image: `${SITE_URL}/i.jpg`, publishedAt: '2026-01-02T00:00:00Z', updatedAt: '2026-02-03T00:00:00Z' })
    expect(a['@type']).toBe('Article')
    expect(a.author).toEqual({ '@id': ORG_ID })
    expect(a.publisher).toEqual({ '@id': ORG_ID })
    expect(a.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': 'https://atoopv.com/ressources/x' })
    expect(a.datePublished).toBe('2026-01-02T00:00:00.000Z')
    expect(JSON.stringify(a)).not.toContain('Person')
  })

  it('graphOf wraps nodes in one @graph and never emits FAQPage/Course', () => {
    const g = graphOf([organizationNode(), professionalServiceNode(), organizationStub()])
    expect(g['@context']).toBe('https://schema.org')
    expect(Array.isArray(g['@graph'])).toBe(true)
    expect(JSON.stringify(g)).not.toMatch(/FAQPage|Course/)
  })
})
