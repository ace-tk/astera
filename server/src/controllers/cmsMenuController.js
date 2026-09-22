import { z } from 'zod'
import { MENU_KEYS, MAX_MAIN_MENU_ITEMS } from '../cms/constants.js'
import * as menus from '../cms/menuService.js'
import { CmsError } from '../cms/errors.js'
import { expectedRev } from '../cms/http.js'

const keyOf = (req) => {
  if (!MENU_KEYS.includes(req.params.key)) throw new CmsError(404, 'NOT_FOUND', 'Menu not found')
  return req.params.key
}

const body = z.object({ items: z.array(z.any()), rev: z.number().optional() })

const withCounts = async (menu) => ({ ...menu.toAdminJSON(), placements: await menus.placementCounts(), limit: MAX_MAIN_MENU_ITEMS })

export const getMenu = async (req, res) => {
  res.json({ menu: await withCounts(await menus.getMenu(keyOf(req))) })
}

export const saveMenuDraft = async (req, res) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  const menu = await menus.saveMenuDraft(keyOf(req), parsed.data.items, { expectedRev: expectedRev(req), userId: req.adminUser._id })
  res.json({ menu: await withCounts(menu) })
}

export const initializeMenu = async (req, res) => {
  const parsed = body.safeParse(req.body)
  if (!parsed.success) throw new CmsError(422, 'VALIDATION_FAILED', 'Invalid request', parsed.error.flatten())
  res.json({ menu: await withCounts(await menus.initializeMenu(keyOf(req), parsed.data.items, req.adminUser._id)) })
}

export const publishMenu = async (req, res) => {
  res.json({ menu: await withCounts(await menus.publishMenu(keyOf(req), req.adminUser._id)) })
}

export const discardMenuDraft = async (req, res) => {
  res.json({ menu: await withCounts(await menus.discardMenuDraft(keyOf(req), req.adminUser._id)) })
}

export const publicMenu = async (req, res) => {
  const key = keyOf(req)
  res.set('Cache-Control', 'public, max-age=0, must-revalidate')
  res.json({ menu: await menus.resolveLiveMenu(key) })
}
