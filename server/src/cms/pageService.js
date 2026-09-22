import mongoose from 'mongoose'
import { Page } from '../models/Page.js'
import { PageRevision } from '../models/PageRevision.js'
import { Redirect } from '../models/Redirect.js'
import { Menu } from '../models/Menu.js'
import { SectionNav } from '../models/SectionNav.js'
import { assertPlacement } from './menuService.js'
import { collectPageRefs, collectEntryRefs, collectStructuralRefs, stripEntryRefs } from './navRefs.js'
import { getTemplate, getSection } from './templates/index.js'
import { inlineText, seoSchema, slugSchema } from './schemas.js'
import { isReservedSlug } from './reservedSlugs.js'
import { cloneVersion, escapeRegex, normalizePath, versionFingerprint } from './util.js'

import { CmsError } from './errors.js'
export { CmsError }

const isObjectId = (id) => mongoose.isValidObjectId(id) && /^[a-f0-9]{24}$/i.test(String(id))
const titleSchema = inlineText(200, 1)

function cleanTags(template, tags) {
  const allowed = new Set((template.tagOptions || []).map((t) => t.key))
  const list = [...new Set((Array.isArray(tags) ? tags : []).map(String))]
  const bad = list.filter((t) => !allowed.has(t))
  if (bad.length) throw new CmsError(422, 'INVALID_TAG', `Unknown label: ${bad.join(', ')}`)
  return list
}

async function cleanPlacement(menu) {
  if (menu === null || menu === undefined || !menu.menuId) return { menuId: null, groupId: null }
  await assertPlacement(menu.menuId, menu.groupId)
  return { menuId: menu.menuId, groupId: menu.groupId }
}

/* --------------------------------- helpers -------------------------------- */

async function loadPage(id) {
  if (!isObjectId(id)) throw new CmsError(404, 'NOT_FOUND', 'Page not found')
  const page = await Page.findById(id)
  if (!page) throw new CmsError(404, 'NOT_FOUND', 'Page not found')
  return page
}

function templateOf(page) {
  const template = getTemplate(page.templateKey)
  if (!template) throw new CmsError(500, 'UNKNOWN_TEMPLATE', `Template "${page.templateKey}" is no longer registered`)
  return template
}

function parseOrThrow(schema, value, message) {
  const r = schema.safeParse(value)
  if (!r.success) throw new CmsError(422, 'VALIDATION_FAILED', message, r.error.flatten())
  return r.data
}

const validateContent = (template, content) =>
  parseOrThrow(template.contentSchema, content, 'The page content is not valid')

function assertSlugAllowed(page, slug) {
  if (!isReservedSlug(slug)) return
  // A migrated page may keep (or return to) its own original slug.
  const own = page?.legacy?.file ? page.legacy.file.split('/').pop().replace(/\.md$/, '') : null
  if (own && own === slug) return
  throw new CmsError(409, 'SLUG_RESERVED', `The address "${slug}" is reserved by an existing page. Choose another.`)
}

/** Is this path (or a draft slug that would produce it) held by another live/draft page? */
async function pathTaken(template, section, slug, excludeId) {
  const path = template.pathFor(section, slug)
  const q = {
    status: { $in: ['draft', 'published'] },
    $or: [{ path }, { templateKey: template.key, section, 'draft.slug': slug }],
  }
  if (excludeId) q._id = { $ne: excludeId }
  return Boolean(await Page.exists(q))
}

async function record(page, kind, userId, snapshotVersion) {
  const last = await PageRevision.findOne({ page: page._id }).sort('-seq').select('seq')
  await PageRevision.create({
    page: page._id,
    seq: (last?.seq || 0) + 1,
    kind,
    path: page.path,
    snapshot: cloneVersion(snapshotVersion),
    createdBy: userId,
  })
}

function nextVersion(prev, patch, userId) {
  return { ...prev, ...patch, savedAt: new Date(), savedBy: userId }
}

/* ---------------------------------- create -------------------------------- */

