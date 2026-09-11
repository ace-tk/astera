// Every Formations page (content/training/*.md, content/communication/*.md)
// repeats the same two shapes MarkdownArticle otherwise renders as a plain
// stream of paragraphs: a short run of icon+heading pairs right after the
// page's intro (its real "program"/"topics" list — no body text under each,
// just an icon and a title), and a "Cliquez sur une question pour afficher
// la réponse." marker followed by alternating question/answer paragraphs
// (an inert FAQ that never got its accordion). Both extractors return the
// surrounding body split into `before`/`after` so the caller can render
// everything else through the normal MarkdownArticle path — nothing here
// changes what any heading or paragraph says, only how the two shapes are
// grouped for layout. Either returns null on any body that doesn't match,
// so a caller can always fall back to rendering the untouched body.

const EMOJI_LINE_RE = /^[\p{Extended_Pictographic}\u{2190}-\u{27BF}️‍\s]{1,10}$/u
const FAQ_MARKER = 'Cliquez sur une question pour afficher la réponse.'

function isEmojiOnlyLine(line) {
  const t = line.trim()
  return t.length > 0 && EMOJI_LINE_RE.test(t)
}

function nextNonBlank(lines, from) {
  const offset = lines.slice(from).findIndex((l) => l.trim() !== '')
  return offset === -1 ? null : from + offset
}

/**
 * The first contiguous run of 2+ icon+heading pairs anywhere in the body —
 * empirically always the page's clean "program" list (a messier, often
 * duplicated second run — inconsistent headings, split heading/body — shows
 * up later and is left to render through the normal path).
 */
export function extractLeadTopics(body) {
  const lines = body.split('\n')
  let i = 0
  while (i < lines.length) {
    const at = nextNonBlank(lines, i)
    if (at === null) return null
    if (isEmojiOnlyLine(lines[at])) {
      const hAt = nextNonBlank(lines, at + 1)
      if (hAt !== null && lines[hAt].match(/^(#{2,4})\s+(.+)$/)) break
    }
    i = at + 1
  }
  if (i >= lines.length) return null

  const runStart = i
  const topics = []
  while (i < lines.length) {
    const at = nextNonBlank(lines, i)
    if (at === null || !isEmojiOnlyLine(lines[at])) break
    const hAt = nextNonBlank(lines, at + 1)
    const hMatch = hAt !== null && lines[hAt].match(/^(#{2,4})\s+(.+)$/)
    if (!hMatch) break
    topics.push({ icon: lines[at].trim(), title: hMatch[2].trim() })
    i = hAt + 1
  }
  if (topics.length < 2) return null

  return {
    topics,
    before: lines.slice(0, runStart).join('\n').trim(),
    after: lines.slice(i).join('\n').trim(),
  }
}

// The same four company stats (2017 / 48 à 72h / 3 / 15) recur, verbatim,
// as eight stacked plain paragraphs on every one of these pages. The four
// label strings are the stable anchor — matched literally because they're
// the real, observed, constant boilerplate on every page, not a guess.
const STAT_LABELS = ['Année de création', 'Délai moyen de livraison', 'Formats de PV au choix', 'Guides juridiques publiés']

export function extractStatStrip(body) {
  const lines = body.split('\n')
  const firstLabelIdx = lines.findIndex((l) => l.trim() === STAT_LABELS[0])
  if (firstLabelIdx <= 0) return null

  let valueIdx = firstLabelIdx - 1
  while (valueIdx >= 0 && lines[valueIdx].trim() === '') valueIdx--
  if (valueIdx < 0) return null
  const startIdx = valueIdx

  let cursor = startIdx
  const stats = []
  for (const label of STAT_LABELS) {
    const at = nextNonBlank(lines, cursor)
    if (at === null) return null
    const value = lines[at].trim()
    const labelAt = nextNonBlank(lines, at + 1)
    if (labelAt === null || lines[labelAt].trim() !== label) return null
    stats.push({ value, label })
    cursor = labelAt + 1
  }

  return {
    stats,
    before: lines.slice(0, startIdx).join('\n').trim(),
    after: lines.slice(cursor).join('\n').trim(),
  }
}

const LINK_RE = /\[(.+?)\]\((.+?)\)/g

/** The first line at or after `markerLine` that contains 2+ markdown
 * links — the training hub's "à la carte" paragraph links to its four
 * individual formation pages inline like this, and this is what
 * FormationIndex builds its rows from (each row's title/excerpt then comes
 * from the linked page's own real content via getServicePage). */
export function extractCarteLinks(body, markerLine) {
  const lines = body.split('\n')
  const idx = lines.findIndex((l) => l.trim() === markerLine)
  if (idx === -1) return []
  for (let i = idx; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(LINK_RE)]
    if (matches.length >= 2) return matches.map((m) => ({ label: m[1], href: m[2] }))
  }
  return []
}

/** Alternating question/answer plain-paragraph pairs after the existing
 * "Cliquez sur une question..." line, stopping at the next heading. */
export function extractFaq(body) {
  const lines = body.split('\n')
  const markerIdx = lines.findIndex((l) => l.trim() === FAQ_MARKER)
  if (markerIdx === -1) return null

  const items = []
  let i = markerIdx + 1
  while (i < lines.length) {
    const qAt = nextNonBlank(lines, i)
    if (qAt === null || /^#{1,4}\s/.test(lines[qAt].trim())) break
    const aAt = nextNonBlank(lines, qAt + 1)
    if (aAt === null || /^#{1,4}\s/.test(lines[aAt].trim())) break
    items.push({ question: lines[qAt].trim(), answer: lines[aAt].trim() })
    i = aAt + 1
  }
  if (items.length < 2) return null

  return {
    items,
    before: lines.slice(0, markerIdx).join('\n').trim(),
    after: lines.slice(i).join('\n').trim(),
  }
}
