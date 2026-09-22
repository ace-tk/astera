import { extractFaq, extractStatStrip, extractLeadTopics } from '../utils/formationContent.js'

/*
 * Option A "container" editing for Service Article pages: the Admin edits Hero / Intro / Stats /
 * Main content / Topics / Content after topics / FAQ / Content after FAQ as separate fields, but
 * NOTHING new is stored. `disassemble` and `assemble` are exact inverses of each other and of the
 * SAME extractors `ServiceArticleView` already runs (`utils/formationContent.js`) — the database
 * still holds one Markdown `body` string, byte-for-byte the same shape it holds today.
 *
 * Sections outside the editorial system (guides) get no structured containers: `usesTopicsLayout`
 * is the SAME per-slug map `ServiceArticleView` uses (`TOPIC_LAYOUT`), because whether a body
 * happens to LOOK like a topics list is not enough — the real component only renders the Topics
 * block for the specific slugs it is opted into, and disassemble must match that exactly or the
 * container view would show a block the public page never renders.
 */

// The exact slugs `ServiceArticleView` renders a Topics block for, and the layout each one uses.
// Copied verbatim from pages/services/ServiceArticle.jsx — kept in sync by a test that compares
// the two files' source text so the two can never silently drift apart.
export const TOPIC_LAYOUT = {
  'formation-economique-elus-cse': 'explorer',
  'formation-cse-tresorier': 'journey',
  'formation-cssct-roles-missions': 'modules',
  'formation-droit-social-contrat-travail': 'journey',
  'formation-pro-communication': 'journey',
  'communication-cse': 'modules',
  'communication-asc': 'journey',
  'guide-du-comite': 'modules',
  'tarif-redaction-pv-cse': 'modules',
  'delai-redaction-pv-cse': 'journey',
  'pv-cse-code-travail': 'explorer',
}

/** Sections that run the editorial extractors at all (`usesEditorialSystem` in ServiceArticleView). */
export const usesEditorialSystem = (section) => section !== 'guides'

const STAT_LABEL = ['Année de création', 'Délai moyen de livraison', 'Formats de PV au choix', 'Guides juridiques publiés']
const FAQ_MARKER = 'Cliquez sur une question pour afficher la réponse.'
const join = (...parts) => parts.filter((p) => p !== '' && p != null).join('\n\n')

/**
 * Body → containers, for a page whose section runs the editorial system. Mirrors the exact
 * extraction order `ServiceArticleView` uses: FAQ first (over the whole body), then Stats (over
 * what's before the FAQ), then Topics — only for `slug`s in `TOPIC_LAYOUT` — over what's after Stats.
 */
export function disassembleServiceArticle(section, slug, body) {
  if (!usesEditorialSystem(section)) return { kind: 'body', body }

  const faq = extractFaq(body)
  const beforeFaq = faq ? faq.before : body
  const stats = extractStatStrip(beforeFaq)
  const afterStats = stats ? stats.after : beforeFaq
  const layout = TOPIC_LAYOUT[slug]
  const topics = layout ? extractLeadTopics(afterStats) : null

  return {
    kind: 'editorial',
    intro: stats ? stats.before : '',
    stats: stats ? stats.stats : null,
    main: topics ? topics.before : afterStats,
    topics: topics ? topics.topics : null,
    topicsLayout: topics ? layout : null,
    afterTopics: topics ? topics.after : '',
    faq: faq ? faq.items : null,
    afterFaq: faq ? faq.after : '',
  }
}

/**
 * Containers → body. The exact inverse of `disassembleServiceArticle`: reassembling a container
 * set that was not edited reproduces the original body byte-for-byte (verified for every existing
 * page by `serviceArticleContainers.test.js`), and a stat/topic/FAQ block the admin DID edit is
 * written in the same literal format the extractors require, so they find it again unchanged.
 */
export function assembleServiceArticle(containers) {
  if (containers.kind === 'body') return containers.body

  const statsBlock = containers.stats ? join(...containers.stats.flatMap((s) => [s.value, s.label])) : ''
  // Every existing page uses level-3 headings for its topic run (verified across the corpus); the
  // heading level is invisible to the rendered page (FormationTopics draws its own styling, ignoring
  // the source markdown heading level entirely), so a fixed level is exact for every real page today.
  const topicsBlock = containers.topics ? join(...containers.topics.flatMap((t) => [t.icon, `### ${t.title}`])) : ''
  const faqBlock = containers.faq ? join(FAQ_MARKER, join(...containers.faq.flatMap((f) => [f.question, f.answer]))) : ''

  const assembled = join(
    containers.intro,
    statsBlock,
    containers.main,
    topicsBlock,
    containers.afterTopics,
    faqBlock,
    containers.afterFaq,
  )
  // Every stored body ends with exactly one trailing newline (the file-save convention every
  // existing page already follows); reproducing it keeps an unedited page byte-for-byte identical.
  return assembled ? `${assembled}\n` : assembled
}

/** The default four company stats, canonical label wording, for a page that has none yet. */
export const DEFAULT_STATS = () => STAT_LABEL.map((label) => ({ value: '', label }))
