import { slugify } from '@/utils/slugify'

/**
 * Scans a raw markdown body for its existing `##` (H2) headings — the
 * article's own real section hierarchy — and returns them in document
 * order as `{ id, label }`, using the exact same `slugify` MarkdownArticle
 * uses for its heading ids, so a rail built from this list can jump
 * straight to the matching heading. Purely a read of existing structure:
 * it invents no heading, drops none, and doesn't reorder anything.
 */
export function extractH2Sections(markdown) {
  const items = []
  for (const line of markdown.split('\n')) {
    const m = line.match(/^##\s+(.+)$/)
    if (!m) continue
    const label = m[1].trim().replace(/\*\*?/g, '')
    let id = slugify(label)
    if (items.some((it) => it.id === id)) id = `${id}-2`
    items.push({ id, label })
  }
  return items
}
