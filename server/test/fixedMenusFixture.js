import { FIXED_MENUS } from '../src/cms/fixedMenus.js'
import { MENU_VISUALS } from '../src/cms/constants.js'

/**
 * A valid main menu built on the FIXED skeleton (the six real menus, in order, with their real
 * groups and headings). `entriesByGroup` fills groups as { 'menuId/groupId': [entries] };
 * `over` overrides parts of one menu as { menuId: { ...fields } }.
 */
export function fixedItems(entriesByGroup = {}, over = {}) {
  return FIXED_MENUS.map((fm) => ({
    id: fm.id,
    label: fm.label,
    enabled: true,
    kind: fm.kind,
    link: { ...fm.link },
    ...(fm.color ? { color: fm.color } : {}),
    ...(MENU_VISUALS.includes(fm.visual) ? { visual: fm.visual } : {}),
    groups: fm.groups.map((g) => ({ id: g.id, heading: g.heading, entries: entriesByGroup[`${fm.id}/${g.id}`] || [] })),
    mobile: [],
    ...(fm.cta ? { cta: { tone: fm.cta.tone, eyebrow: '', title: '', buttonLabel: '', link: { type: 'route', route: '/atoopv/tarification' } } } : {}),
    ...(fm.cities ? { cities: { heading: 'Villes', label: 'Texte', linkLabel: 'Voir', link: { type: 'route', route: '/services/by-city' } } } : {}),
    ...(over[fm.id] || {}),
  }))
}

/** The same items with one group's entries replaced. */
export function withEntries(items, menuId, groupId, entries) {
  return items.map((it) => (it.id !== menuId ? it : { ...it, groups: it.groups.map((g) => (g.id === groupId ? { ...g, entries } : g)) }))
}
