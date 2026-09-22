import { SectionNav } from '../models/SectionNav.js'
import { Page } from '../models/Page.js'
import { allSectionKeys } from './templates/index.js'
import { sectionNavEntriesSchema } from './schemas.js'
import { CmsError } from './errors.js'
import { collectEntryRefs } from './navRefs.js'

export const isSection = (s) => allSectionKeys().includes(s)

function assertSection(section) {
  if (!isSection(section)) throw new CmsError(404, 'NOT_FOUND', 'Unknown section')
}

export async function getSectionNav(section) {
  assertSection(section)
  return (await SectionNav.findOne({ section })) || SectionNav.create({ section })
}

export async function listSectionNavs() {
  const docs = await SectionNav.find()
  const bySection = new Map(docs.map((d) => [d.section, d]))
  return allSectionKeys().map((section) => {
    const d = bySection.get(section)
    return { section, configured: Boolean(d?.configured), hasUnpublishedChanges: d ? d.rev !== d.publishedRev : false }
  })
}

function validateEntries(entries) {
  const parsed = sectionNavEntriesSchema.safeParse(entries)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'The side navigation is not valid', parsed.error.flatten())
  return parsed.data
}

async function assertRefsExist(entries) {
  const ids = [...new Set(collectEntryRefs(entries))]
  if (!ids.length) return
  const existing = new Set((await Page.find({ _id: { $in: ids } }).select('_id')).map((p) => String(p._id)))
  const missing = ids.filter((id) => !existing.has(id))
  if (missing.length) throw new CmsError(422, 'NAV_LINK_INVALID', 'A navigation entry points to a page that does not exist.', { pageIds: missing })
}

export async function saveSectionNavDraft(section, entries, { expectedRev, userId } = {}) {
  const clean = validateEntries(entries)
  await assertRefsExist(clean)
  const nav = await getSectionNav(section)
  if (expectedRev != null && Number(expectedRev) !== nav.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'This navigation was changed by someone else. Reload to see the latest version.')
  }
  nav.draft = { entries: clean, savedAt: new Date(), savedBy: userId }
  nav.markModified('draft')
  nav.rev += 1
  await nav.save()
  return nav
}

/** Copies the website's built-in list into the CMS (draft and live). Never overwrites existing work. */
export async function initializeSectionNav(section, entries, userId) {
  const clean = validateEntries(entries)
  await assertRefsExist(clean)
  const nav = await getSectionNav(section)
  if (nav.configured) throw new CmsError(409, 'NAV_NOT_EMPTY', 'This navigation is already set up.')
  const version = { entries: clean, savedAt: new Date(), savedBy: userId }
  nav.draft = version
  nav.live = version
  nav.markModified('draft')
  nav.markModified('live')
  nav.configured = true
  nav.rev += 1
  nav.publishedRev = nav.rev
  nav.publishedAt = new Date()
  await nav.save()
  return nav
}

export async function publishSectionNav(section, userId) {
  const nav = await getSectionNav(section)
  if (!nav.configured) throw new CmsError(409, 'NAV_NOT_CONFIGURED', 'Import the built-in navigation first.')
  const clean = validateEntries(nav.draft.entries)
  await assertRefsExist(clean)
  nav.live = { entries: clean, savedAt: new Date(), savedBy: userId }
  nav.markModified('live')
  nav.publishedRev = nav.rev
  nav.publishedAt = new Date()
  await nav.save()
  return nav
}

export async function discardSectionNavDraft(section, userId) {
  const nav = await getSectionNav(section)
  nav.draft = { entries: JSON.parse(JSON.stringify(nav.live.entries)), savedAt: new Date(), savedBy: userId }
  nav.markModified('draft')
  nav.rev += 1
  await nav.save()
  return nav
}

/**
 * Public: the section's page list for side navigation and previous/next.
 *   configured → the CMS list (built-in pages included, in the saved order) + new published pages appended
 *   otherwise  → just the CMS pages; the website appends them to its built-in list
 */
export async function resolveSectionNav(section) {
  assertSection(section)
  const nav = await SectionNav.findOne({ section })
  const configured = Boolean(nav?.configured)
  const entries = configured ? nav.live.entries : []

  const refIds = [...new Set(collectEntryRefs(entries))]
  const [refPages, sectionPages] = await Promise.all([
    refIds.length ? Page.find({ _id: { $in: refIds }, status: 'published', live: { $ne: null } }).select('path navLabel live.title') : [],
    Page.find({ section, status: 'published', live: { $ne: null }, showInNav: true }).select('path navLabel order isHub live.title createdAt').sort({ order: 1, createdAt: 1 }),
  ])
  const byId = new Map(refPages.map((p) => [String(p._id), p]))
  const labelOf = (p) => p.navLabel || p.live.title

  const out = []
  const seenPaths = new Set()
  for (const e of entries) {
    if (e.link.type === 'page') {
      const p = byId.get(String(e.link.pageId))
      if (!p) continue // unpublished / removed pages simply drop out
      out.push({ label: e.label || labelOf(p), to: p.path, ...(e.end ? { end: true } : {}) })
      seenPaths.add(p.path)
    } else {
      out.push({ label: e.label, to: e.link.route, ...(e.end ? { end: true } : {}) })
      seenPaths.add(e.link.route)
    }
  }
  for (const p of sectionPages) {
    if (seenPaths.has(p.path)) continue
    out.push({ label: labelOf(p), to: p.path, ...(p.isHub ? { end: true } : {}) })
    seenPaths.add(p.path)
  }
  return { configured, entries: out }
}
