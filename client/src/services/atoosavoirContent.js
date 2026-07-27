/**
 * Loads the extracted atoosavoir markdown files (content/atoosavoir/*.md,
 * written by scripts/extract_atoosavoir.py) at build time — same
 * header-parsing convention as services/resourcesContent.js. Used for the
 * CGV page, whose long-form legal body is rendered as-is via
 * MarkdownArticle rather than hand-transcribed into structured blocks.
 */

const files = import.meta.glob('/../content/atoosavoir/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const HEADER_RE = /^# (.+)\n\n- Source URL: (.+)\n- Category: (.+)\n- Breadcrumb: (.+)\n\n([\s\S]*)$/

function slugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/, '')
}

function parse(raw, path) {
  const match = raw.match(HEADER_RE)
  const slug = slugFromPath(path)
  if (!match) return { slug, title: slug, sourceUrl: '', breadcrumb: 'atoosavoir', body: raw }
  const [, title, sourceUrl, , breadcrumb, body] = match
  return { slug, title, sourceUrl, breadcrumb, body }
}

const ATOOSAVOIR_BY_SLUG = new Map(
  Object.entries(files).map(([path, raw]) => {
    const parsed = parse(raw, path)
    return [parsed.slug, parsed]
  }),
)

export function getAtoosavoirPage(slug) {
  return ATOOSAVOIR_BY_SLUG.get(slug)
}
