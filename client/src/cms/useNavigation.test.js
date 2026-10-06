import { describe, it, expect } from 'vitest'
import { ATOOPV_NAV } from '@/constants/content'
import { CATEGORY_NAV } from '@/constants/servicesNav'
import { buildMainNav, mergeSectionNav, normalizeNavigation } from './useNavigation'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'
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

  it('uses the CMS menus in the navbar shape, with no code-level utility links today', () => {
    const nav = buildMainNav({ menu: { configured: true, items: [resolvedFormations, { id: 'a-propos', label: 'À propos', kind: 'link', href: '/a-propos' }] } })
    expect(nav.map((i) => i.label)).toEqual(['Nos formations', 'À propos'])
    expect(nav[0]).toMatchObject({ key: 'formations', href: '/services/training', mega: { columns: [{ heading: 'Groupe', items: [{ label: 'Une formation', href: '/services/training/x' }] }] }, mobileItems: [{ label: 'Mobile' }] })
  })

  it('a configured but fully disabled CMS menu shows an empty nav — it does not resurrect the built-in menu', () => {
    const nav = buildMainNav({ menu: { configured: true, items: [] } })
    expect(nav).toEqual([])
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
  it('produces the 6 real menus (at most 7)', () => {
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
    expect(fromResolvedMenu([{ id: 'a-propos', label: 'À propos', kind: 'link', href: '/a-propos' }])).toEqual([{ label: 'À propos', href: '/a-propos' }])
  })
})

// The live CMS still stores the 34 migrated Ressources articles (and the main menu's links to them) at the
// pre-rename `/atoopv/ressources/<slug>` address. Before normalizing, the side navigation could not tell those
// were the built-in entries it already had, so every article was listed twice.
describe('legacy /atoopv/… addresses in the CMS answer', () => {
  const builtIn = RESSOURCES_NAV.find((i) => i.to.startsWith('/ressources/') && i.to !== '/ressources/guides-livres-blancs-cse')
  const legacy = (to) => ({ label: 'x', to: to.replace(/^\//, '/atoopv/') })

  it('rewrites every address to the current route, in pages, section navs and the menu', () => {
    const out = normalizeNavigation({
      pages: [{ slug: 'a', path: '/atoopv/ressources/a' }, { slug: 'b', path: '/services/drafting/b' }],
      sections: { ressources: { configured: false, entries: [{ label: 'A', to: '/atoopv/ressources/a' }] } },
      menu: { items: [{ href: '/atoopv/ressources/a' }, { href: '/atoopv' }, { href: '/tarification' }] },
    })
    expect(out.pages.map((p) => p.path)).toEqual(['/ressources/a', '/services/drafting/b'])
    expect(out.sections.ressources.entries[0].to).toBe('/ressources/a')
    expect(out.menu.items.map((i) => i.href)).toEqual(['/ressources/a', '/', '/tarification'])
  })

  it('keeps a page\'s stored address so the CMS can still be asked for it', () => {
    const out = normalizeNavigation({ pages: [{ slug: 'a', path: '/atoopv/ressources/a' }] })
    expect(out.pages[0]).toMatchObject({ path: '/ressources/a', storedPath: '/atoopv/ressources/a' })
  })

  it('does not touch addresses that merely contain "atoopv" elsewhere', () => {
    const out = normalizeNavigation({ pages: [{ slug: 'a', path: '/services/atoopv-guide' }], menu: { x: 'https://atoopv.com/contact' } })
    expect(out.pages[0].path).toBe('/services/atoopv-guide')
    expect(out.menu.x).toBe('https://atoopv.com/contact')
  })

  it('built-in side-nav entries are not duplicated once the CMS answer is normalized', () => {
    const raw = { configured: false, entries: [legacy(builtIn.to)] }
    const unnormalized = mergeSectionNav(raw, RESSOURCES_NAV)
    const normalized = mergeSectionNav(normalizeNavigation({ sections: { r: raw } }).sections.r, RESSOURCES_NAV)
    expect(unnormalized.length).toBe(RESSOURCES_NAV.length + 1) // the old, buggy behavior: listed twice
    expect(normalized).toEqual(RESSOURCES_NAV)
  })

  it('passes through an empty answer', () => {
    expect(normalizeNavigation(undefined)).toBeUndefined()
  })
})
