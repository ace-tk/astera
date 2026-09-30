import { z } from 'zod'
import * as homeHero from '../cms/homeHeroService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const body = z.object({ content: z.any(), rev: z.number().optional() })
const parse = (req) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  return parsed.data
}

export const getHomeHero = async (req, res) => {
  res.json({ homeHero: (await homeHero.getHomeHero()).toAdminJSON() })
}

export const saveHomeHeroDraft = async (req, res) => {
  const { content, rev } = parse(req)
  const h = await homeHero.saveHomeHeroDraft(content, { expectedRev: rev ?? expectedRev(req), userId: req.adminUser._id })
  res.json({ homeHero: h.toAdminJSON() })
}

export const publishHomeHero = async (req, res) => {
  res.json({ homeHero: (await homeHero.publishHomeHero(req.adminUser._id)).toAdminJSON() })
}

export const discardHomeHeroDraft = async (req, res) => {
  res.json({ homeHero: (await homeHero.discardHomeHeroDraft(req.adminUser._id)).toAdminJSON() })
}

/** Public: LIVE content only — draft/rev/admin metadata never leaves this endpoint. */
export const publicHomeHero = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json({ homeHero: await homeHero.resolveLiveHomeHero() })
}
