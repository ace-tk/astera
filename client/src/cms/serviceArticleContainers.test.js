import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { parseContentFile } from '@/utils/contentMarkdown'
import { disassembleServiceArticle, assembleServiceArticle, TOPIC_LAYOUT, usesEditorialSystem } from './serviceArticleContainers'

const CONTENT = path.resolve(__dirname, '../../../content')
// Hub pages (index routes with their own quirks — e.g. nos-services-pv concatenates a stat's value
// and label onto one line with no separator, "2017Année de création") are excluded from ALL
// migration batches, not just this one, so they are excluded from the round-trip requirement too —
// verified explicitly below, so an accidental "fix" that makes them pass silently stays visible.
const HUB_SLUGS = new Set(['nos-services-pv', 'tarif-redaction-pv-cse', 'communication-cse', 'formations-elus-cse-agree'])
const ALREADY_MIGRATED = new Set(['redaction-pv-cssct'])

function allPages() {
  const out = []
  for (const cat of ['drafting', 'by-city', 'tarifs-infos', 'training', 'communication', 'guides']) {
    for (const f of fs.readdirSync(path.join(CONTENT, cat)).filter((x) => x.endsWith('.md'))) {
      const slug = f.replace(/\.md$/, '')
      const body = parseContentFile(fs.readFileSync(path.join(CONTENT, cat, f), 'utf8'), f, 'S').body
      out.push({ cat, slug, body, isHub: HUB_SLUGS.has(slug) })
    }
  }
  return out
}

describe('assemble(disassemble(body)) reproduces the ORIGINAL body byte-for-byte, for every remaining page', () => {
  const pages = allPages().filter((p) => !p.isHub)
  it.each(pages.map((p) => [`${p.cat}/${p.slug}`, p]))('%s', (_label, { cat, slug, body }) => {
    const containers = disassembleServiceArticle(cat, slug, body)
    expect(assembleServiceArticle(containers)).toBe(body)
  })

  it('does NOT claim a lossless round trip for a hub page with the concatenated-stat quirk (nos-services-pv) — hubs are out of scope for every batch', () => {
    const body = parseContentFile(fs.readFileSync(path.join(CONTENT, 'drafting', 'nos-services-pv.md'), 'utf8'), 'nos-services-pv.md', 'S').body
    const containers = disassembleServiceArticle('drafting', 'nos-services-pv', body)
    expect(assembleServiceArticle(containers)).not.toBe(body)
  })

  it('confirms the batch actually exercises every container kind (not just plain bodies)', () => {
    const results = pages.map((p) => disassembleServiceArticle(p.cat, p.slug, p.body))
    expect(results.filter((r) => r.kind === 'body').length).toBeGreaterThan(0) // guides
    expect(results.filter((r) => r.stats?.length).length).toBeGreaterThan(0)
    expect(results.filter((r) => r.topics?.length).length).toBeGreaterThan(0)
    expect(results.filter((r) => r.faq?.length).length).toBeGreaterThan(0)
  })
})

describe('disassemble/assemble matches what ServiceArticleView actually renders', () => {
  it('TOPIC_LAYOUT is copied verbatim from pages/services/ServiceArticle.jsx (never drifts)', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../pages/services/ServiceArticle.jsx'), 'utf8')
    const start = src.indexOf('const TOPIC_LAYOUT = {')
    const end = src.indexOf('\n}', start) + 2
    const liveMap = new Function(`${src.slice(start, end)}; return TOPIC_LAYOUT`)()
    expect(TOPIC_LAYOUT).toEqual(liveMap)
  })

  it('guides pages (no editorial system) get a single body container, never split', () => {
    expect(usesEditorialSystem('guides')).toBe(false)
    const c = disassembleServiceArticle('guides', 'approbation-pv-cse', 'Un texte.\n\nCliquez sur une question pour afficher la réponse.\n\nQ ?\n\nR.\n\nQ2 ?\n\nR2.')
    expect(c).toEqual({ kind: 'body', body: 'Un texte.\n\nCliquez sur une question pour afficher la réponse.\n\nQ ?\n\nR.\n\nQ2 ?\n\nR2.' })
  })

  it('a page not in TOPIC_LAYOUT never gets a Topics container, even if its body happens to look like one', () => {
    const body = '2017\n\nAnnée de création\n\n48 à 72h\n\nDélai moyen de livraison\n\n3\n\nFormats de PV au choix\n\n15\n\nGuides juridiques publiés\n\n🧭\n\n## Un\n\n📚\n\n## Deux'
    const c = disassembleServiceArticle('drafting', 'un-slug-hors-liste', body)
    expect(c.topics).toBeNull()
    expect(c.main).toContain('## Un') // rendered as ordinary body, exactly as ServiceArticleView does today
  })
})

