import { z } from 'zod'
import * as navs from '../cms/sectionNavService.js'
import { buildNavigation } from '../cms/navigationService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const body = z.object({ entries: z.array(z.any()), rev: z.number().optional() })
const parse = (req) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  return parsed.data
}

export const listSectionNavs = async (req, res) => res.json({ sections: await navs.listSectionNavs() })
export const getSectionNav = async (req, res) => res.json({ nav: (await navs.getSectionNav(req.params.section)).toAdminJSON() })
export const saveDraft = async (req, res) => {
  const nav = await navs.saveSectionNavDraft(req.params.section, parse(req).entries, { expectedRev: expectedRev(req), userId: req.adminUser._id })
  res.json({ nav: nav.toAdminJSON() })
}
export const initialize = async (req, res) => {
  res.json({ nav: (await navs.initializeSectionNav(req.params.section, parse(req).entries, req.adminUser._id)).toAdminJSON() })
}
export const publish = async (req, res) => res.json({ nav: (await navs.publishSectionNav(req.params.section, req.adminUser._id)).toAdminJSON() })
export const discard = async (req, res) => res.json({ nav: (await navs.discardSectionNavDraft(req.params.section, req.adminUser._id)).toAdminJSON() })

/** Public: menu + every side navigation + the light page index, in one request. */
export const publicNavigation = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json(await buildNavigation())
}