export async function createPage(input, userId) {
  const template = getTemplate(input.templateKey)
  if (!template) throw new CmsError(422, 'UNKNOWN_TEMPLATE', 'Choose one of the approved templates.')
  if (!template.creatable) throw new CmsError(403, 'TEMPLATE_NOT_CREATABLE', 'New pages cannot be created from this template.')

  const section = getSection(template, input.section)
  if (!section) throw new CmsError(422, 'INVALID_SECTION', `"${input.section}" is not a section of the ${template.name} template.`)

  const slug = parseOrThrow(slugSchema, input.slug, 'Invalid address (slug)')
  const title = parseOrThrow(titleSchema, input.title, 'A title is required')
  assertSlugAllowed(null, slug)
  if (await pathTaken(template, section.key, slug)) {
    throw new CmsError(409, 'PATH_TAKEN', `A page already exists at ${template.pathFor(section.key, slug)}.`)
  }

  const content = validateContent(template, { ...template.defaults, ...(input.content || {}) })
  const seo = parseOrThrow(seoSchema, input.seo || {}, 'Invalid SEO fields')
  const tags = cleanTags(template, input.tags)
  const menu = await cleanPlacement(input.menu)
  const navLabel = input.navLabel ? parseOrThrow(inlineText(120), input.navLabel, 'Invalid navigation label') : ''

  const page = await Page.create({
    templateKey: template.key,
    section: section.key,
    slug,
    path: template.pathFor(section.key, slug),
    status: 'draft',
    navLabel,
    tags,
    menu,
    draft: { title, slug, content, seo, savedAt: new Date(), savedBy: userId },
    createdBy: userId,
    updatedBy: userId,
  })
  // "Publish" straight from the Add Page form: the same validated publish path as the editor's button.
  return input.publish ? publishPage(page._id, userId) : page
}

/* ------------------------------ read (admin) ------------------------------ */

export async function listPages({ templateKey, section, status, q } = {}) {
  const filter = {}
  if (templateKey) filter.templateKey = String(templateKey)
  if (section) filter.section = String(section)
  filter.status = status && ['draft', 'published', 'archived'].includes(status) ? status : { $ne: 'archived' }
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 80)), 'i')
    filter.$or = [{ 'draft.title': rx }, { path: rx }]
  }
  const pages = await Page.find(filter).sort('-updatedAt').limit(500).select('-draft.content -live.content')
  return pages
}

export const getPage = loadPage

/* -------------------------------- edit draft ------------------------------ */

export async function updateDraft(id, patch, { expectedRev, userId } = {}) {
  const page = await loadPage(id)
  if (page.status === 'archived') throw new CmsError(409, 'ARCHIVED', 'This page is archived. Restore it before editing.')
  if (expectedRev != null && Number(expectedRev) !== page.rev) {
    throw new CmsError(409, 'REV_CONFLICT', 'This page was changed by someone else. Reload to see the latest version.')
  }
  const template = templateOf(page)
  const prev = cloneVersion(page.draft)
  const next = {}

  if (patch.title !== undefined) next.title = parseOrThrow(titleSchema, patch.title, 'A title is required')

  if (patch.slug !== undefined && patch.slug !== prev.slug) {
    const slug = parseOrThrow(slugSchema, patch.slug, 'Invalid address (slug)')
    assertSlugAllowed(page, slug)
    if (await pathTaken(template, page.section, slug, page._id)) {
      throw new CmsError(409, 'PATH_TAKEN', `A page already exists at ${template.pathFor(page.section, slug)}.`)
    }
    next.slug = slug
  }

  if (patch.content !== undefined) {
    next.content = validateContent(template, { ...prev.content, ...patch.content })
  }
  if (patch.seo !== undefined) {
    next.seo = parseOrThrow(seoSchema, { ...prev.seo, ...patch.seo }, 'Invalid SEO fields')
  }

  page.draft = nextVersion(prev, next, userId)
  page.markModified('draft')

  // Page-level navigation metadata (not part of a version).
  if (patch.navLabel !== undefined) page.navLabel = parseOrThrow(inlineText(120), patch.navLabel, 'Invalid navigation label')
  if (patch.order !== undefined) page.order = Number.isFinite(Number(patch.order)) ? Number(patch.order) : page.order
  if (patch.showInNav !== undefined) page.showInNav = Boolean(patch.showInNav)
  if (patch.tags !== undefined) page.tags = cleanTags(template, patch.tags)
  if (patch.menu !== undefined) page.menu = await cleanPlacement(patch.menu)

  // Until first publish, the page's URL simply tracks its draft address.
  if (page.status === 'draft' && !page.firstPublishedAt && next.slug) {
    page.slug = next.slug
    page.path = template.pathFor(page.section, next.slug)
  }

  page.rev += 1
  page.updatedBy = userId
  await page.save()
  return page
}

