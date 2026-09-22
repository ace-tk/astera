import { z } from 'zod'
import { inlineText, markdownField } from '../schemas.js'
import { MAX_BODY_CHARS } from '../constants.js'
import { excerptOf } from '../excerpt.js'

/**
 * RESSOURCES ARTICLE — the approved template behind the Ressources / Blog articles
 * (frontend: pages/ressources/RessourceArticle.jsx): centred hero, editorial grid,
 * numbered sections and a section rail derived from the article's own headings.
 * Like every template, this file only declares what an admin may EDIT.
 */
export const ressourcesArticle = {
  key: 'ressources-article',
  name: 'Ressources Article',
  description:
    'An article page with a centred hero, numbered sections and a "Dans cet article" rail. Used by the Ressources and Blog articles. The design is fixed; you only edit the content.',
  creatable: true,
  singleton: false,

  sections: [{ key: 'ressources', label: 'Ressources', menu: 'Ressources', skin: 'ressources' }],

  pathFor: (section, slug) => `/atoopv/ressources/${slug}`,

  contentSchema: z
    .object({
      badge: inlineText(120).default('Ressources'),
      body: markdownField(MAX_BODY_CHARS).default(''),
    })
    .strict(),

  defaults: { badge: 'Ressources', body: '' },

  // Optional label that puts a page into the "Veille juridique" listing.
  tagOptions: [{ key: 'veille-juridique', label: 'Veille juridique CSE (appears in that listing)' }],
  excerptOf: (content) => excerptOf(content.body),

  fields: [
    { key: 'badge', type: 'text', label: 'Hero label', help: 'The small label shown above the page title (for example "Ressources").', maxLength: 120 },
    { key: 'body', type: 'richtext', label: 'Article body', help: 'Use headings, lists, links, bold, italic, underline and quotes. The page design is applied automatically.', maxLength: MAX_BODY_CHARS },
  ],
}
