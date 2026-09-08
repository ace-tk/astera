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
