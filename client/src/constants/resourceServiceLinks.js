/**
 * Contextual links from each Ressources article to the service page that matches its subject (SEO fix list,
 * item 8): a reader of an article on harassment or CSSCT is offered the CSSCT drafting service and training,
 * a reader of a legal-news piece the legal training, and so on. Addresses are final (no redirect hop).
 */
const S = {
  pv: { label: 'Rédaction de PV de CSE', to: '/services/drafting/redaction-pv-cse' },
  acte: { label: 'Rédaction à l’acte', to: '/services/drafting/redaction-pv-cse-a-lacte' },
  cssct: { label: 'Rédaction de PV de CSSCT', to: '/services/drafting/redaction-pv-cssct' },
  externaliser: { label: 'Externaliser la rédaction de son PV', to: '/services/drafting/externaliser-pv-cse' },
  delai: { label: 'Délai de rédaction du PV de CSE', to: '/services/tarifs-infos/delai-redaction-pv-cse' },
  code: { label: 'Le PV de CSE et le Code du travail', to: '/services/tarifs-infos/pv-cse-code-travail' },
  contenu: { label: 'Contenu obligatoire du PV de CSE', to: '/services/guides/pv-cse-contenu-obligatoire' },
  entrave: { label: 'PV de CSE et délit d’entrave', to: '/services/guides/pv-cse-delit-entrave' },
  droit: { label: 'Formation droit social et contrat de travail', to: '/services/training/formation-droit-social-contrat-travail' },
  tCssct: { label: 'Formation CSSCT : rôles et missions', to: '/services/training/formation-cssct-roles-missions' },
  eco: { label: 'Formation économique des élus du CSE', to: '/services/training/formation-economique-elus-cse' },
  news: { label: 'Newsletter ActuCSE', to: '/services/communication/newsletter-actucse' },
}

const DEFAULT = [S.pv, S.droit]

/** slug → links (2 or 3). Anything not listed gets DEFAULT. */
const BY_SLUG = {
  // le procès-verbal lui-même
  'mentions-obligatoires-pv': [S.contenu, S.pv, S.delai],
  'proces-verbal': [S.pv, S.contenu, S.code],
  'signature-du-proces-verbal-de-reunion-du-cse': [S.pv, S.delai, S.code],
  'modeles-pv': [S.pv, S.acte, S.contenu],
  'modele-pv-cse-premium-integral': [S.pv, S.acte, S.contenu],
  'guides-livres-blancs-cse': [S.pv, S.cssct, S.eco],
  'cas-pratiques': [S.pv, S.droit],
  // entrave, mandat, droits des élus
  'commissaire-de-justice-cse-constat-entrave': [S.entrave, S.pv, S.droit],
  'demission-mandat-cse-elu-protection': [S.entrave, S.pv, S.droit],
  'mise-a-pied-conservatoire-elu-cse': [S.entrave, S.droit, S.pv],
  'droits-elus-cse-guide-juridique': [S.eco, S.droit, S.pv],
  'competences-elu-cse-mandat': [S.eco, S.droit],
  'histoire-cse-comite-entreprise-cnr-1943': [S.eco, S.pv],
  'reorganisation-silencieuse-cse-demissions': [S.pv, S.eco],
  'teletravail-impose-cse-droits-employeur': [S.pv, S.droit],
  'surveillance-salaries-cnil-cse': [S.pv, S.droit],
  // santé, sécurité, harcèlement
  'harcelement-moral-methodes-gestion-cse': [S.cssct, S.tCssct, S.pv],
  'canicule-travail-decret-2025-482-obligations-employeur-cse': [S.cssct, S.tCssct],
  'grossesse-licenciement-nul-protection-salariee-cour-cassation-2026': [S.cssct, S.droit],
  // jurisprudence et veille
  'comment-lire-arret-cour-de-cassation': [S.droit, S.news],
  'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse': [S.droit, S.news, S.pv],
  'actualite-sociale': [S.news, S.droit],
  'veille-juridique-cse': [S.news, S.droit, S.pv],
  'la-minute-cse': [S.news, S.eco],
  'veille-sociale-cse-juin-2026': [S.news, S.droit],
  'veille-juridique-cse-8-25-juillet-2026': [S.news, S.droit],
  // droit du travail (paie, congés, contrat)
  'conges-payes-heures-supplementaires-calcul-bulletins-paie': [S.droit, S.eco],
  'heures-supplementaires-conges-payes-calcul': [S.droit, S.eco],
  'heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation': [S.droit, S.eco],
  'conge-paye-vendredi-37h-decompte-jours-ouvrables': [S.droit, S.eco],
  'compteur-cp-arret-maladie-verifications-avant-solder': [S.droit, S.eco],
  'arret-maladie-duree-legale-lfss-2026-droits-salarie': [S.droit, S.pv],
  'solde-de-tout-compte-signature': [S.droit, S.pv],
  'droit-image-salarie-depart-jurisprudence-cour-cassation': [S.droit, S.pv],
  'reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification': [S.droit, S.pv],
  'tickets-restaurant-teletravail-droit-teletravailleurs': [S.droit, S.eco],
}

export const serviceLinksForResource = (slug) => BY_SLUG[slug] || DEFAULT
