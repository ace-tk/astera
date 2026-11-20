/**
 * Loads every extracted markdown file in content/resources/ at build time
 * (Vite's raw glob import — no fetch, no filesystem access at runtime) and
 * parses out the small header block written by scripts/extract_resources.py
 * (`# Title`, then `- Source URL / Category / Breadcrumb`, then the body).
 *
 * This is the single source of truth for the ported Ressources section:
 * nothing here is hand-transcribed, it's the crawled markdown itself.
 */

import { parseContentFile } from '@/utils/contentMarkdown'
import { isMergedAway } from '@/utils/mergedPages'

const files = import.meta.glob('/../content/resources/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const ALL_RESOURCES = Object.entries(files)
  .map(([path, raw]) => parseContentFile(raw, path, 'Ressources'))
  .sort((a, b) => a.title.localeCompare(b.title, 'fr'))

/** Every page that is listed or linked: a page merged into another one (utils/mergedPages) is not. */
export const RESOURCES = ALL_RESOURCES.filter((r) => !isMergedAway(`/ressources/${r.slug}`))

// the lookup keeps the merged pages: a link written with their old slug must still resolve (to the kept page, see resourcesLinks)
export const RESOURCES_BY_SLUG = new Map(ALL_RESOURCES.map((r) => [r.slug, r]))

export function getResource(slug) {
  return RESOURCES_BY_SLUG.get(slug)
}

export { excerpt } from '@/utils/contentMarkdown'

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
  'veille-juridique-cse-8-25-juillet-2026',
]