/* --------------------------------- publish -------------------------------- */

export async function publishPage(id, userId) {
  const page = await loadPage(id)
  if (page.status === 'archived') throw new CmsError(409, 'ARCHIVED', 'This page is archived. Restore it before publishing.')
  const template = templateOf(page)

  // Full re-validation: what goes live must satisfy the template right now.
  const draft = cloneVersion(page.draft)
  draft.content = validateContent(template, draft.content)
  parseOrThrow(seoSchema, draft.seo || {}, 'Invalid SEO fields')
  parseOrThrow(slugSchema, draft.slug, 'Invalid address (slug)')
  parseOrThrow(titleSchema, draft.title, 'A title is required')
  assertSlugAllowed(page, draft.slug)

  const oldPath = page.path
  const newPath = template.pathFor(page.section, draft.slug)
  if (newPath !== oldPath && (await pathTaken(template, page.section, draft.slug, page._id))) {
    // pathTaken also matches this page's own draft slug via other pages only (excluded above).
    throw new CmsError(409, 'PATH_TAKEN', `A page already exists at ${newPath}.`)
  }

  const wasPublishedBefore = Boolean(page.firstPublishedAt)
  const now = new Date()
  page.live = { ...draft, savedAt: now }
  page.excerpt = template.excerptOf ? template.excerptOf(draft.content) : ''
  page.slug = draft.slug
  page.path = newPath
  page.status = 'published'
  page.publishedAt = now
  page.firstPublishedAt = page.firstPublishedAt || now
  page.publishedRev = page.rev
  page.updatedBy = userId
  page.markModified('live')
  await page.save()

  if (wasPublishedBefore && oldPath !== newPath) {
    await Redirect.findOneAndUpdate({ from: oldPath }, { from: oldPath, to: newPath, source: 'auto', status: 301 }, { upsert: true })
  }
  await Redirect.deleteOne({ from: newPath }) // a page living here again must not redirect away
  await record(page, 'publish', userId, page.live)
  return page
}

export async function unpublishPage(id, userId) {
  const page = await loadPage(id)
  if (page.status !== 'published') throw new CmsError(409, 'NOT_PUBLISHED', 'This page is not published.')
  const last = cloneVersion(page.live)
  page.live = null
  page.status = 'draft'
  page.publishedRev = null
  page.updatedBy = userId
  await page.save()
  await record(page, 'unpublish', userId, last)
  return page
}

export async function discardDraft(id, userId) {
  const page = await loadPage(id)
  if (!page.live) throw new CmsError(409, 'NO_LIVE_VERSION', 'There is no published version to go back to.')
  page.draft = nextVersion(cloneVersion(page.live), {}, userId)
  page.markModified('draft')
  page.rev += 1
  page.updatedBy = userId
  await page.save()
  return page
}

/* --------------------------- remove / restore / copy ----------------------- */

