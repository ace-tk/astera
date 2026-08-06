/**
 * Shared parsing for extracted content/*.md files (the `# Title` /
 * `- Source URL / Category / Breadcrumb` header block written by
 * scripts/extract_resources.py and scripts/extract_services.py), plus the
 * two body-cleanup passes every such file needs before being handed to
 * MarkdownArticle. Used by both resourcesContent.js and servicesContent.js
 * so the two loaders can't drift on how a crawled page gets turned into a
 * render-ready object.
 */

const HEADER_RE = /^# (.+)\n\n- Source URL: (.+)\n- Category: (.+)\n- Breadcrumb: (.+)\n\n([\s\S]*)$/

export function slugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/, '')
}

/**
 * The source page's own <h1> is usually re-emitted as the first heading of
 * the body too (extraction captures the whole article, title and all) --
 * drop it here so the page's own hero doesn't show it twice.
 */
function stripDuplicateLeadingHeading(body, title) {
  const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const lines = body.split('\n')
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    const m = lines[i].match(/^#{1,2}\s+(.+)$/)
    if (m && normalize(m[1]) === normalize(title)) {
      return lines.slice(i + 1).join('\n').replace(/^\n+/, '')
    }
  }
  return body
}

/**
 * Some source pages wrap a whole "card" (icon + heading + body + "Lire →")
 * in a single markdown link whose text spans several blank-line-separated
 * lines -- e.g. `[⚖️\n\n### Title\n\nBody\n\nLire →](/url/)`. That's not
 * valid CommonMark (a link's text can't contain block-level content across
 * blank lines), so react-markdown silently fails to parse it as a link at
 * all: it comes out as a stray "[⚖️" line, an unlinked heading, and a
 * dangling "Lire →](/url/)" fragment. Re-scraping isn't an option here (the
 * task is markdown-only), so this reconstructs the same card as a valid,
 * clickable heading link instead, at render-prep time.
 */
function fixBrokenCardLinks(body) {
  const lines = body.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const openMatch = line.match(/^\[(.*)$/)
    const closesOnSameLine = /\]\([^)]*\)/.test(line)
    if (openMatch && !closesOnSameLine && !line.startsWith('![')) {
      const block = [openMatch[1]]
      let j = i + 1
      let closingUrl = null
      while (j < lines.length && j < i + 12) {
        const closeMatch = lines[j].match(/^(.*)\]\((\/[^\s)]+)\)\s*$/)
        if (closeMatch) {
          if (closeMatch[1]) block.push(closeMatch[1])
          closingUrl = closeMatch[2]
          break
        }
        block.push(lines[j])
        j++
      }
      if (closingUrl) {
        let parts = block.map((l) => l.trim()).filter(Boolean)
        let emoji = ''
        if (parts.length > 1 && !/[a-zA-Z]/.test(parts[0]) && parts[0].length <= 6) {
          ;[emoji, ...parts] = parts
        }
        if (parts.length > 1 && /^(lire|voir|découvrir)\b.*$/i.test(parts[parts.length - 1])) {
          parts = parts.slice(0, -1)
        }
        const title = (parts[0] || '').replace(/^#{1,4}\s*/, '').replace(/^\*\*(.*)\*\*$/, '$1').trim()
        const bodyText = parts.slice(1).join(' ').trim()
        out.push(`### ${emoji ? `${emoji} ` : ''}[${title}](${closingUrl})`.trim())
        out.push('')
        if (bodyText) {
          out.push(bodyText)
          out.push('')
        }
        i = j + 1
        continue
      }
    }
    out.push(line)
    i++
  }
  return out.join('\n')
}

/** Parses one extracted markdown file into a render-ready object. */
export function parseContentFile(raw, path, defaultBreadcrumb) {
  const match = raw.match(HEADER_RE)
  const slug = slugFromPath(path)
  if (!match) {
    return { slug, title: slug, sourceUrl: '', category: '', breadcrumb: defaultBreadcrumb, body: raw }
  }
  const [, title, sourceUrl, category, breadcrumb, rest] = match
  const body = fixBrokenCardLinks(stripDuplicateLeadingHeading(rest, title))
  return { slug, title, sourceUrl, category, breadcrumb, body }
}

/** Plain-text teaser for card grids: first real paragraph of the body,
 * markdown syntax stripped, truncated to length. */
export function excerpt(body, maxLen = 160) {
  const firstParagraph = body
    .split('\n')
    .find((line) => line.trim() && !line.trim().startsWith('#') && !line.trim().startsWith('!') && !line.trim().startsWith('['))
  if (!firstParagraph) return ''
  const plain = firstParagraph
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
  return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain
}
