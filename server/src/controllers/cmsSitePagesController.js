import { z } from 'zod'
import * as sitePages from '../cms/sitePageService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const body = z.object({ content: z.any(), rev: z.number().optional() })
const parse = (req) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  return parsed.data
}

export const listSitePages = async (req, res) => {
  res.json({ pages: await Promise.all(sitePages.SITE_PAGE_KEYS.map(async (key) => {
    const p = await sitePages.getSitePage(key)
    return { key: p.key, label: p.label, path: p.path, hasUnpublishedChanges: p.hasUnpublishedChanges, edited: p.edited }
  })) })
}

export const getSitePage = async (req, res) => {
  res.json({ sitePage: await sitePages.getSitePage(req.params.key) })
}

export const saveSitePageDraft = async (req, res) => {
  const { content, rev } = parse(req)
  const sitePage = await sitePages.saveSitePageDraft(req.params.key, content, { expectedRev: rev ?? expectedRev(req), userId: req.adminUser._id })
  res.json({ sitePage })
}

export const publishSitePage = async (req, res) => {
  res.json({ sitePage: await sitePages.publishSitePage(req.params.key, req.adminUser._id) })
}

export const discardSitePageDraft = async (req, res) => {
  res.json({ sitePage: await sitePages.discardSitePageDraft(req.params.key, req.adminUser._id) })
}

/** Public: LIVE content only (null when the page was never edited) — draft/rev/admin metadata never leaves this endpoint. */
export const publicSitePage = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json({ content: await sitePages.resolveLiveSitePage(req.params.key) })
}