export async function archivePage(id, { redirectTo, userId } = {}) {
  const page = await loadPage(id)
  const template = templateOf(page)
  if (page.isHub || template.singleton) throw new CmsError(409, 'PROTECTED', 'This page cannot be removed.')
  if (page.status === 'archived') return page

  if (redirectTo) {
    const to = normalizePath(redirectTo)
    if (to === page.path) throw new CmsError(422, 'INVALID_REDIRECT', 'A page cannot redirect to itself.')
    if (page.firstPublishedAt) {
      await Redirect.findOneAndUpdate({ from: page.path }, { from: page.path, to, source: 'auto', status: 301 }, { upsert: true })
    }
  }
  const last = page.live ? cloneVersion(page.live) : cloneVersion(page.draft)
  page.status = 'archived'
  page.live = null
  page.publishedRev = null
  page.updatedBy = userId
  await page.save()
  await record(page, 'unpublish', userId, last)
  return page
}

export async function restoreArchived(id, userId) {
  const page = await loadPage(id)
  if (page.status !== 'archived') throw new CmsError(409, 'NOT_ARCHIVED', 'This page is not archived.')
  const template = templateOf(page)
  if (await pathTaken(template, page.section, page.draft.slug, page._id)) {
    throw new CmsError(409, 'PATH_TAKEN', 'Another page now uses this address. Rename this page before restoring it.')
  }
  page.status = 'draft'
  page.slug = page.draft.slug
  page.path = template.pathFor(page.section, page.draft.slug)
  page.updatedBy = userId
  await page.save()
  return page
}

/** Only for pages that were never published — anything that has been public is archived, not erased. */
export async function deletePermanently(id) {
  const page = await loadPage(id)
  if (page.firstPublishedAt) {
    throw new CmsError(409, 'WAS_PUBLISHED', 'A page that has been published can only be archived, not permanently deleted.')
  }
  await stripPageRefs(page)
  await PageRevision.deleteMany({ page: page._id })
  await page.deleteOne()
  return page
}

export async function duplicatePage(id, userId) {
  const src = await loadPage(id)
  const template = templateOf(src)
  let n = 1
  let slug
  do {
    slug = `${src.draft.slug}-copy${n > 1 ? `-${n}` : ''}`
    n += 1
  } while ((isReservedSlug(slug) || (await pathTaken(template, src.section, slug))) && n < 50)
  const src_ = cloneVersion(src.draft)
  return Page.create({
    templateKey: src.templateKey,
    section: src.section,
    slug,
    path: template.pathFor(src.section, slug),
    status: 'draft',
    navLabel: src.navLabel,
    tags: src.tags,
    draft: { ...src_, title: `${src_.title} (copy)`.slice(0, 200), slug, savedAt: new Date(), savedBy: userId },
    createdBy: userId,
    updatedBy: userId,
  })
}

/* -------------------------------- revisions -------------------------------- */

export async function listRevisions(id) {
  const page = await loadPage(id)
  return PageRevision.find({ page: page._id }).sort('-seq').limit(100)
}

export async function restoreRevision(id, seq, userId) {
  const page = await loadPage(id)
  if (page.status === 'archived') throw new CmsError(409, 'ARCHIVED', 'This page is archived. Restore it before editing.')
  const rev = await PageRevision.findOne({ page: page._id, seq: Number(seq) })
  if (!rev) throw new CmsError(404, 'REVISION_NOT_FOUND', 'Revision not found')
  const template = templateOf(page)
  const snap = rev.snapshot
  const content = validateContent(template, snap.content)
  page.draft = nextVersion(cloneVersion(page.draft), { title: snap.title, slug: snap.slug, content, seo: snap.seo || {} }, userId)
  page.markModified('draft')
  page.rev += 1
  page.updatedBy = userId
  await page.save()
  return page
}

/* --------------------------------- usages ---------------------------------- */

/**
 * Everything that refers to this page — shown before it is unpublished or removed:
 * menus (entries and placement), section navigation, other pages' text, and the
 * automatic listings it appears in.
 */
