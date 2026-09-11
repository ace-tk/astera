import { slugify } from '@/utils/slugify'

/**
 * Scans a raw markdown body for its existing `##` (H2) headings — the
 * article's own real section hierarchy — and returns them in document
 * order as `{ id, label }`, using the exact same `slugify` MarkdownArticle
 * uses for its heading ids, so a rail built from this list can jump
 * straight to the matching heading. Purely a read of existing structure:
 * it invents no heading, drops none, and doesn't reorder anything.
 *
 * A second heading with the exact same text (several Services/Formations
 * pages repeat their own H2 verbatim near the closing CTA) is skipped
 * rather than kept under a disambiguated id — MarkdownArticle's own heading
 * renderer doesn't dedupe the ids it assigns, so a kept duplicate would
 * point a rail item at an id no element in the page actually has.
 */
export function extractH2Sections(markdown) {
  const items = []
  const seen = new Set()
  for (const line of markdown.split('\n')) {
    const m = line.match(/^##\s+(.+)$/)
    if (!m) continue
    const label = m[1].trim().replace(/\*\*?/g, '')
    const id = slugify(label)
    if (seen.has(id)) continue
    seen.add(id)
    items.push({ id, label })
  }
  return items
}
