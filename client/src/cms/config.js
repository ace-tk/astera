/**
 * Which Service Article pages are driven by the CMS.
 *
 * Every other Service Article page still renders from the bundled markdown,
 * exactly as before — this is the per-page migration switch. A page is added
 * here ONLY after it has been imported into the CMS database (see
 * server `npm run cms:import`) and its rendering has been verified.
 *
 * Once a slug is listed here the CMS is its source of truth: if the CMS says
 * there is no live page, the page is treated as unpublished (404) — it does
 * NOT silently resurrect the old bundled copy. The bundled copy is used only
 * when the CMS cannot be reached at all (network error / timeout / 5xx).
 *
 * CLIENT-REPORTED BUG (2026-10-02): this list had drifted badly out of sync
 * with the real CMS — only 'redaction-pv-cssct' was listed, while 41 OTHER
 * pages (checked against GET /api/cms/index on 2026-10-02) had actually been
 * imported and published in the CMS and were silently still serving their
 * stale bundled copy on the public site (any edit made in the admin and
 * published there had zero effect). Repopulated below from that live list —
 * every slug here is a page that genuinely exists, published, in the CMS
 * right now. The failure mode is exactly this: a page gets migrated and
 * published, but nobody remembers this second, separate step, so it silently
 * never goes live. There is no code-level guard against that yet — adding a
 * newly-migrated page here is still a manual step after import.
 */
export const CMS_DRIVEN_SLUGS = new Set([
  // by-city
  'redaction-pv-cse-annecy', 'redaction-pv-cse-bordeaux', 'redaction-pv-cse-clermont-ferrand',
  'redaction-pv-cse-grenoble', 'redaction-pv-cse-lille', 'redaction-pv-cse-lyon',
  'redaction-pv-cse-marseille', 'redaction-pv-cse-nantes', 'redaction-pv-cse-paris',
  'redaction-pv-cse-saint-etienne', 'redaction-pv-cse-toulouse',
  // communication
  'communication-asc', 'guide-du-comite', 'newsletter-actucse',
  // drafting
  'externaliser-pv-cse', 'redaction-pv-cse', 'redaction-pv-cse-a-lacte',
  'redaction-pv-csec', 'redaction-pv-cssct', 'redaction-pv-irp',
  // guides
  'approbation-pv-cse', 'bdese-pv-cse', 'contenu-pv-cse', 'delai-pv-cse',
  'information-consultation-cse', 'modele-pv-cse-gratuit', 'proces-verbal-cse',
  'pv-cse-contenu-obligatoire', 'pv-cse-delit-entrave', 'pv-cse-moins-50-salaries',
  'pv-cse-synthetique-ou-integral', 'qui-redige-pv-cse', 'reunion-extraordinaire-cse',
  // tarifs-infos
  'cgu', 'delai-redaction-pv-cse', 'pv-cse-code-travail', 'redacteur-pv-cse',
  // training
  'formation-cse-tresorier', 'formation-cssct-roles-missions',
  'formation-droit-social-contrat-travail', 'formation-economique-elus-cse',
  'formation-pro-communication',
])

/** Emergency kill switch: build with VITE_CMS_SOURCE=bundled to ignore the CMS entirely. */
export const CMS_ENABLED = import.meta.env.VITE_CMS_SOURCE !== 'bundled'

/** Ressources Article pages that are driven by the CMS (none migrated yet; new CMS pages work without being listed). */
export const CMS_DRIVEN_RESSOURCES = new Set()
