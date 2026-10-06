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

/**
 * Ressources Article pages that are driven by the CMS — same switch as CMS_DRIVEN_SLUGS above.
 *
 * REPORTED BUG (2026-10-06): edits to Ressources/Blog articles were published in the CMS but never
 * showed on the public site. Two causes, both fixed here and in RessourceArticle.jsx:
 *   1. this set was empty, so these pages never asked the CMS at all;
 *   2. all 34 migrated articles are stored in the CMS under their OLD address
 *      `/atoopv/ressources/<slug>` (the route was later renamed to `/ressources/<slug>`, but the
 *      stored documents were deliberately not rewritten), so even a lookup at the new address 404s.
 * Slugs below are exactly the ressources-article pages published in the live CMS (GET /api/cms/index,
 * 2026-10-06). A newly migrated article still needs adding here by hand.
 */
export const CMS_DRIVEN_RESSOURCES = new Set([
  'actualite-sociale', 'arret-maladie-duree-legale-lfss-2026-droits-salarie',
  'canicule-travail-decret-2025-482-obligations-employeur-cse', 'cas-pratiques',
  'comment-lire-arret-cour-de-cassation', 'commissaire-de-justice-cse-constat-entrave',
  'competences-elu-cse-mandat', 'compteur-cp-arret-maladie-verifications-avant-solder',
  'conge-paye-vendredi-37h-decompte-jours-ouvrables', 'conges-payes-heures-supplementaires-calcul-bulletins-paie',
  'demission-mandat-cse-elu-protection', 'droit-image-salarie-depart-jurisprudence-cour-cassation',
  'droits-elus-cse-guide-juridique', 'grossesse-licenciement-nul-protection-salariee-cour-cassation-2026',
  'harcelement-moral-methodes-gestion-cse', 'heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation',
  'heures-supplementaires-conges-payes-calcul', 'histoire-cse-comite-entreprise-cnr-1943',
  'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse', 'la-minute-cse', 'mentions-obligatoires-pv',
  'mise-a-pied-conservatoire-elu-cse', 'modele-pv-cse-premium-integral', 'modeles-pv', 'proces-verbal',
  'reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification', 'reorganisation-silencieuse-cse-demissions',
  'signature-du-proces-verbal-de-reunion-du-cse', 'solde-de-tout-compte-signature', 'surveillance-salaries-cnil-cse',
  'teletravail-impose-cse-droits-employeur', 'tickets-restaurant-teletravail-droit-teletravailleurs',
  'veille-juridique-cse-8-25-juillet-2026', 'veille-sociale-cse-juin-2026',
])

/** CMS address of a Ressources article: migrated ones live under the legacy `/atoopv/ressources/…` path. */
export const ressourceCmsPath = (slug) =>
  CMS_DRIVEN_RESSOURCES.has(slug) ? `/atoopv/ressources/${slug}` : `/ressources/${slug}`
