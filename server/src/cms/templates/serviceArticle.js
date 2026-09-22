import { z } from 'zod'
import { inlineText, markdownField } from '../schemas.js'
import { MAX_BODY_CHARS } from '../constants.js'
import { excerptOf } from '../excerpt.js'

/**
 * SERVICE ARTICLE — the approved template behind the Procès-verbal, Formations
 * and Guides pages (frontend: pages/services/ServiceArticle.jsx).
 *
 * This file declares only what an admin may EDIT. The design — hero, side nav,
 * rail, numbered headings, stat strip, FAQ accordion, per-section skin — lives
 * entirely in the frontend component and is chosen by `section`, never by
 * content. There is deliberately no field here for layout, colour, spacing,
 * fonts, or extra sections.
 */
// A handful of pages (formation-economique-elus-cse, communication-cse) render a decorative,
// animated "FragmentsToDocument" intro above their hero, fed by a hardcoded JS object
// (client/src/constants/fragmentsIntros.js) that mixes real editorial text with pure animation
// geometry. ONLY the text is admin-editable, as this small fixed shape — every array here is a
// FIXED length matching that component's existing geometry (never admin-addable/removable, so this
// can never misalign with the coordinates that stay hardcoded on the frontend). Optional: absent on
// every other page, and on these two pages until an admin actually edits it — the frontend then
// falls back to the exact current hardcoded text (see client/src/cms/fragmentsIntroContainer.js).
const fragmentsIntroSchema = z
  .object({
    eyebrow: inlineText(120),
    titleLines: z.array(inlineText(60)).length(2),
    fragments: z.array(z.object({ role: inlineText(40), text: inlineText(200), tag: inlineText(40) }).strict()).length(4),
    groups: z.array(z.object({ label: inlineText(60) }).strict()).length(2),
    documentLabel: inlineText(60),
    documentRows: z.array(z.object({ label: inlineText(40), text: inlineText(120) }).strict()).length(4),
    annotations: z.array(inlineText(120)).length(4),
    documentMeta: inlineText(120),
    statement: z.array(inlineText(80)).length(2),
  })
  .strict()

export const serviceArticle = {
  key: 'service-article',
  name: 'Service Article',
  description:
    'A long-form article page with a hero, side navigation and an article body. Used by the Procès-verbal, Formations and Guides sections. The design is fixed; you only edit the content.',
  creatable: true,
  singleton: false,

  // `section` picks the existing visual skin in the frontend (pv / formations / guides).
  sections: [
    { key: 'drafting', label: 'Rédaction PV', menu: 'Procès-verbal', skin: 'pv' },
    { key: 'by-city', label: 'Par ville', menu: 'Procès-verbal', skin: 'pv' },
    { key: 'tarifs-infos', label: 'Tarifs & Infos', menu: 'Procès-verbal', skin: 'pv' },
    { key: 'training', label: 'Formations', menu: 'Formations', skin: 'formations' },
    { key: 'communication', label: 'Communication', menu: 'Formations', skin: 'formations' },
    { key: 'guides', label: 'Guides pratiques', menu: 'Ressources', skin: 'guides' },
  ],

  pathFor: (section, slug) => `/services/${section}/${slug}`,

  // Strict: unknown keys are rejected, so nothing can be smuggled into `content`.
  contentSchema: z
    .object({
      badge: inlineText(120).default('Services'),
      body: markdownField(MAX_BODY_CHARS).default(''),
      fragmentsIntro: fragmentsIntroSchema.optional(),
    })
    .strict(),

  // Every existing Service page shows "Services" in its hero label, so a new page starts with the same.
  defaults: { badge: 'Services', body: '' },
  tagOptions: [],
  excerptOf: (content) => excerptOf(content.body),

  // Rendered by the admin editor. `type` is one of a small closed set the
  // editor knows how to draw — it is not an extension point for new layouts.
  fields: [
    {
      key: 'badge',
      type: 'text',
      label: 'Hero label',
      help: 'The small label shown above the page title. Existing pages use "Services".',
      maxLength: 120,
    },
    {
      key: 'body',
      type: 'richtext',
      label: 'Article body',
      help: 'Use headings, lists, links, bold, italic, underline and quotes. The page design is applied automatically.',
      maxLength: MAX_BODY_CHARS,
    },
  ],
}
