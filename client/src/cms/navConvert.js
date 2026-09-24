/**
 * Converts the website's built-in navigation (constants/content.js ATOOPV_NAV,
 * constants/servicesNav.js, constants/resourcesNav.js) into CMS documents, and
 * back into the shape the navbar / side navigation components render.
 *
 * Pure functions with no imports: used by the admin "Import built-in navigation"
 * button (browser) and by the server's `cms:import-nav` script (Node).
 * Every label and address is copied verbatim — nothing is translated or rewritten.
 */

// Not CMS menus: code-level utility links that should never be imported/exported
// as menu items. Currently none.
export const UTILITY_HREFS = []

const route = (r) => ({ type: 'route', route: r })

const slug = (s) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

/** ATOOPV_NAV -> menu items (any UTILITY_HREFS entries excluded: they stay code-level utility links). */
export function toMenuItems(atoopvNav) {
  return atoopvNav
    .filter((item) => !UTILITY_HREFS.includes(item.href))
    .map((item) => {
      const id = item.key || slug(item.label)
      if (!item.mega) return { id, label: item.label, enabled: true, kind: 'link', link: route(item.href) }

      const groups = item.mega.columns.map((col) => {
        const gid = slug(col.heading)
        return {
          id: gid,
          heading: col.heading,
          entries: col.items.map((l, i) => ({ id: `${gid}-${i + 1}`, label: l.label, link: route(l.href) })),
        }
      })
      const out = {
        id,
        label: item.label,
        enabled: true,
        kind: 'mega',
        link: route(item.href),
        color: item.color,
        visual: item.key,
        groups,
        mobile: (item.mobileItems || []).map((l, i) => ({ id: `m-${i + 1}`, label: l.label, link: route(l.href) })),
      }
      if (item.mega.cta) {
        const { tone, eyebrow, title, buttonLabel, buttonHref } = item.mega.cta
        out.cta = { tone, eyebrow, title, buttonLabel, link: route(buttonHref) }
      }
      if (item.mega.cities) {
        const { heading, label, linkLabel, href } = item.mega.cities
        out.cities = { heading, label, linkLabel, link: route(href) }
      }
      return out
    })
}

/** The CMS's resolved (public) menu -> the ATOOPV_NAV item shape the navbar renders. */
export function fromResolvedMenu(items) {
  return items.map((it) => {
    if (it.kind !== 'mega') return { label: it.label, href: it.href, ...(it.color ? { color: it.color } : {}) }
    return {
      key: it.id,
      label: it.label,
      href: it.href,
      color: it.color,
      // Only when the motif is chosen separately from the menu's own id (see MegaMenuPanel).
      ...(it.visual && it.visual !== it.id ? { visual: it.visual } : {}),
      mega: {
        columns: it.groups.map((g) => ({ heading: g.heading, items: g.entries.map((e) => ({ label: e.label, href: e.href })) })),
        ...(it.cta ? { cta: { tone: it.cta.tone, eyebrow: it.cta.eyebrow, title: it.cta.title, buttonLabel: it.cta.buttonLabel, buttonHref: it.cta.buttonHref } } : {}),
        ...(it.cities ? { cities: { heading: it.cities.heading, label: it.cities.label, linkLabel: it.cities.linkLabel, href: it.cities.href } } : {}),
      },
      mobileItems: it.mobile.map((m) => ({ label: m.label, href: m.href })),
    }
  })
}

/** A section's built-in side-navigation items ([{label, to, end}]) -> CMS entries. */
export function toSectionEntries(navItems) {
  return navItems.map((n, i) => ({ id: `e${i + 1}`, label: n.label, link: route(n.to), ...(n.end ? { end: true } : {}) }))
}
