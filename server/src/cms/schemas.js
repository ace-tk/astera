import { z } from 'zod'
import { validateMarkdown } from './markdown.js'
import {
  SLUG_RE, MAX_SLUG_LENGTH, MAX_BODY_CHARS,
  MAX_MENU_GROUPS, MAX_GROUP_ENTRIES, MAX_MENU_MOBILE_ITEMS, MAX_MAIN_MENU_ITEMS, MAX_SECTION_NAV_ENTRIES,
  MENU_VISUALS, MENU_COLORS,
} from './constants.js'

const noNewlines = (s) => !/[\r\n]/.test(s)

/** Short single-line text (titles, labels, badges). */
export const inlineText = (max, min = 0) =>
  z.string().trim().min(min).max(max).refine(noNewlines, 'Must be a single line')

/** Rich-text field: Markdown restricted to the CMS whitelist. */
export const markdownField = (max = MAX_BODY_CHARS) =>
  z
    .string()
    .max(max)
    .superRefine((value, ctx) => {
      const { errors } = validateMarkdown(value)
      for (const e of errors) {
        ctx.addIssue({ code: 'custom', message: e.line ? `Line ${e.line}: ${e.message}` : e.message })
      }
    })

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_SLUG_LENGTH)
  .regex(SLUG_RE, 'Use lowercase letters, numbers and single hyphens only')

export const seoSchema = z
  .object({
    title: inlineText(120).optional().default(''),
    description: inlineText(320).optional().default(''),
    canonicalPath: z.string().trim().max(200).regex(/^(\/[^\s]*)?$/, 'Must start with /').optional().default(''),
    noindex: z.boolean().optional().default(false),
  })
  .strict()

/* --------------------------------- Menus ---------------------------------- */

export const linkSchema = z
  .object({
    type: z.enum(['page', 'route', 'external', 'mailto', 'tel', 'anchor']),
    pageId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
    route: z.string().trim().max(200).optional(),
    url: z.string().trim().max(500).optional(),
    newTab: z.boolean().optional().default(false),
  })
  .strict()
  .superRefine((l, ctx) => {
    const need = (ok, message) => ok || ctx.addIssue({ code: 'custom', message })
    if (l.type === 'page') need(Boolean(l.pageId), 'A page link needs a pageId')
    if (l.type === 'route') need(Boolean(l.route?.startsWith('/')), 'A route link must start with /')
    if (l.type === 'external') need(/^https?:\/\//i.test(l.url || ''), 'An external link must be http(s)')
    if (l.type === 'mailto') need(/^mailto:/i.test(l.url || ''), 'A mailto link must start with mailto:')
    if (l.type === 'tel') need(/^tel:/i.test(l.url || ''), 'A tel link must start with tel:')
    if (l.type === 'anchor') need(/^#\S+/.test(l.url || ''), 'An anchor link must start with #')
  })

/** Menus only ever link inside the site: to a CMS page, or to an existing route. */
const internalLink = linkSchema.refine((l) => l.type === 'page' || l.type === 'route', 'Menu links must point to a page or an existing route')

const ID_RE = /^[a-z0-9][a-z0-9-]{0,59}$/
const idSchema = z.string().trim().regex(ID_RE, 'Ids use lowercase letters, numbers and hyphens')

/** One link in a menu group, mobile list or side navigation. `label` is optional for page
 * links (it then follows the page's own navigation label), required for route links. */
export const navEntrySchema = z
  .object({
    id: idSchema,
    label: inlineText(80).optional().default(''),
    link: internalLink,
    // Exact-match highlighting for a section's landing page (side navigation only).
    end: z.boolean().optional(),
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.link.type === 'route' && !e.label) ctx.addIssue({ code: 'custom', path: ['label'], message: 'A link needs a label' })
  })

const ctaSchema = z
  .object({
    tone: z.enum(['dark', 'light']).default('dark'),
    eyebrow: inlineText(80).optional().default(''),
    title: inlineText(160).optional().default(''),
    buttonLabel: inlineText(60).optional().default(''),
    link: internalLink.optional(),
  })
  .strict()

const menuGroupSchema = z
  .object({
    id: idSchema,
    heading: inlineText(80, 1),
    entries: z.array(navEntrySchema).max(MAX_GROUP_ENTRIES, `A group can have at most ${MAX_GROUP_ENTRIES} links`).default([]),
  })
  .strict()

const menuItemSchema = z
  .object({
    id: idSchema,
    label: inlineText(60, 1),
    enabled: z.boolean().default(true),
    // `mega` opens the existing mega-menu panel; `link` is a plain link with an arrow.
    kind: z.enum(['mega', 'link']).default('link'),
    // Every menu needs somewhere to go (a mega menu's trigger is a link too).
    link: internalLink,
    color: z.enum(MENU_COLORS).optional(),
    visual: z.enum(MENU_VISUALS).optional(),
    groups: z.array(menuGroupSchema).max(MAX_MENU_GROUPS, `A mega menu can have at most ${MAX_MENU_GROUPS} groups`).default([]),
    cta: ctaSchema.optional(),
    cities: z
      .object({ heading: inlineText(80), label: inlineText(300), linkLabel: inlineText(80), link: internalLink.optional() })
      .strict()
      .optional(),
    mobile: z.array(navEntrySchema).max(MAX_MENU_MOBILE_ITEMS).default([]),
  })
  .strict()
  .superRefine((it, ctx) => {
    if (it.kind === 'link') {
      if (it.groups.length) ctx.addIssue({ code: 'custom', path: ['groups'], message: 'A plain link menu cannot have groups' })
    } else if (it.enabled && it.groups.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['groups'], message: 'A mega menu needs at least one group' })
    }
    const gids = new Set()
    it.groups.forEach((g, i) => {
      if (gids.has(g.id)) ctx.addIssue({ code: 'custom', path: ['groups', i, 'id'], message: `Duplicate group id "${g.id}"` })
      gids.add(g.id)
    })
  })

export const menuItemsSchema = z
  .array(menuItemSchema)
  .max(MAX_MAIN_MENU_ITEMS, `A maximum of ${MAX_MAIN_MENU_ITEMS} main menu items is allowed`)
  .superRefine((items, ctx) => {
    const ids = new Set()
    items.forEach((it, i) => {
      if (ids.has(it.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `Duplicate menu item id "${it.id}"` })
      ids.add(it.id)
    })
  })

/** A section's side navigation / previous-next order. */
export const sectionNavEntriesSchema = z
  .array(navEntrySchema)
  .max(MAX_SECTION_NAV_ENTRIES)
  .superRefine((entries, ctx) => {
    const ids = new Set()
    entries.forEach((e, i) => {
      if (ids.has(e.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `Duplicate entry id "${e.id}"` })
      ids.add(e.id)
    })
  })
