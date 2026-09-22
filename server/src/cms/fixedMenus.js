import fs from 'node:fs'
import { CmsError } from './errors.js'

/**
 * The main menu is FIXED. Which menus exist, their names, order, type, colour,
 * illustration, groups and group headings belong to the website's design, so the CMS
 * refuses any change to them — on save, publish and import alike. Admins only manage what
 * sits inside: the links in each group, the mobile list, and the texts/links of the
 * call-to-action panels.
 *
 * The skeleton is generated from the built-in navigation (migrate/generateFixedMenus.js);
 * a test fails if it drifts from constants/content.js.
 */
export const FIXED_MENUS = Object.freeze(JSON.parse(fs.readFileSync(new URL('./fixedMenus.json', import.meta.url), 'utf8')))

const sameLink = (a, b) => a?.type === b?.type && (a?.route ?? '') === (b?.route ?? '')

/** The structural problems of a menu draft, as readable sentences (empty = the skeleton is intact). */
export function structureViolations(items) {
  const out = []
  const ids = items.map((i) => i.id)
  const fixedIds = FIXED_MENUS.map((m) => m.id)

  const added = ids.filter((id) => !fixedIds.includes(id))
  const removed = fixedIds.filter((id) => !ids.includes(id))
  if (added.length) out.push(`Menus cannot be added (${added.join(', ')}). The main menus are fixed.`)
  if (removed.length) out.push(`Menus cannot be removed or hidden (${removed.join(', ')}). The main menus are fixed.`)
  if (!added.length && !removed.length && ids.some((id, i) => id !== fixedIds[i])) out.push('Menus cannot be reordered. The main menus are fixed.')
  if (out.length) return out

  for (const fixed of FIXED_MENUS) {
    const it = items.find((i) => i.id === fixed.id)
    const at = `Menu "${fixed.label}"`
    if (it.label !== fixed.label) out.push(`${at}: the name cannot be changed.`)
    if (it.kind !== fixed.kind) out.push(`${at}: the menu type cannot be changed.`)
    if (it.enabled === false) out.push(`${at}: a menu cannot be switched off.`)
    if ((it.color ?? undefined) !== (fixed.color ?? undefined)) out.push(`${at}: the colour cannot be changed.`)
    if ((it.visual || it.id) !== fixed.visual) out.push(`${at}: the illustration cannot be changed.`)
    if (!sameLink(it.link, fixed.link)) out.push(`${at}: the address the menu itself goes to cannot be changed.`)

    const gids = it.groups.map((g) => g.id)
    const fgids = fixed.groups.map((g) => g.id)
    if (gids.length !== fgids.length || gids.some((id, i) => id !== fgids[i])) {
      out.push(`${at}: groups cannot be added, removed or reordered.`)
    } else {
      it.groups.forEach((g, i) => {
        if (g.heading !== fixed.groups[i].heading) out.push(`${at}: the group heading "${fixed.groups[i].heading}" cannot be changed.`)
      })
    }

    if (Boolean(it.cta) !== Boolean(fixed.cta)) out.push(`${at}: the call-to-action panel cannot be added or removed.`)
    else if (it.cta && it.cta.tone !== fixed.cta.tone) out.push(`${at}: the call-to-action style cannot be changed.`)
    if (Boolean(it.cities) !== fixed.cities) out.push(`${at}: the side panel cannot be added or removed.`)
  }
  return out
}

export function assertFixedStructure(items) {
  const violations = structureViolations(items)
  if (violations.length) {
    throw new CmsError(
      422,
      'MENU_STRUCTURE_LOCKED',
      'The main menus are fixed: you can manage the pages inside them, but not the menus themselves.',
      { violations },
    )
  }
}
