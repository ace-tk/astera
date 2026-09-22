/**
 * Helpers for the links held inside menu items and section-nav entries.
 * Every link a menu can hold is either `{type:'page', pageId}` or `{type:'route', route}`.
 */

/** Every page id referenced anywhere inside menu items (entries, mobile list, triggers, CTAs, city panels). */
export function collectPageRefs(items) {
  const found = []
  const visitLink = (link, label, where) => {
    if (link?.type === 'page' && link.pageId) found.push({ pageId: String(link.pageId), label, where })
  }
  for (const it of items || []) {
    visitLink(it.link, it.label, `${it.label} (menu link)`)
    visitLink(it.cta?.link, it.label, `${it.label} (call to action)`)
    visitLink(it.cities?.link, it.label, `${it.label} (cities panel)`)
    for (const g of it.groups || []) for (const e of g.entries || []) visitLink(e.link, e.label || it.label, `${it.label} › ${g.heading}`)
    for (const e of it.mobile || []) visitLink(e.link, e.label || it.label, `${it.label} (mobile list)`)
  }
  return found
}

/** Page ids referenced by a flat entry list (section navigation). */
export const collectEntryRefs = (entries) =>
  (entries || []).filter((e) => e.link?.type === 'page' && e.link.pageId).map((e) => String(e.link.pageId))

/** Menu items with every ENTRY that points at `pageId` removed (triggers/CTAs are left alone). */
export function stripEntryRefs(items, pageId) {
  const id = String(pageId)
  const keep = (e) => !(e.link?.type === 'page' && String(e.link.pageId) === id)
  return (items || []).map((it) => ({
    ...it,
    groups: (it.groups || []).map((g) => ({ ...g, entries: (g.entries || []).filter(keep) })),
    mobile: (it.mobile || []).filter(keep),
  }))
}

/** Page ids used in non-removable spots (trigger link, CTA, cities panel). */
export function collectStructuralRefs(items) {
  const found = []
  for (const it of items || []) {
    for (const [link, where] of [[it.link, 'menu link'], [it.cta?.link, 'call to action'], [it.cities?.link, 'cities panel']]) {
      if (link?.type === 'page' && link.pageId) found.push({ pageId: String(link.pageId), where: `${it.label} (${where})` })
    }
  }
  return found
}
