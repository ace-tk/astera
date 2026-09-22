import { z } from 'zod'
import { TEMPLATES, describeTemplate, getTemplate } from '../cms/templates/index.js'
import * as pages from '../cms/pageService.js'
import { CmsError } from '../cms/pageService.js'
import { expectedRev } from '../cms/http.js'
import { normalizePath } from '../cms/util.js'

const createBody = z.object({
  templateKey: z.string().min(1),
  section: z.string().min(1),
  slug: z.string(),
  title: z.string(),
  content: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  navLabel: z.string().optional(),
  tags: z.array(z.string()).optional(),
  menu: z.object({ menuId: z.string().nullable(), groupId: z.string().nullable() }).nullable().optional(),
  publish: z.boolean().optional(),
})

const updateBody = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  content: z.record(z.any()).optional(),
  seo: z.record(z.any()).optional(),
  navLabel: z.string().optional(),
  order: z.number().optional(),
  showInNav: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  menu: z.object({ menuId: z.string().nullable(), groupId: z.string().nullable() }).nullable().optional(),
  rev: z.number().optional(),
})

const bad = (parsed) => new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())

/* ------------------------------- templates -------------------------------- */

export const listTemplates = async (req, res) => {
  res.json({ templates: Object.values(TEMPLATES).map(describeTemplate) })
}

export const getTemplateDefinition = async (req, res) => {
  const t = getTemplate(req.params.key)
  if (!t) throw new CmsError(404, 'NOT_FOUND', 'Template not found')
  res.json({ template: describeTemplate(t) })
}

/* ---------------------------------- admin --------------------------------- */

export const listPages = async (req, res) => {
  const list = await pages.listPages(req.query)
  res.json({ pages: list.map((p) => p.toSummaryJSON()) })
}

export const createPage = async (req, res) => {
  const parsed = createBody.safeParse(req.body)
  if (!parsed.success) throw bad(parsed)
  const page = await pages.createPage(parsed.data, req.adminUser._id)
  res.status(201).json({ page: page.toAdminJSON() })
}

export const getPage = async (req, res) => {
  res.json({ page: (await pages.getPage(req.params.id)).toAdminJSON() })
}

export const updatePage = async (req, res) => {
  const parsed = updateBody.safeParse(req.body)
  if (!parsed.success) throw bad(parsed)
  const page = await pages.updateDraft(req.params.id, parsed.data, { expectedRev: expectedRev(req), userId: req.adminUser._id })
  res.json({ page: page.toAdminJSON() })
}

export const publishPage = async (req, res) => {
  res.json({ page: (await pages.publishPage(req.params.id, req.adminUser._id)).toAdminJSON() })
}

export const unpublishPage = async (req, res) => {
  res.json({ page: (await pages.unpublishPage(req.params.id, req.adminUser._id)).toAdminJSON() })
}

export const discardDraft = async (req, res) => {
  res.json({ page: (await pages.discardDraft(req.params.id, req.adminUser._id)).toAdminJSON() })
}

export const duplicatePage = async (req, res) => {
  res.status(201).json({ page: (await pages.duplicatePage(req.params.id, req.adminUser._id)).toAdminJSON() })
}

/** DELETE archives (reversible). `?permanent=1` only works for never-published pages. */
export const removePage = async (req, res) => {
  if (req.query.permanent === '1') {
    await pages.deletePermanently(req.params.id)
    return res.json({ ok: true, id: req.params.id, deleted: true })
  }
  const page = await pages.archivePage(req.params.id, { redirectTo: req.query.redirectTo, userId: req.adminUser._id })
  res.json({ page: page.toAdminJSON() })
}

export const restorePage = async (req, res) => {
  res.json({ page: (await pages.restoreArchived(req.params.id, req.adminUser._id)).toAdminJSON() })
}

export const listRevisions = async (req, res) => {
  const revs = await pages.listRevisions(req.params.id)
  // Snapshots can be large; the list only needs metadata.
  res.json({ revisions: revs.map((r) => { const j = r.toClientJSON(); delete j.snapshot; return { ...j, title: r.snapshot?.title } }) })
}

export const restoreRevision = async (req, res) => {
  const page = await pages.restoreRevision(req.params.id, req.params.seq, req.adminUser._id)
  res.json({ page: page.toAdminJSON() })
}

export const usages = async (req, res) => {
  res.json({ usages: await pages.findUsages(req.params.id) })
}

/** The DRAFT, in the same shape the public API serves live pages in — for Preview. */
export const previewPage = async (req, res) => {
  const page = await pages.getPage(req.params.id)
  const d = page.toObject().draft
  res.set('Cache-Control', 'no-store')
  res.json({
    page: {
      id: String(page._id),
      templateKey: page.templateKey,
      section: page.section,
      slug: d.slug,
      path: getTemplate(page.templateKey)?.pathFor(page.section, d.slug) || page.path,
      title: d.title,
      content: d.content,
      seo: d.seo,
      preview: true,
      status: page.status,
    },
  })
}

/* --------------------------------- public --------------------------------- */

// Always revalidate: browsers and CDNs may keep a copy, but must ask before reusing it. Unchanged
// pages answer with a cheap 304 (Express adds an ETag), and a Publish shows up immediately.
const PUBLIC_CACHE = 'public, max-age=0, must-revalidate'

export const publicIndex = async (req, res) => {
  res.set('Cache-Control', PUBLIC_CACHE)
  res.json({ pages: await pages.liveIndex() })
}

export const publicPage = async (req, res) => {
  const path = normalizePath(String(req.query.path || ''))
  if (path === '/' && !req.query.path) throw new CmsError(422, 'PATH_REQUIRED', 'A path is required')
  const found = await pages.resolveLivePage(path)
  if (!found) throw new CmsError(404, 'NOT_FOUND', 'Page not found')
  res.set('Cache-Control', PUBLIC_CACHE)
  if (found.redirect) return res.json({ redirect: { to: found.redirect.to, status: found.redirect.status } })
  res.json({ page: found.page.toPublicJSON() })
}
