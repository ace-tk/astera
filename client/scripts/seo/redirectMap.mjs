/**
 * The SEO redirect map — legacy WordPress-era URLs → current URLs (SEO Remediation Brief v2.1,
 * section 5 and the 12 Oct 2026 Fix Instructions). ONE list, used to generate the server-level
 * 301 rules in `.htaccess` (scripts/seo/htaccess.mjs) and checked by tests and by the local
 * Apache verification report.
 *
 * Old paths are written without a leading or trailing slash; every rule matches the path with
 * OR without its trailing slash. Targets are final paths (no trailing slash), one hop.
 * Order matters only where a more specific row must win over a prefix rule (see PREFIX_REDIRECTS).
 */

const CITIES = ['annecy', 'bordeaux', 'clermont-ferrand', 'grenoble', 'lille', 'lyon', 'marseille', 'nantes', 'paris', 'saint-etienne', 'toulouse']

/** @type {{ from: string[], to: string, note?: string }[]} */
export const REDIRECTS = [
  /* ---- 5.1 Services, pricing, guides, training, communication ---- */
  { from: ['redaction-pv-cse'], to: '/services/drafting/redaction-pv-cse' },
  { from: ['redaction-du-pv'], to: '/services/drafting/redaction-pv-cse' },
  { from: ['audiotypie-pv-cse'], to: '/services/drafting/redaction-pv-cse', note: 'interim — brief 2.5' },
  { from: ['nos-services-pv'], to: '/services/drafting' },
  { from: ['redaction-pv-cssct'], to: '/services/drafting/redaction-pv-cssct' },
  { from: ['externaliser-pv-cse'], to: '/services/drafting/externaliser-pv-cse' },
  { from: ['redaction-pv-csec'], to: '/services/drafting/redaction-pv-csec' },
  { from: ['redaction-pv-irp'], to: '/services/drafting/redaction-pv-irp' },
  { from: ['redaction-pv-cse-a-lacte'], to: '/services/drafting/redaction-pv-cse-a-lacte' },
  { from: ['redaction-a-lacte'], to: '/services/drafting/redaction-pv-cse-a-lacte' },
  { from: ['tarif-redaction-pv-cse'], to: '/tarification' },
  { from: ['simulateur', 'simulateur-de-prix'], to: '/tarification' },
  { from: ['delai-redaction-pv-cse'], to: '/services/tarifs-infos/delai-redaction-pv-cse' },
  { from: ['pv-cse-code-travail'], to: '/services/tarifs-infos/pv-cse-code-travail' },
  { from: ['redacteur-pv-cse'], to: '/services/tarifs-infos/redacteur-pv-cse' },
  { from: ['approbation-pv-cse'], to: '/services/guides/approbation-pv-cse' },
  // The two "délai" pages were merged (client fix list 16 Oct, item 2): the tarifs-infos page is the one kept.
  { from: ['delai-pv-cse', 'services/guides/delai-pv-cse'], to: '/services/tarifs-infos/delai-redaction-pv-cse' },
  { from: ['modele-pv-cse-gratuit'], to: '/services/guides/modele-pv-cse-gratuit' },
  { from: ['reunion-extraordinaire-cse'], to: '/services/guides/reunion-extraordinaire-cse' },
  { from: ['pv-cse-contenu-obligatoire'], to: '/services/guides/pv-cse-contenu-obligatoire' },
  { from: ['contenu-pv-cse'], to: '/services/guides/contenu-pv-cse' },
  { from: ['pv-cse-synthetique-ou-integral'], to: '/services/guides/pv-cse-synthetique-ou-integral' },
  { from: ['proces-verbal-cse'], to: '/services/guides/proces-verbal-cse' },
  { from: ['information-consultation-cse'], to: '/services/guides/information-consultation-cse' },
  { from: ['qui-redige-pv-cse'], to: '/services/guides/qui-redige-pv-cse' },
  { from: ['pv-cse-delit-entrave'], to: '/services/guides/pv-cse-delit-entrave' },
  { from: ['pv-cse-moins-50-salaries'], to: '/services/guides/pv-cse-moins-50-salaries' },
  { from: ['bdese-pv-cse'], to: '/services/guides/bdese-pv-cse' },
  { from: ['formations', 'formations-elus-cse-agree', 'formations-elus-cse-agree-esss'], to: '/services/training' },
  { from: ['formation-cse-tresorier'], to: '/services/training/formation-cse-tresorier' },
  { from: ['formation-droit-social-contrat-travail'], to: '/services/training/formation-droit-social-contrat-travail' },
  { from: ['formation-cssct-roles-missions'], to: '/services/training/formation-cssct-roles-missions' },
  { from: ['formation-economique-elus-cse'], to: '/services/training/formation-economique-elus-cse' },
  { from: ['formation-pro-communication'], to: '/services/training/formation-pro-communication' },
  { from: ['quitus-financier'], to: '/services/training/formation-cse-tresorier', note: 'interim — brief 2.5' },
  { from: ['communication-cse'], to: '/services/communication' },
  { from: ['guide-du-comite'], to: '/services/communication/guide-du-comite' },
  { from: ['newsletter-actucse'], to: '/services/communication/newsletter-actucse' },
  { from: ['communication-asc'], to: '/services/communication/communication-asc' },

  /* ---- 5.2 City pages ---- */
  ...CITIES.map((c) => ({ from: [`redaction-pv-cse-${c}`], to: `/services/by-city/redaction-pv-cse-${c}` })),
  { from: ['redaction-pv-de-cse-a-marseille'], to: '/services/by-city/redaction-pv-cse-marseille' },

  /* ---- 5.3 Resources and legal-watch articles (same slug under /ressources) ---- */
  ...[
    'droit-image-salarie-depart-jurisprudence-cour-cassation',
    'surveillance-salaries-cnil-cse',
    'heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation',
    'mise-a-pied-conservatoire-elu-cse',
    'cas-pratiques',
    'la-minute-cse',
    'comment-lire-arret-cour-de-cassation',
    'actualite-sociale',
    'proces-verbal',
    'droits-elus-cse-guide-juridique',
    'conge-paye-vendredi-37h-decompte-jours-ouvrables',
    'signature-du-proces-verbal-de-reunion-du-cse',
    'heures-supplementaires-conges-payes-calcul',
    'mentions-obligatoires-pv',
    'veille-juridique-cse-8-25-juillet-2026',
    'modele-pv-cse-premium-integral',
    'modeles-pv',
    'arret-maladie-duree-legale-lfss-2026-droits-salarie',
    'reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification',
    'conges-payes-heures-supplementaires-calcul-bulletins-paie',
    'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse',
    'veille-sociale-cse-juin-2026',
    'solde-de-tout-compte-signature',
    'demission-mandat-cse-elu-protection',
    'competences-elu-cse-mandat',
    'tickets-restaurant-teletravail-droit-teletravailleurs',
    'canicule-travail-decret-2025-482-obligations-employeur-cse',
    'histoire-cse-comite-entreprise-cnr-1943',
    'reorganisation-silencieuse-cse-demissions',
    'compteur-cp-arret-maladie-verifications-avant-solder',
    'grossesse-licenciement-nul-protection-salariee-cour-cassation-2026',
    'guides-livres-blancs-cse',
    // the 3 articles imported truncated (brief 2.6) — target is valid once they are republished
    'teletravail-impose-cse-droits-employeur',
    'harcelement-moral-methodes-gestion-cse',
    'commissaire-de-justice-cse-constat-entrave',
  ].map((slug) => ({ from: [slug], to: `/ressources/${slug}` })),
  { from: ['reglement-interieur-fin-depot-greffe'], to: '/ressources/reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification' },
  { from: ['canicule-travail-decret-2025-482'], to: '/ressources/canicule-travail-decret-2025-482-obligations-employeur-cse' },
  { from: ['mise-a-pied-elu-cse'], to: '/ressources/mise-a-pied-conservatoire-elu-cse' },
  { from: ['absenteisme-cse-droit-exiger'], to: '/ressources/actualite-sociale', note: 'interim — brief 2.5' },
  { from: ['le-controle-urssaf-sur-les-comptes-du-cse'], to: '/ressources/actualite-sociale', note: 'interim — brief 2.5' },
  { from: ['actualites'], to: '/ressources/actualite-sociale' },

  /* ---- 5.4 + brief 2.6 + this site's own earlier renames ---- */
  { from: ['autodiagnostic-cse'], to: '/autodiagnostic' },
  { from: ['livres-blancs', 'livre-blanc-reunion-du-cse'], to: '/ressources/guides-livres-blancs-cse' },
  { from: ['services/drafting/services'], to: '/services', note: 'duplicate of /services (brief 2.6)' },
  { from: ['accueil'], to: '/' },
]

/**
 * Prefix rules (anything under the prefix). A more specific row of REDIRECTS above always wins
 * because exact rules are emitted first; `category/veille-juridique-cse` is listed first here
 * so it wins over the generic `category/` prefix.
 */
export const PREFIX_REDIRECTS = [
  { prefix: 'category/veille-juridique-cse', exact: true, to: '/ressources/veille-juridique-cse' },
  { prefix: 'category/', to: '/ressources/actualite-sociale' },
  { prefix: 'tag/', to: '/ressources/actualite-sociale' },
]

/** Every path the site removed for good → HTTP 410 Gone (brief 5.4). Not redirected to the homepage. */
export const GONE = {
  /** exact pages (case-insensitive, with or without trailing slash) */
  exact: ['podcast-videos', 'faq', 'plan-du-site'],
  /** prefixes */
  prefixes: ['author/', 'wp-content/', 'wp-json/', 'wp-admin/', 'wp-includes/'],
}

/** Sample of invented URLs the acceptance report must see answer 404 (never 200). */
export const INVENTED_404 = ['test-404-xyz', 'pas-une-page', 'services/drafting/inexistant-xyz', 'ressources/article-qui-nexiste-pas', 'wp-fake-path-123']
