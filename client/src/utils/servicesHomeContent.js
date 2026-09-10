/**
 * A one-off parser for content/drafting/services.md (the /services hub
 * page) — same philosophy as utils/modelePvGratuitContent.js: this page's
 * body is a stream of bare-label/emoji/heading/paragraph lines that
 * MarkdownArticle would otherwise render as disconnected stacked blocks
 * (icon alone on its own line, stats each as a full-width paragraph). This
 * only regroups those lines into a structured shape so the page can lay
 * them out properly — every string returned is lifted verbatim from the
 * source. Deliberately narrow to this one file: if its structure ever
 * changes enough that the expected markers aren't found, `parse()` returns
 * null and the caller falls back to rendering the untouched body exactly
 * as before.
 */

const HEADING_RE = /^(#{1,4})\s+(.+)$/
const LINK_RE = /^\[(.+?)\]\((.+?)\)$/
const ALL_LINKS_RE = /\[(.+?)\]\((.+?)\)/g

// The exact icon glyphs this page's source markdown uses across its three
// service groups (Rédaction de PV / Formation & accompagnement / Pourquoi
// AtooPV) — an allowlist for the same reason modelePvGratuitContent.js uses
// one: this parser is scoped to this one page's known content.
const KNOWN_ICONS = new Set(['📋', '🛡️', '⚡', '🏢', '📚', '🤝', '📢', '✅', '⏱️', '🗺️', '💬'])

const GROUP_MARKERS = ['Rédaction de PV', 'Formation & accompagnement', 'Pourquoi AtooPV']
const RESOURCES_MARKER = 'RESSOURCES ET INFORMATIONS'
const CLOSING_MARKER = 'Passons à l’action'

function findLine(lines, text) {
  return lines.findIndex((l) => l.trim() === text)
}

function nextNonBlank(lines, from) {
  const offset = lines.slice(from).findIndex((l) => l.trim() !== '')
  return offset === -1 ? null : from + offset
}

/** Reads one contiguous run of non-blank lines starting at `start`. */
function readBlock(lines, start) {
  if (start === null) return { text: '', next: lines.length }
  let i = start
  const buf = []
  while (i < lines.length && lines[i].trim() !== '') {
    buf.push(lines[i])
    i++
  }
  return { text: buf.join('\n').trim(), next: i }
}

function extractLinks(line) {
  return [...line.matchAll(ALL_LINKS_RE)].map((m) => ({ label: m[1], href: m[2] }))
}

function parseIntro(lines) {
  const eyebrowAt = nextNonBlank(lines, 0)
  const eyebrow = lines[eyebrowAt].trim()

  // The body repeats the page's own <h1> here (with markdown emphasis) —
  // ServiceHero already renders that exact title above, so it's skipped
  // rather than shown twice back to back.
  const headingAt = nextNonBlank(lines, eyebrowAt + 1)

  const paraAt = nextNonBlank(lines, headingAt + 1)
  const { text: paragraph, next: afterPara } = readBlock(lines, paraAt)

  const ctaAt = nextNonBlank(lines, afterPara)
  const ctaBlock = readBlock(lines, ctaAt)
  const ctas = extractLinks(ctaBlock.text)

  let cursor = ctaBlock.next
  const statValues = []
  for (let n = 0; n < 8; n++) {
    const at = nextNonBlank(lines, cursor)
    if (at === null) break
    statValues.push(lines[at].trim())
    cursor = at + 1
  }
  const stats = []
  for (let s = 0; s + 1 < statValues.length; s += 2) stats.push({ value: statValues[s], label: statValues[s + 1] })

  const noteAt = nextNonBlank(lines, cursor)
  const note = noteAt !== null ? lines.slice(noteAt).join('\n').trim() : ''

  return { eyebrow, paragraph, ctas, stats, note }
}

/** Parses the repeating icon + heading + body [+ CTA link] items within one
 * service group's chunk of lines (the group's own label/heading/intro
 * paragraph already stripped off by the caller). */
function parseGroupItems(lines) {
  const items = []
  let i = 0
  while (i < lines.length) {
    const at = nextNonBlank(lines, i)
    if (at === null) break
    const icon = lines[at].trim()
    if (!KNOWN_ICONS.has(icon)) {
      i = at + 1
      continue
    }

    const hAt = nextNonBlank(lines, at + 1)
    const hMatch = hAt !== null && lines[hAt].match(HEADING_RE)
    if (!hMatch) {
      i = at + 1
      continue
    }
    const heading = hMatch[2].trim()

    const bodyAt = nextNonBlank(lines, hAt + 1)
    const { text: body, next: afterBody } = readBlock(lines, bodyAt)

    let cta = null
    let next = afterBody
    const ctaAt = nextNonBlank(lines, afterBody)
    if (ctaAt !== null) {
      const ctaBlock = readBlock(lines, ctaAt)
      const m = ctaBlock.text.match(LINK_RE)
      if (m) {
        cta = { label: m[1], href: m[2] }
        next = ctaBlock.next
      }
    }

    items.push({ icon, heading, body, cta })
    i = next
  }
  return items
}

function parseGroup(label, chunk) {
  const hAt = nextNonBlank(chunk, 0)
  const heading = chunk[hAt].match(HEADING_RE)[2].trim()
  const bodyAt = nextNonBlank(chunk, hAt + 1)

  let j = bodyAt
  while (j < chunk.length && !KNOWN_ICONS.has(chunk[j].trim())) j++
  const body = chunk.slice(bodyAt, j).join('\n').trim()

  const items = parseGroupItems(chunk.slice(j))
  return { label, heading, body, items }
}

function parseClosing(lines) {
  const hAt = nextNonBlank(lines, 0)
  const heading = lines[hAt].match(HEADING_RE)[2].trim()
  const bodyAt = nextNonBlank(lines, hAt + 1)
  const { text: body, next: afterBody } = readBlock(lines, bodyAt)

  const ctaAt = nextNonBlank(lines, afterBody)
  const ctaBlock = readBlock(lines, ctaAt)
  const ctas = extractLinks(ctaBlock.text)

  const contactAt = nextNonBlank(lines, ctaBlock.next)
  const contact = contactAt !== null ? lines.slice(contactAt).join('\n').trim() : ''

  return { eyebrow: CLOSING_MARKER, heading, body, ctas, contact }
}

export function parseServicesHomeBody(fullBody) {
  const lines = fullBody.split('\n')

  const groupStarts = GROUP_MARKERS.map((m) => findLine(lines, m))
  const resourcesIdx = findLine(lines, RESOURCES_MARKER)
  const closingIdx = findLine(lines, CLOSING_MARKER)
  if (groupStarts.some((i) => i === -1) || resourcesIdx === -1 || closingIdx === -1) return null
  if (closingIdx <= resourcesIdx || resourcesIdx <= groupStarts[groupStarts.length - 1]) return null

  const intro = parseIntro(lines.slice(0, groupStarts[0]))

  const boundaries = [...groupStarts, resourcesIdx]
  const groups = GROUP_MARKERS.map((label, idx) => parseGroup(label, lines.slice(groupStarts[idx] + 1, boundaries[idx + 1])))

  const resourcesProse = lines.slice(resourcesIdx, closingIdx).join('\n').trim()
  const closing = parseClosing(lines.slice(closingIdx + 1))

  return { intro, groups, resourcesProse, closing }
}
