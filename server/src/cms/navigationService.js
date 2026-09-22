import { resolveLiveMenu } from './menuService.js'
import { resolveSectionNav } from './sectionNavService.js'
import { allSectionKeys } from './templates/index.js'
import { liveIndex } from './pageService.js'

/**
 * Everything the public site needs to build its navigation in ONE request:
 * the main menu, every section's side navigation, and the light page index
 * (used for listings). Only published pages ever appear here.
 */
export async function buildNavigation() {
  const [menu, pages] = await Promise.all([resolveLiveMenu('main'), liveIndex()])
  // Resolved in parallel but assembled in a fixed order, so identical data always
  // serialises identically (stable ETags, cheap 304s).
  const keys = allSectionKeys()
  const resolved = await Promise.all(keys.map((s) => resolveSectionNav(s)))
  const sections = Object.fromEntries(keys.map((s, i) => [s, resolved[i]]))
  return { menu: menu.configured ? menu : null, sections, pages }
}
