import { Menu } from '../models/Menu.js'
import { Page } from '../models/Page.js'
import { MAX_MAIN_MENU_ITEMS } from './constants.js'
import { menuItemsSchema } from './schemas.js'
import { CmsError } from './errors.js'
import { collectPageRefs } from './navRefs.js'
import { assertFixedStructure } from './fixedMenus.js'

export async function getMenu(key) {
  return (await Menu.findOne({ key })) || Menu.create({ key })
}

function validateItems(items) {
  // Checked first, and with its own stable code, so the limit is unmistakable
  // to both the admin UI and any other API client.
  if (Array.isArray(items) && items.length > MAX_MAIN_MENU_ITEMS) {
    throw new CmsError(422, 'MENU_LIMIT', `The main menu can have at most ${MAX_MAIN_MENU_ITEMS} items (you sent ${items.length}).`)
  }
  const parsed = menuItemsSchema.safeParse(items)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'The menu is not valid', parsed.error.flatten())
  // The menus themselves are fixed; only what sits inside them may change.
  assertFixedStructure(parsed.data)
  return parsed.data
}

async function assertPageRefsExist(items) {
  const ids = [...new Set(collectPageRefs(items).map((l) => l.pageId))]
  if (!ids.length) return
  const existing = new Set((await Page.find({ _id: { $in: ids } }).select('_id')).map((p) => String(p._id)))
  const missing = ids.filter((id) => !existing.has(id))
  if (missing.length) throw new CmsError(422, 'MENU_LINK_INVALID', 'A menu link points to a page that does not exist.', { pageIds: missing })
}

export async function saveMenuDraft(key, items, { expectedRev, userId } = {}) {
  const clean = validateItems(items)
  const menu = await getMenu(key)
  // The menus can only be edited once the website's built-in menu has been imported, so there is
  // no way to start a menu from scratch.
  if (!menu.draft.items.length && !menu.live.items.length) {
    throw new CmsError(409, 'MENU_NOT_INITIALIZED', 'The main menu has not been set up yet. Import the built-in menu first.')
  }
  if (expectedRev != null && Number(expectedRev) !== menu.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'The menu was changed by someone else. Reload to see the latest version.')
  }
  await assertPageRefsExist(clean)
  menu.draft = { items: clean, savedAt: new Date(), savedBy: userId }
  menu.markModified('draft')
  menu.rev += 1
  await menu.save()
  return menu
}

/**
 * First-run setup: copy the website's built-in navigation into the CMS (draft AND
 * live, so the site looks exactly the same). Refuses if the menu already has content,
 * so it can never overwrite work, and refuses anything but the fixed set of menus.
 */
export async function initializeMenu(key, items, userId) {
  const clean = validateItems(items)
  await assertPageRefsExist(clean)
  const menu = await getMenu(key)
  if (menu.draft.items.length || menu.live.items.length) {
    throw new CmsError(409, 'MENU_NOT_EMPTY', 'This menu already has content, so the built-in navigation was not imported.')
  }
  const version = { items: clean, savedAt: new Date(), savedBy: userId }
  menu.draft = version
  menu.live = version
  menu.markModified('draft')
  menu.markModified('live')
  menu.rev += 1
  menu.publishedRev = menu.rev
  menu.publishedAt = new Date()
  await menu.save()
  return menu
}

/** Placements that point at a menu/group that no longer exists are cleared (the pages themselves are untouched). */
async function cleanPlacements(items) {
  const groupsByItem = new Map(items.map((it) => [it.id, new Set(it.groups.map((g) => g.id))]))
  const placed = await Page.find({ 'menu.menuId': { $ne: null } }).select('menu')
  const stale = placed.filter((p) => !groupsByItem.get(p.menu.menuId)?.has(p.menu.groupId)).map((p) => p._id)
  if (stale.length) await Page.updateMany({ _id: { $in: stale } }, { $set: { 'menu.menuId': null, 'menu.groupId': null } })
  return stale.length
}

export async function publishMenu(key, userId) {
  const menu = await getMenu(key)
  const clean = validateItems(menu.draft.items)
  await assertPageRefsExist(clean)
  // Pages that are not published yet may be referenced: they stay hidden until they are.
  menu.live = { items: clean, savedAt: new Date(), savedBy: userId }
  menu.markModified('live')
  menu.publishedRev = menu.rev
  menu.publishedAt = new Date()
  await menu.save()
  await cleanPlacements(clean)
  return menu
}

export async function discardMenuDraft(key, userId) {
  const menu = await getMenu(key)
  menu.draft = { items: JSON.parse(JSON.stringify(menu.live.items)), savedAt: new Date(), savedBy: userId }
  menu.markModified('draft')
  menu.rev += 1
  await menu.save()
  return menu
}

