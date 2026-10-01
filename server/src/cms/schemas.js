import { z } from 'zod'
import { validateMarkdown } from './markdown.js'
import {
  SLUG_RE, MAX_SLUG_LENGTH, MAX_BODY_CHARS,
  MAX_MENU_GROUPS, MAX_GROUP_ENTRIES, MAX_MENU_MOBILE_ITEMS, MAX_MAIN_MENU_ITEMS, MAX_SECTION_NAV_ENTRIES,
  MENU_VISUALS, MENU_COLORS,
  MAX_FOOTER_COLUMNS, MAX_FOOTER_COLUMN_LINKS, MAX_FOOTER_LEGAL_LINKS, MAX_FOOTER_SOCIAL_LINKS, FOOTER_SOCIAL_ICONS,
  HOME_HERO_SLIDE_COUNT,
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
    // Bare '#' is allowed (not just '#some-id'): the footer's legal links are seeded
    // with it as a real, honest "not linked to a real page yet" placeholder — see
    // footerDefaults.js — and must stay valid so the CMS never has to invent a URL.
    if (l.type === 'anchor') need(/^#/.test(l.url || ''), 'An anchor link must start with #')
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

/* --------------------------------- Footer ---------------------------------- */
// Unlike menu/side-nav links (which only ever point inside the site), footer links
// legitimately need every kind `linkSchema` supports except 'page': routes, mailto,
// tel, and — for the legal links, which have no real pages yet — plain '#' anchors.
// 'page' is excluded because, unlike menuService's resolveLiveMenu, footerService
// does not resolve page references to a live path — allowing it here would let an
// admin save a link the public site could never actually follow. The label is
// always required (footer links never "follow a page title" the way a menu entry can).

const footerLinkSchema = linkSchema.refine((l) => l.type !== 'page', 'A footer link cannot reference a CMS page yet — use a route or address instead')

const footerEntrySchema = z
  .object({ id: idSchema, label: inlineText(80, 1), link: footerLinkSchema })
  .strict()

const footerColumnSchema = z
  .object({
    id: idSchema,
    title: inlineText(60, 1),
    links: z.array(footerEntrySchema).max(MAX_FOOTER_COLUMN_LINKS, `A footer column can have at most ${MAX_FOOTER_COLUMN_LINKS} links`).default([]),
  })
  .strict()

const footerSocialLinkSchema = z
  .object({
    id: idSchema,
    platform: inlineText(40, 1),
    icon: z.enum(FOOTER_SOCIAL_ICONS).default('other'),
    url: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .refine((u) => /^(https?:|mailto:|tel:)/i.test(u), 'Must start with https://, mailto: or tel:'),
    enabled: z.boolean().default(true),
  })
  .strict()

export const footerContentSchema = z
  .object({
    brand: z
      .object({
        tagline: inlineText(160).optional().default(''),
        location: inlineText(160).optional().default(''),
      })
      .strict(),
    contact: z
      .object({
        phoneDisplay: inlineText(40).optional().default(''),
        phoneHref: inlineText(60).optional().default(''),
        email: inlineText(120).optional().default(''),
      })
      .strict(),
    cta: z
      .object({
        label: inlineText(60).optional().default(''),
        link: footerLinkSchema.optional(),
      })
      .strict(),
    columns: z.array(footerColumnSchema).max(MAX_FOOTER_COLUMNS, `The footer can have at most ${MAX_FOOTER_COLUMNS} columns`).default([]),
    legalLinks: z.array(footerEntrySchema).max(MAX_FOOTER_LEGAL_LINKS, `At most ${MAX_FOOTER_LEGAL_LINKS} legal links are allowed`).default([]),
    social: z.array(footerSocialLinkSchema).max(MAX_FOOTER_SOCIAL_LINKS, `At most ${MAX_FOOTER_SOCIAL_LINKS} social links are allowed`).default([]),
    copyrightText: inlineText(200).optional().default(''),
    bottomLine: inlineText(200).optional().default(''),
  })
  .strict()
  .superRefine((f, ctx) => {
    const ids = new Set()
    const checkDup = (id, path) => {
      if (ids.has(id)) ctx.addIssue({ code: 'custom', path, message: `Duplicate id "${id}"` })
      ids.add(id)
    }
    f.columns.forEach((c, ci) => {
      checkDup(c.id, ['columns', ci, 'id'])
      c.links.forEach((l, li) => checkDup(l.id, ['columns', ci, 'links', li, 'id']))
    })
    f.legalLinks.forEach((l, li) => checkDup(l.id, ['legalLinks', li, 'id']))
    f.social.forEach((s, si) => checkDup(s.id, ['social', si, 'id']))
  })

/* --------------------------------- Home hero --------------------------------- */
// One slide's photo: either a Media Library path (`/api/media/<id>/<file>`, picked
// via MediaPicker) or the site's own built-in static asset path (the seeded
// default, e.g. `/homepage-hero/slide-1.webp`) — both are just site-relative paths,
// so the same simple shape covers whichever one is currently in use.
const homeHeroSlideSchema = z
  .object({
    id: idSchema,
    path: z.string().trim().min(1).max(300).regex(/^\//, 'Must be a site-relative path (starting with /)'),
    alt: inlineText(300).optional().default(''),
  })
  .strict()

export const homeHeroContentSchema = z
  .object({
    slides: z.array(homeHeroSlideSchema).length(HOME_HERO_SLIDE_COUNT, `Exactly ${HOME_HERO_SLIDE_COUNT} slides are required — the homepage carousel is built for ${HOME_HERO_SLIDE_COUNT}`),
  })
  .strict()
  .superRefine((h, ctx) => {
    const ids = new Set()
    h.slides.forEach((s, i) => {
      if (ids.has(s.id)) ctx.addIssue({ code: 'custom', path: ['slides', i, 'id'], message: `Duplicate id "${s.id}"` })
      ids.add(s.id)
    })
  })

/* --------------------------------- Legal pages --------------------------------- */
// The 4 footer legal pages (Mentions légales, CGV, Politique de confidentialité,
// Cookies) — a fixed, non-addable/removable set of exactly these 4 keys (the
// routes themselves are code, in App.jsx; only their title/lead/body are
// admin-editable). `body` reuses the same Markdown whitelist as every other
// rich-text field in this file.
const legalPageSchema = z
  .object({
    title: inlineText(120, 1),
    lead: inlineText(300).optional().default(''),
    body: markdownField(MAX_BODY_CHARS),
  })
  .strict()

export const legalPagesContentSchema = z
  .object({
    mentionsLegales: legalPageSchema,
    cgv: legalPageSchema,
    confidentialite: legalPageSchema,
    cookies: legalPageSchema,
  })
  .strict()
