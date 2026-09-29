import { z } from 'zod'
import * as footer from '../cms/footerService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const body = z.object({ content: z.any(), rev: z.number().optional() })
const parse = (req) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  return parsed.data
}

export const getFooter = async (req, res) => {
  res.json({ footer: (await footer.getFooter()).toAdminJSON() })
}

export const saveFooterDraft = async (req, res) => {
  const { content, rev } = parse(req)
  const f = await footer.saveFooterDraft(content, { expectedRev: rev ?? expectedRev(req), userId: req.adminUser._id })
  res.json({ footer: f.toAdminJSON() })
}

export const publishFooter = async (req, res) => {
  res.json({ footer: (await footer.publishFooter(req.adminUser._id)).toAdminJSON() })
}

export const discardFooterDraft = async (req, res) => {
  res.json({ footer: (await footer.discardFooterDraft(req.adminUser._id)).toAdminJSON() })
}

/** Public: LIVE content only — draft/rev/admin metadata never leaves this endpoint. */
export const publicFooter = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json({ footer: await footer.resolveLiveFooter() })
}
