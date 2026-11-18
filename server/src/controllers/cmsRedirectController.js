import { z } from 'zod'
import * as redirects from '../cms/redirectService.js'
import { CmsError } from '../cms/errors.js'

const body = z.object({ from: z.string().max(400), to: z.string().max(400) }).strict()

export const publicRedirects = async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60')
  res.json({ redirects: await redirects.publicRedirects() })
}

export const listRedirects = async (req, res) => {
  res.json({ redirects: await redirects.listRedirects({ to: typeof req.query.to === 'string' ? req.query.to : undefined }) })
}

export const createRedirect = async (req, res) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  res.status(201).json({ redirect: await redirects.createRedirect(parsed.data) })
}

export const deleteRedirect = async (req, res) => {
  res.json({ redirect: await redirects.deleteRedirect(req.params.id) })
}