/** How many pages are placed in each menu/group — shown before a menu or group is removed. */
export async function placementCounts() {
  const placed = await Page.find({ 'menu.menuId': { $ne: null } }).select('menu status draft.title')
  const counts = {}
  for (const p of placed) {
    const m = (counts[p.menu.menuId] ||= { total: 0, groups: {} })
    m.total += 1
    m.groups[p.menu.groupId] = (m.groups[p.menu.groupId] || 0) + 1
  }
  return counts
}

/** Placement must target a group of a mega menu that exists (draft or live). */
export async function assertPlacement(menuId, groupId) {
  const menu = await Menu.findOne({ key: 'main' })
  const inVersion = (v) => (v?.items || []).find((it) => it.id === menuId && it.kind === 'mega' && (it.groups || []).some((g) => g.id === groupId))
  if (!menu || !(inVersion(menu.draft) || inVersion(menu.live))) {
    throw new CmsError(422, 'MENU_PLACEMENT_INVALID', 'Choose a main menu and one of its groups.')
  }
}

/* ------------------------------ public (live) ------------------------------ */

const isPageLink = (l) => l?.type === 'page'

/** Public: the live menu, ready for the navbar. Unpublished pages never appear. */
export async function resolveLiveMenu(key) {
  const menu = await Menu.findOne({ key })
  const items = menu?.live?.items || []

  const refIds = [...new Set(collectPageRefs(items).map((l) => l.pageId))]
  const [refPages, placedPages] = await Promise.all([
    refIds.length ? Page.find({ _id: { $in: refIds }, status: 'published', live: { $ne: null } }).select('path navLabel live.title') : [],
    Page.find({ status: 'published', live: { $ne: null }, 'menu.menuId': { $ne: null } }).select('path navLabel live.title menu createdAt').sort('createdAt'),
  ])
  const byId = new Map(refPages.map((p) => [String(p._id), p]))
  const labelOf = (p) => p.navLabel || p.live.title

  const resolveLink = (link) => {
    if (!link) return null
    if (isPageLink(link)) return byId.get(String(link.pageId))?.path || null
    return link.route
  }
  const resolveEntry = (e) => {
    const href = resolveLink(e.link)
    if (!href) return null
    const page = isPageLink(e.link) ? byId.get(String(e.link.pageId)) : null
    return { id: e.id, label: e.label || (page ? labelOf(page) : ''), href }
  }

  const out = []
  for (const it of items) {
    if (it.enabled === false) continue
    const base = { id: it.id, label: it.label, color: it.color, visual: it.visual || it.id }

    if (it.kind !== 'mega') {
      const href = resolveLink(it.link)
      if (href) out.push({ ...base, kind: 'link', href })
      continue
    }

    const groups = []
    const seenPages = new Set()
    for (const g of it.groups) {
      const entries = g.entries.map(resolveEntry).filter(Boolean)
      const referenced = new Set(g.entries.filter((e) => isPageLink(e.link)).map((e) => String(e.link.pageId)))
      for (const p of placedPages) {
        if (p.menu.menuId === it.id && p.menu.groupId === g.id && !referenced.has(String(p._id))) {
          entries.push({ id: `page-${p._id}`, label: labelOf(p), href: p.path })
          seenPages.add(String(p._id))
        }
      }
      if (entries.length) groups.push({ id: g.id, heading: g.heading, entries })
    }

    const triggerHref = resolveLink(it.link)
    if (!groups.length) {
      if (triggerHref) out.push({ ...base, kind: 'link', href: triggerHref }) // nothing left to show: degrade to a plain link
      continue
    }
    // If the trigger's own page is unpublished, the menu still opens; its label links to its first page.
    const href = triggerHref || groups[0].entries[0].href

    const mobile = it.mobile.map(resolveEntry).filter(Boolean)
    const mobileHrefs = new Set(mobile.map((m) => m.href))
    for (const g of groups) for (const e of g.entries) if (seenPages.has(e.id.replace('page-', '')) && !mobileHrefs.has(e.href)) mobile.push(e)

    const cta = it.cta ? { ...it.cta, link: undefined, buttonHref: resolveLink(it.cta.link) } : undefined
    const cities = it.cities ? { ...it.cities, link: undefined, href: resolveLink(it.cities.link) } : undefined
    out.push({ ...base, kind: 'mega', href, groups, mobile, cta, cities })
  }
  // `configured`: the CMS has a live menu (even if everything in it is currently disabled or hidden),
  // as opposed to nothing imported yet — in which case the website keeps its built-in menu.
  return { key, items: out, configured: items.length > 0, publishedAt: menu?.publishedAt || null }
}
