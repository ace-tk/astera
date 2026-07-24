/**
 * Loads every extracted markdown file in content/resources/ at build time
 * (Vite's raw glob import — no fetch, no filesystem access at runtime) and
 * parses out the small header block written by scripts/extract_resources.py
 * (`# Title`, then `- Source URL / Category / Breadcrumb`, then the body).
 *
 * This is the single source of truth for the ported Ressources section:
 * nothing here is hand-transcribed, it's the crawled markdown itself.
 */

const files = import.meta.glob('/../content/resources/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const HEADER_RE = /^# (.+)\n\n- Source URL: (.+)\n- Category: (.+)\n- Breadcrumb: (.+)\n\n([\s\S]*)$/

function slugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/, '')
}

function stripDuplicateLeadingHeading(body, title) {
  const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const lines = body.split('\n')
  // The source page's own <h1> is usually re-emitted as the first heading
  // of the body too (extract_body captures the whole article, title and
  // all) -- drop it here so the page's own hero doesn't show it twice.
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

function parse(raw, path) {
  const match = raw.match(HEADER_RE)
  const slug = slugFromPath(path)
  if (!match) {
    return { slug, title: slug, sourceUrl: '', breadcrumb: 'Ressources', body: raw }
  }
  const [, title, sourceUrl, , breadcrumb, rest] = match
  const body = fixBrokenCardLinks(stripDuplicateLeadingHeading(rest, title))
  return { slug, title, sourceUrl, breadcrumb, body }
}

export const RESOURCES = Object.entries(files)
  .map(([path, raw]) => parse(raw, path))
  .sort((a, b) => a.title.localeCompare(b.title, 'fr'))

export const RESOURCES_BY_SLUG = new Map(RESOURCES.map((r) => [r.slug, r]))

export function getResource(slug) {
  return RESOURCES_BY_SLUG.get(slug)
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

/** Resource pages reachable from the "Veille juridique CSE" category archive
 * (that archive itself wasn't saved as a page -- see extract_resources.py's
 * docstring -- so this in-app hub page is assembled from the individual
 * articles it links to, identified by slug here). */
export const VEILLE_JURIDIQUE_SLUGS = [
  'arret-maladie-duree-legale-lfss-2026-droits-salarie',
  'canicule-travail-decret-2025-482-obligations-employeur-cse',
  'compteur-cp-arret-maladie-verifications-avant-solder',
  'conge-paye-vendredi-37h-decompte-jours-ouvrables',
  'conges-payes-heures-supplementaires-calcul-bulletins-paie',
  'droit-image-salarie-depart-jurisprudence-cour-cassation',
  'grossesse-licenciement-nul-protection-salariee-cour-cassation-2026',
  'heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation',
  'reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification',
  'tickets-restaurant-teletravail-droit-teletravailleurs',
  'veille-sociale-cse-juin-2026',
]
