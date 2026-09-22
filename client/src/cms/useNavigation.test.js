import { describe, it, expect } from 'vitest'
import { ATOOPV_NAV } from '@/constants/content'
import { CATEGORY_NAV } from '@/constants/servicesNav'
import { buildMainNav, mergeSectionNav } from './useNavigation'
import { toMenuItems, toSectionEntries, fromResolvedMenu } from './navConvert'

const resolvedFormations = {
  id: 'formations', label: 'Nos formations', kind: 'mega', href: '/services/training', color: 'royal',
  groups: [{ id: 'g', heading: 'Groupe', entries: [{ id: 'e', label: 'Une formation', href: '/services/training/x' }] }],
  mobile: [{ id: 'm', label: 'Mobile', href: '/services/training/x' }],
}

describe('main navigation source', () => {
  it('keeps the built-in menu (same object) when the CMS has nothing', () => {
    expect(buildMainNav(undefined)).toBe(ATOOPV_NAV)
    expect(buildMainNav({ menu: null })).toBe(ATOOPV_NAV)
  })

  it('uses the CMS menus in the navbar shape and keeps Design Test as the last, code-level link', () => {
    const nav = buildMainNav({ menu: { configured: true, items: [resolvedFormations, { id: 'a-propos', label: 'À propos', kind: 'link', href: '/atoopv/a-propos' }] } })
    expect(nav.map((i) => i.label)).toEqual(['Nos formations', 'À propos', 'Design Test'])
    expect(nav[0]).toMatchObject({ key: 'formations', href: '/services/training', mega: { columns: [{ heading: 'Groupe', items: [{ label: 'Une formation', href: '/services/training/x' }] }] }, mobileItems: [{ label: 'Mobile' }] })
    expect(nav[2].href).toBe('/design-test')
  })

  it('a configured but fully disabled CMS menu shows only the code-level link — it does not resurrect the built-in menu', () => {
    const nav = buildMainNav({ menu: { configured: true, items: [] } })
    expect(nav.map((i) => i.label)).toEqual(['Design Test'])
  })
})

describe('section side navigation source', () => {
  const built = CATEGORY_NAV.training

  it('is the built-in list when the CMS has nothing for the section', () => {
    expect(mergeSectionNav(undefined, built)).toBe(built)
  })

  it('appends newly published CMS pages after the built-in list, without duplicating built-in ones', () => {
    const merged = mergeSectionNav({ configured: false, entries: [{ label: 'Formation D', to: '/services/training/formation-d' }, { label: 'Dup', to: built[1].to }] }, built)
    expect(merged.slice(0, built.length)).toEqual(built)
    expect(merged.slice(built.length)).toEqual([{ label: 'Formation D', to: '/services/training/formation-d' }])
  })

  it('returns the SAME list object when there is nothing to add (no needless re-render)', () => {
    expect(mergeSectionNav({ configured: false, entries: [{ label: 'x', to: built[0].to }] }, built)).toBe(built)
  })

  it('uses the CMS order once the section is set up (this also drives previous/next)', () => {
    const merged = mergeSectionNav({ configured: true, entries: [{ label: 'B', to: '/b' }, { label: 'A', to: '/a', end: true }] }, built)
    expect(merged).toEqual([{ label: 'B', to: '/b' }, { label: 'A', to: '/a', end: true }])
  })
})

describe('built-in navigation converter', () => {
  it('produces the 6 real menus (at most 7) and leaves Design Test out', () => {
    const items = toMenuItems(ATOOPV_NAV)
    expect(items.map((i) => i.id)).toEqual(['pv', 'formations', 'atoosavoir', 'ressources', 'blog', 'a-propos'])
    expect(items.length).toBeLessThanOrEqual(7)
    expect(items.find((i) => i.id === 'blog').cities.linkLabel).toBe('Voir le hub des 11 villes')
  })

  it('converts side navigation with exact-match flags intact', () => {
    const entries = toSectionEntries(CATEGORY_NAV.drafting)
    expect(entries[0]).toMatchObject({ label: 'Rédaction du PV', end: true, link: { type: 'route', route: '/services/drafting' } })
    expect(entries).toHaveLength(CATEGORY_NAV.drafting.length)
  })

  it('a plain (non-mega) CMS item comes back as the simple {label, href} the navbar expects', () => {
    expect(fromResolvedMenu([{ id: 'a-propos', label: 'À propos', kind: 'link', href: '/atoopv/a-propos' }])).toEqual([{ label: 'À propos', href: '/atoopv/a-propos' }])
  })
})