describe('editing through the containers, then reassembling, is exact — not just for untouched pages', () => {
  const REAL_INTRO = 'Le procès-verbal n’est pas le résumé d’une réunion : c’est la preuve de ce qui s’y est décidé.'
  const baseline = () => ({
    kind: 'editorial',
    intro: REAL_INTRO,
    stats: [
      { value: '2017', label: 'Année de création' },
      { value: '48 à 72h', label: 'Délai moyen de livraison' },
      { value: '3', label: 'Formats de PV au choix' },
      { value: '15', label: 'Guides juridiques publiés' },
    ],
    main: 'Un PV complet sur une réunion de trois heures.',
    topics: [{ icon: '🧭', title: 'Cadrer chaque réunion' }, { icon: '📚', title: 'Sécuriser le contenu' }],
    topicsLayout: 'journey',
    afterTopics: '',
    faq: null,
    afterFaq: '',
  })

  it('an edited stat value/label round-trips through the exact same extractor the public page uses', () => {
    const edited = { ...baseline(), stats: [{ value: '2018', label: 'Année de création' }, ...baseline().stats.slice(1)] }
    const body = assembleServiceArticle(edited)
    const reread = disassembleServiceArticle('drafting', 'delai-redaction-pv-cse', body) // any TOPIC_LAYOUT slug
    expect(reread.stats).toEqual(edited.stats)
  })

  it('adding an FAQ item where there was none produces markdown the extractor finds again, unchanged', () => {
    const edited = { ...baseline(), faq: [{ question: 'Le PV est-il obligatoire ?', answer: 'Oui, toujours.' }, { question: 'Qui le rédige ?', answer: 'Un tiers neutre.' }] }
    const body = assembleServiceArticle(edited)
    const reread = disassembleServiceArticle('drafting', 'delai-redaction-pv-cse', body)
    expect(reread.faq).toEqual(edited.faq)
  })

  it('reordering topics reorders them in the reassembled markdown, and re-extraction confirms the new order', () => {
    const edited = { ...baseline(), topics: [...baseline().topics].reverse() }
    const body = assembleServiceArticle(edited)
    const reread = disassembleServiceArticle('drafting', 'delai-redaction-pv-cse', body)
    expect(reread.topics.map((t) => t.title)).toEqual(['Sécuriser le contenu', 'Cadrer chaque réunion'])
  })

  it('removing all topics (admin deletes the block) leaves no Topics container, and the page falls back to one continuous body — exactly like a page never in TOPIC_LAYOUT', () => {
    const edited = { ...baseline(), topics: null, topicsLayout: null }
    const body = assembleServiceArticle(edited)
    expect(body).not.toContain('🧭')
    const reread = disassembleServiceArticle('drafting', 'un-slug-not-in-topic-layout', body)
    expect(reread.topics).toBeNull()
  })

  it('editing the intro/main rich text is exact once re-extracted, with no stray blank lines introduced', () => {
    const edited = { ...baseline(), intro: 'Nouveau texte d’introduction.', main: 'Nouveau contenu principal, plus long que le précédent.' }
    const body = assembleServiceArticle(edited)
    const reread = disassembleServiceArticle('drafting', 'delai-redaction-pv-cse', body)
    expect(reread.intro).toBe('Nouveau texte d’introduction.')
    expect(reread.main).toBe('Nouveau contenu principal, plus long que le précédent.')
    expect(reread.stats).toEqual(baseline().stats)
  })

  it('a full round trip (containers → body → containers) is idempotent: doing it twice gives the same body both times', () => {
    const body1 = assembleServiceArticle(baseline())
    const containers2 = disassembleServiceArticle('drafting', 'delai-redaction-pv-cse', body1)
    const body2 = assembleServiceArticle(containers2)
    expect(body2).toBe(body1)
  })
})
