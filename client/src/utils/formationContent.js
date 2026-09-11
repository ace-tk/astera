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
// The second label has two verbatim variants across the ported pages
// ("Délai moyen de livraison" on Formations/most Procès-verbal pages,
// "Délai de livraison" on a handful of drafting/tarifs-infos pages) — both
// are accepted so this strip still extracts (same number, same meaning)
// instead of silently leaking the raw stat lines into the article body.
const STAT_LABEL_VARIANTS = [
  ['Année de création'],
  ['Délai moyen de livraison', 'Délai de livraison'],
  ['Formats de PV au choix'],
  ['Guides juridiques publiés'],
]

/** A handful of pages (e.g. nos-services-pv.md) run the value straight into
 * the label with no separator on one line ("2017Année de création" instead
 * of "2017" / blank / "Année de création") — still the same two pieces of
 * real text, just concatenated by the original crawl. Matched only when the
 * line ends with one of the known label variants and has a non-empty
 * prefix, so this can't misfire on unrelated text. */
function matchConcatenatedStat(line, variants) {
  for (const label of variants) {
    if (line.endsWith(label) && line.length > label.length) {
      return { value: line.slice(0, line.length - label.length).trim(), label }
    }
  }
  return null
}

export function extractStatStrip(body) {
  const lines = body.split('\n')
  const firstLabelIdx = lines.findIndex((l) => {
    const t = l.trim()
    return STAT_LABEL_VARIANTS[0].includes(t) || matchConcatenatedStat(t, STAT_LABEL_VARIANTS[0])
  })
  if (firstLabelIdx < 0) return null

  let startIdx = firstLabelIdx
  if (STAT_LABEL_VARIANTS[0].includes(lines[firstLabelIdx].trim())) {
    let valueIdx = firstLabelIdx - 1
    while (valueIdx >= 0 && lines[valueIdx].trim() === '') valueIdx--
    if (valueIdx < 0) return null
    startIdx = valueIdx
  }

  let cursor = startIdx
  const stats = []
  for (const variants of STAT_LABEL_VARIANTS) {
    const at = nextNonBlank(lines, cursor)
    if (at === null) return null
    const t = lines[at].trim()

    const concatenated = matchConcatenatedStat(t, variants)
    if (concatenated) {
      stats.push(concatenated)
      cursor = at + 1
      continue
    }

    const labelAt = nextNonBlank(lines, at + 1)
    if (labelAt === null || !variants.includes(lines[labelAt].trim())) return null
    stats.push({ value: t, label: lines[labelAt].trim() })
    cursor = labelAt + 1
  }

  return {
    stats,
    before: lines.slice(0, startIdx).join('\n').trim(),
    after: lines.slice(cursor).join('\n').trim(),
  }
}

// Every Procès-verbal/Formations page repeats the same short list of
// instance-type tags (CSE, CSEC, CSSCT, ...) three times back-to-back right
// after the hero CTAs — the raw text of a CSS marquee loop from the source
// site (three copies so the loop never shows a seam), not three distinct
// pieces of content. Verifying the three runs are identical before using
// just the first is what makes this safe: a page whose text doesn't repeat
// exactly returns null and falls back to the untouched render.
export function extractTagMarquee(body) {
  const lines = body.split('\n')
  const firstIdx = lines.findIndex((l) => l.includes('✦'))
  if (firstIdx === -1) return null

  let start = firstIdx
  while (start > 0 && lines[start - 1].trim() !== '') start--

  let end = firstIdx
  while (end < lines.length && lines[end].trim() !== '') end++

  const tokens = lines
    .slice(start, end)
    .join('␟')
    .split('✦')
    .map((t) => t.replace(/␟/g, ' ').trim())
    .filter(Boolean)

  if (tokens.length === 0 || tokens.length % 3 !== 0) return null
  const third = tokens.length / 3
  const [g1, g2, g3] = [tokens.slice(0, third), tokens.slice(third, 2 * third), tokens.slice(2 * third)]
  if (JSON.stringify(g1) !== JSON.stringify(g2) || JSON.stringify(g2) !== JSON.stringify(g3)) return null

  return {
    tags: g1,
    before: lines.slice(0, start).join('\n').trim(),
    after: lines.slice(end).join('\n').trim(),
  }
}

/** A bare digit line ("1"), then an H3 heading, then its body paragraph —
 * the numbered "process" section several drafting pages repeat (e.g.
 * nos-services-pv.md's "Notre processus", redaction-pv-cssct.md's numbered
 * expertise steps). Only the first such run in the document is considered,
 * and it must count up from 1 with no gaps — so an unrelated digit later in
 * the page (a stat value, a bullet) can never extend or fake a second run.
 * Requires 3+ steps so a single stray digit+heading isn't mistaken for a
 * "journey". Returns null (safe fallback to the untouched render) otherwise. */
export function extractProcessSteps(body) {
  const lines = body.split('\n')

  function matchStepAt(at) {
    if (at === null || !/^\d+$/.test(lines[at].trim())) return null
    const hAt = nextNonBlank(lines, at + 1)
    const hMatch = hAt !== null && lines[hAt].match(/^###\s+(.+)$/)
    if (!hMatch) return null
    const bodyAt = nextNonBlank(lines, hAt + 1)
    if (bodyAt === null || /^#{1,6}\s/.test(lines[bodyAt].trim()) || /^\d+$/.test(lines[bodyAt].trim())) return null
    let bodyEnd = bodyAt
    while (bodyEnd < lines.length && lines[bodyEnd].trim() !== '') bodyEnd++
    return { number: lines[at].trim(), title: hMatch[1].trim(), body: lines.slice(bodyAt, bodyEnd).join(' ').trim(), end: bodyEnd }
  }

  let cursor = 0
  let runStart = null
  const steps = []
  while (cursor < lines.length) {
    const at = nextNonBlank(lines, cursor)
    if (at === null) break
    const step = matchStepAt(at)
    if (!step) {
      if (steps.length > 0) break
      cursor = at + 1
      continue
    }
    if (Number(step.number) !== steps.length + 1) {
      if (steps.length > 0) break
      cursor = at + 1
      continue
    }
    if (runStart === null) runStart = at
    steps.push(step)
    cursor = step.end
  }

  if (steps.length < 3) return null

  return {
    steps,
    before: lines.slice(0, runStart).join('\n').trim(),
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
