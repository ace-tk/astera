import { z } from 'zod'
import * as legalPages from '../cms/legalPagesService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const body = z.object({ content: z.any(), rev: z.number().optional() })
const parse = (req) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  return parsed.data
}

export const getLegalPages = async (req, res) => {
  res.json({ legalPages: (await legalPages.getLegalPages()).toAdminJSON() })
}

export const saveLegalPagesDraft = async (req, res) => {
  const { content, rev } = parse(req)
  const d = await legalPages.saveLegalPagesDraft(content, { expectedRev: rev ?? expectedRev(req), userId: req.adminUser._id })
  res.json({ legalPages: d.toAdminJSON() })
}

export const publishLegalPages = async (req, res) => {
  res.json({ legalPages: (await legalPages.publishLegalPages(req.adminUser._id)).toAdminJSON() })
}

export const discardLegalPagesDraft = async (req, res) => {
  res.json({ legalPages: (await legalPages.discardLegalPagesDraft(req.adminUser._id)).toAdminJSON() })
}

/** Public: LIVE content only — draft/rev/admin metadata never leaves this endpoint. */
export const publicLegalPages = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json({ legalPages: await legalPages.resolveLiveLegalPages() })
}
