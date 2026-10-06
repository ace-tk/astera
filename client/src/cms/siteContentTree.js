import { LOCKED_KEYS } from './mergeContent'

/** Pure helpers behind the "Site pages" admin form (see pages/admin/cms/AdminCmsSitePagesTab.jsx). */

const WORDS = {
  to: 'Link (page or web address)',
  href: 'Link (page or web address)',
  src: 'Image',
  alt: 'Image description',
  faq: 'FAQ',
  cta: 'Button',
  primaryCta: 'Main button',
  secondaryCta: 'Second button',
  ctaImage: 'Call-to-action image',
  faqSection: 'FAQ heading',
  rate: 'Hourly rate (€ HT)',
  eyebrow: 'Small label above the heading',
  heading: 'Heading',
  lead: 'Intro text',
  micro: 'Small note',
  tagline: 'Tagline',
  note: 'Note',
  badge: 'Badge',
  footer: 'Footer line',
  blocks: 'Content',
  items: 'Items',
  text: 'Text',
  body: 'Text',
  tiers: 'Price tiers',
  placeholder: 'Placeholder (example shown in the empty field)',
  markdown: 'Page text (Markdown — **bold**, *italic*, ## headings, [text](link))',
  validation: 'Form error messages',
  messages: 'Form messages',
}

export const humanize = (key) => {
  if (typeof key === 'number') return String(key + 1)
  if (WORDS[key]) return WORDS[key]
  const spaced = String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export const isEditableKey = (key) => !(typeof key === 'string' && LOCKED_KEYS.has(key))
export const isLeaf = (v) => v === null || typeof v !== 'object'
export const isImageKey = (key) => key === 'src'
export const isLinkKey = (key) => key === 'to' || key === 'href'

/** Immutable set of `value` at `path` (array of keys/indexes) inside `tree`. */
export function setIn(tree, path, value) {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const copy = Array.isArray(tree) ? [...tree] : { ...tree }
  copy[head] = setIn(tree[head], rest, value)
  return copy
}

/** A short title for one list item (FAQ question, tier name, …) so long lists stay scannable. */
export function itemTitle(item, index) {
  if (item && typeof item === 'object') {
    for (const k of ['name', 'title', 'question', 'label', 'heading', 'eyebrow']) {
      if (typeof item[k] === 'string' && item[k]) return `${index + 1}. ${item[k].length > 60 ? `${item[k].slice(0, 57)}…` : item[k]}`
    }
  }
  if (typeof item === 'string') return `${index + 1}`
  return `Item ${index + 1}`
}
