/**
 * A one-off parser for content/guides/modele-pv-cse-gratuit.md's specific
 * "info block" — the CTA links, the CSE/CSSCT/... tag list, and the four
 * stat pairs that MarkdownArticle currently renders as a stream of
 * disconnected <p> tags (each blank-line-separated line in the source
 * markdown becomes its own paragraph with generic spacing). No content is
 * changed here — every string is lifted verbatim from the source — this
 * only extracts pieces so ServiceArticle can hand them to components
 * already built for this exact shape (ServiceHero's `primaryCta` /
 * `secondaryCta` / `tags`, and StatsSection) instead of letting them fall
 * through to the generic markdown renderer.
 *
 * Deliberately narrow to this one article: if the source ever changes
 * enough that the expected markers aren't found, `parse()` returns null and
 * the caller falls back to rendering the untouched body exactly as before —
 * never worse than the current behavior.
 */

const BANNER_MARKER = 'RESSOURCE GRATUITE — DEPUIS 2017'
const REST_MARKER = 'VOTRE MODÈLE, EN LIGNE'
const LINK_RE = /^\[(.+?)\]\((.+?)\)$/
const TAG_RE = /^(.+)✦$/

// The exact icon glyphs this page's source markdown uses for its
// "En-tête réglementaire / Approbation / Délibérations / Questions diverses"
// and "Verbatim / Conformité / Temps récupéré / Réunions complexes" groups.
// An allowlist (rather than a generic emoji regex) on purpose: this parser
// is deliberately scoped to this one article's known content, so matching
// the handful of glyphs it actually uses is simpler and more predictable
// than a Unicode emoji pattern, and it fails safe the same way the rest of
// this file does — an unmatched line is just left as ordinary prose.
const KNOWN_ICONS = new Set(['📋', '⚖️', '🗳️', '📅'])
const HEADING_RE = /^(#{2,4})\s+(.+)$/

function slugify(text) {
  let out = ''
  for (const ch of text.normalize('NFD')) {
    const code = ch.codePointAt(0)
    if (code >= 0x300 && code <= 0x36f) continue // combining diacritical mark, drop it
    out += ch
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** True for a bare short-label line like "BESOIN D’UN EXPERT ?" that sits
 * between a paragraph and the next heading in this source's markdown —
 * distinguished from a normal sentence by being fully uppercase. */
function isLabelLine(line) {
  return line !== '' && line === line.toUpperCase() && line !== line.toLowerCase()
}

/**
 * Splits a markdown body into a sequence of render segments: plain prose
 * (rendered exactly as MarkdownArticle already renders everything today)
 * and "icon" sections — the bare-emoji-paragraph immediately followed by a
 * heading that this page's crawled content repeats for its two four-part
 * lists — pulled apart so the page can put the icon and heading on one row
 * instead of two stacked, disconnected blocks. Every character of every
 * heading/paragraph is reused verbatim; this only changes how they're
 * grouped for layout.
 */
export function splitIconSections(body) {
  const lines = body.split('\n')
  const segments = []
  let prose = []

  const flushProse = () => {
    const text = prose.join('\n').trim()
    if (text) segments.push({ type: 'prose', md: text })
    prose = []
  }

  const nextNonBlank = (from) => {
    const offset = lines.slice(from).findIndex((l) => l.trim() !== '')
    return offset === -1 ? null : from + offset
  }

  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    const headingAt = nextNonBlank(i + 1)
    const headingMatch = headingAt !== null && lines[headingAt].match(HEADING_RE)

    if (KNOWN_ICONS.has(trimmed) && headingMatch) {
      flushProse()
      const icon = trimmed
      const heading = headingMatch[2].trim()
      let j = nextNonBlank(headingAt + 1) ?? lines.length
      // Content for this section runs until the next heading, the next
      // icon+heading pair, or a bare label line that precedes one — all
      // three mark the start of the next block, not this one's content.
      while (j < lines.length) {
        const l = lines[j].trim()
        if (HEADING_RE.test(l)) break
        const la = nextNonBlank(j + 1)
        const followsHeading = la !== null && HEADING_RE.test(lines[la])
        if ((KNOWN_ICONS.has(l) || isLabelLine(l)) && followsHeading) break
        j++
      }
      const content = lines.slice(nextNonBlank(headingAt + 1) ?? j, j).join('\n').trim()
      let id = slugify(heading)
      if (segments.some((s) => s.id === id)) id = `${id}-2`
      segments.push({ type: 'icon', icon, heading, id, md: content })
      i = j
      continue
    }

    prose.push(lines[i])
    i++
  }
  flushProse()
  return segments
}

function findLine(lines, text) {
  return lines.findIndex((l) => l.trim() === text)
}

export function parseModelePvGratuitBody(body) {
  const lines = body.split('\n')
  const bannerIdx = findLine(lines, BANNER_MARKER)
  const restIdx = findLine(lines, REST_MARKER)
  const contactIdx = lines.findIndex((l) => l.includes('[contact@atoopv.com]'))
  if (bannerIdx === -1 || restIdx === -1 || restIdx <= bannerIdx || contactIdx === -1 || contactIdx <= restIdx) {
    return null
  }

  const introBody = lines.slice(0, bannerIdx).join('\n').trim()

  // Between the banner and the first CTA link: the H2 + its paragraph.
  const block = lines.slice(bannerIdx + 1, restIdx).map((l) => l.trim())
  const ctaStart = block.findIndex((l) => LINK_RE.test(l))
  const headingBody = block.slice(0, ctaStart === -1 ? block.length : ctaStart).join('\n').trim()

  const rest = block.slice(ctaStart === -1 ? block.length : ctaStart).filter(Boolean)
  const links = []
  let i = 0
  while (i < rest.length && LINK_RE.test(rest[i])) {
    const [, label, href] = rest[i].match(LINK_RE)
    links.push({ label, href })
    i++
  }

  const tagSet = new Set()
  while (i < rest.length && TAG_RE.test(rest[i])) {
    tagSet.add(rest[i].match(TAG_RE)[1])
    i++
  }

  const statValues = rest.slice(i)
  const stats = []
  for (let s = 0; s + 1 < statValues.length; s += 2) {
    stats.push({ value: statValues[s], label: statValues[s + 1] })
  }

  const contactLine = lines[contactIdx].trim()
  const emailMatch = contactLine.match(/\[([^\]]+)\]\(mailto:[^)]+\)/)
  const phoneMatch = contactLine.match(/^([\d\s]+)/)

  const restBody = [...lines.slice(restIdx, contactIdx), ...lines.slice(contactIdx + 1)].join('\n').trim()

  return {
    introBody,
    headingBody,
    primaryCta: links[1] || null, // "Demander un devis"
    secondaryCta: links[0] || null, // "Feuilleter le modèle →"
    tags: [...tagSet],
    stats,
    contact: {
      phone: phoneMatch ? phoneMatch[1].trim() : '',
      email: emailMatch ? emailMatch[1] : '',
      // Whatever text follows the email link on that same line (" · ALC SAS...").
      trailing: contactLine.slice(contactLine.indexOf(emailMatch?.[0] || '') + (emailMatch?.[0]?.length || 0)).replace(/^\s*·\s*/, ''),
    },
    restBody,
  }
}