export async function findUsages(id) {
  const page = await loadPage(id)
  const pid = String(page._id)

  const menus = await Menu.find()
  const inMenus = []
  for (const m of menus) {
    const seen = new Set()
    for (const version of ['draft', 'live']) {
      for (const ref of collectPageRefs(m[version]?.items).filter((r) => r.pageId === pid)) {
        if (!seen.has(ref.where)) { seen.add(ref.where); inMenus.push({ menu: m.key, where: ref.where }) }
      }
    }
  }
  if (page.menu?.menuId) {
    const main = menus.find((m) => m.key === 'main')
    const item = [...(main?.live?.items || []), ...(main?.draft?.items || [])].find((it) => it.id === page.menu.menuId)
    const group = item?.groups?.find((g) => g.id === page.menu.groupId)
    inMenus.push({ menu: 'main', where: `${item?.label || page.menu.menuId} › ${group?.heading || page.menu.groupId} (placement)` })
  }

  const navs = await SectionNav.find()
  const inSectionNavs = navs
    .filter((n) => collectEntryRefs(n.draft?.entries).includes(pid) || collectEntryRefs(n.live?.entries).includes(pid))
    .map((n) => n.section)

  const others = await Page.find({ _id: { $ne: page._id }, status: { $ne: 'archived' } })
  const inPages = others
    .filter((p) => JSON.stringify([p.draft?.content, p.live?.content]).includes(page.path))
    .map((p) => ({ id: String(p._id), title: p.draft.title, path: p.path }))

  return {
    menus: [...new Set(inMenus.map((m) => m.menu))],
    menuPlacements: inMenus,
    sectionNavs: inSectionNavs,
    pages: inPages,
    listings: page.showInNav ? [page.section] : [],
  }
}

/** Removes a never-published page's entries from menus and section navigation (draft and live). */
async function stripPageRefs(page) {
  const pid = String(page._id)
  const menus = await Menu.find()
  const blockers = menus.flatMap((m) => [...collectStructuralRefs(m.draft?.items), ...collectStructuralRefs(m.live?.items)]).filter((r) => r.pageId === pid)
  if (blockers.length) {
    throw new CmsError(409, 'PAGE_IN_USE', `This page is used as ${[...new Set(blockers.map((b) => b.where))].join(', ')}. Change that link first.`, { blockers })
  }
  for (const m of menus) {
    for (const v of ['draft', 'live']) {
      if (collectPageRefs(m[v]?.items).some((r) => r.pageId === pid)) {
        m[v].items = stripEntryRefs(m[v].items, pid)
        m.markModified(v)
      }
    }
    if (m.isModified()) await m.save()
  }
  for (const n of await SectionNav.find()) {
    let changed = false
    for (const v of ['draft', 'live']) {
      if (collectEntryRefs(n[v]?.entries).includes(pid)) {
        n[v].entries = n[v].entries.filter((e) => !(e.link?.type === 'page' && String(e.link.pageId) === pid))
        n.markModified(v)
        changed = true
      }
    }
    if (changed) await n.save()
  }
}

/* ----------------------------- public (live only) -------------------------- */

export async function resolveLivePage(rawPath) {
  const path = normalizePath(rawPath)
  const page = await Page.findOne({ path, status: 'published', live: { $ne: null } })
  if (page) return { page }
  const redirect = await Redirect.findOne({ from: path })
  if (redirect) return { redirect }
  return null
}

export async function liveIndex() {
  const pages = await Page.find({ status: 'published', live: { $ne: null } })
    .sort({ section: 1, order: 1, path: 1 })
    .select('templateKey section slug path isHub order navLabel showInNav tags excerpt live.title live.savedAt publishedAt')
  return pages.map((p) => ({
    id: String(p._id),
    templateKey: p.templateKey,
    section: p.section,
    slug: p.slug,
    path: p.path,
    title: p.live.title,
    navLabel: p.navLabel,
    order: p.order,
    isHub: p.isHub,
    showInNav: p.showInNav,
    tags: p.tags,
    excerpt: p.excerpt,
    updatedAt: p.live.savedAt,
  }))
}

export { versionFingerprint }
