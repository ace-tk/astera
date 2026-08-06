/**
 * Loads every extracted markdown file across content/{drafting,by-city,
 * tarifs-infos,guides,communication,training}/ at build time (Vite's raw
 * glob import) and parses out the header block written by
 * scripts/extract_services.py -- same shape and same parsing as
 * resourcesContent.js, see @/utils/contentMarkdown.
 *
 * This is the single source of truth for the ported Services section:
 * nothing here is hand-transcribed, it's the crawled French markdown
 * itself. Each file's own `- Category:` header line says which of the six
 * category folders it lives in, which is also its route segment under
 * /services/<category>/<slug>.
 */
import { parseContentFile, excerpt } from '@/utils/contentMarkdown'

const files = import.meta.glob('/../content/{drafting,by-city,tarifs-infos,guides,communication,training}/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const SERVICE_PAGES = Object.entries(files)
  .map(([path, raw]) => parseContentFile(raw, path, 'Services'))
  .sort((a, b) => a.title.localeCompare(b.title, 'fr'))

export const SERVICE_PAGES_BY_SLUG = new Map(SERVICE_PAGES.map((p) => [p.slug, p]))

export function getServicePage(slug) {
  return SERVICE_PAGES_BY_SLUG.get(slug)
}

export function getServicePagesByCategory(category) {
  return SERVICE_PAGES.filter((p) => p.category === category)
}

/** The one page per category that stands in for that category's own "hub"
 * page on the live site (the group header in the Services nav dropdown).
 * by-city and guides have no such page on the live site -- their nav group
 * headers are same-page anchors, not real URLs -- so those two categories
 * render a synthesized directory (see ServiceCategoryIndex) instead. */
export const CATEGORY_HUB_SLUG = {
  drafting: 'nos-services-pv',
  'tarifs-infos': 'tarif-redaction-pv-cse',
  communication: 'communication-cse',
  training: 'formations-elus-cse-agree',
}

export { excerpt }
