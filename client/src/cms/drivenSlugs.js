/**
 * The slugs of pages that were migrated into the CMS (Service Article / Ressources Article).
 * Plain data, no `import.meta`, so Node scripts (sitemap generation) can read it as well as the app.
 * See config.js for what being on these lists means for rendering.
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
