/**
 * Sidebar nav for each ported Services category, plus the top-level
 * Services directory (navbar dropdown + Services.jsx card grid). Every
 * label here is either copied verbatim from the live atoopv.com "Services"
 * nav dropdown, or is the extracted page's own <h1> — nothing here is a
 * translation, it's the site's own French.
 */

export const DRAFTING_NAV = [
  { label: 'Rédaction du PV', to: '/services/drafting', end: true },
  { label: 'Rédaction PV CSE', to: '/services/drafting/redaction-pv-cse' },
  { label: 'Rédaction à l’acte', to: '/services/drafting/redaction-pv-cse-a-lacte' },
  { label: 'Rédaction PV CSSCT', to: '/services/drafting/redaction-pv-cssct' },
  { label: 'Rédaction PV IRP', to: '/services/drafting/redaction-pv-irp' },
  { label: 'Rédaction PV CSEC', to: '/services/drafting/redaction-pv-csec' },
  { label: 'Externaliser son PV CSE', to: '/services/drafting/externaliser-pv-cse' },
]

export const BY_CITY_NAV = [
  { label: 'Par ville', to: '/services/by-city', end: true },
  { label: 'PV CSE Grenoble', to: '/services/by-city/redaction-pv-cse-grenoble' },
  { label: 'PV CSE Marseille', to: '/services/by-city/redaction-pv-cse-marseille' },
  { label: 'PV CSE Toulouse', to: '/services/by-city/redaction-pv-cse-toulouse' },
  { label: 'PV CSE Bordeaux', to: '/services/by-city/redaction-pv-cse-bordeaux' },
  { label: 'PV CSE Nantes', to: '/services/by-city/redaction-pv-cse-nantes' },
  { label: 'PV CSE Lille', to: '/services/by-city/redaction-pv-cse-lille' },
  { label: 'PV CSE Saint-Étienne', to: '/services/by-city/redaction-pv-cse-saint-etienne' },
  { label: 'PV CSE Clermont-Ferrand', to: '/services/by-city/redaction-pv-cse-clermont-ferrand' },
  { label: 'Rédaction PV CSE Annecy', to: '/services/by-city/redaction-pv-cse-annecy' },
  { label: 'Rédaction PV CSE Lyon', to: '/services/by-city/redaction-pv-cse-lyon' },
  { label: 'Rédaction PV CSE Paris', to: '/services/by-city/redaction-pv-cse-paris' },
]

export const TARIFS_INFOS_NAV = [
  { label: 'Tarif rédaction PV CSE', to: '/services/tarifs-infos', end: true },
  { label: 'PV CSE et Code du travail', to: '/services/tarifs-infos/pv-cse-code-travail' },
  { label: 'Délai rédaction PV CSE', to: '/services/tarifs-infos/delai-redaction-pv-cse' },
  { label: 'Rédacteur PV CSE', to: '/services/tarifs-infos/redacteur-pv-cse' },
]

export const GUIDES_NAV = [
  { label: 'Guides pratiques', to: '/services/guides', end: true },
  { label: 'Qui rédige le PV CSE ?', to: '/services/guides/qui-redige-pv-cse' },
  { label: 'Approbation du PV CSE', to: '/services/guides/approbation-pv-cse' },
  { label: 'Contenu obligatoire du PV', to: '/services/guides/pv-cse-contenu-obligatoire' },
  { label: 'PV CSE – moins de 50 salariés', to: '/services/guides/pv-cse-moins-50-salaries' },
  { label: 'Modèle PV CSE gratuit', to: '/services/guides/modele-pv-cse-gratuit' },
  { label: 'Guide complet PV de CSE', to: '/services/guides/proces-verbal-cse' },
  { label: 'Délai du PV de CSE', to: '/services/guides/delai-pv-cse' },
  { label: 'Contenu du PV de CSE', to: '/services/guides/contenu-pv-cse' },
  { label: 'PV de CSE et délit d’entrave', to: '/services/guides/pv-cse-delit-entrave' },
  { label: 'BDESE et PV de CSE', to: '/services/guides/bdese-pv-cse' },
  { label: 'Information ou consultation CSE', to: '/services/guides/information-consultation-cse' },
  { label: 'Réunion extraordinaire du CSE', to: '/services/guides/reunion-extraordinaire-cse' },
  { label: 'PV synthétique ou in extenso', to: '/services/guides/pv-cse-synthetique-ou-integral' },
]

export const COMMUNICATION_NAV = [
  { label: 'Communication', to: '/services/communication', end: true },
  { label: 'Newsletter ActuCSE', to: '/services/communication/newsletter-actucse' },
  { label: 'Communication ASC', to: '/services/communication/communication-asc' },
  { label: 'Guide du comité', to: '/services/communication/guide-du-comite' },
]

export const TRAINING_NAV = [
  { label: 'Formations', to: '/services/training', end: true },
  { label: 'Formation économique — 5 jours', to: '/services/training/formation-economique-elus-cse' },
  { label: 'Trésorier du CSE', to: '/services/training/formation-cse-tresorier' },
  { label: 'Rédaction PV CSSCT', to: '/services/training/formation-cssct-roles-missions' },
  { label: 'Formation Communication', to: '/services/training/formation-pro-communication' },
  { label: 'Contrat de travail & Rupture', to: '/services/training/formation-droit-social-contrat-travail' },
]

export const CATEGORY_NAV = {
  drafting: DRAFTING_NAV,
  'by-city': BY_CITY_NAV,
  'tarifs-infos': TARIFS_INFOS_NAV,
  guides: GUIDES_NAV,
  communication: COMMUNICATION_NAV,
  training: TRAINING_NAV,
}

export const CATEGORY_NAV_LABEL = {
  drafting: 'Rédaction PV pages',
  'by-city': 'Par ville pages',
  'tarifs-infos': 'Tarifs & Infos pages',
  guides: 'Guides pratiques pages',
  communication: 'Communication pages',
  training: 'Formations pages',
}

/** Same accent per category everywhere it shows up (hero, sidebar active
 * state, MarkdownArticle links, directory cards) -- carried over from the
 * color each category already had in the old English SERVICE_CATEGORIES. */
export const CATEGORY_COLOR = {
  drafting: 'royal',
  'by-city': 'sky',
  'tarifs-infos': 'golden',
  guides: 'royal',
  communication: 'coral',
  training: 'mint',
}

export const CATEGORY_LABEL = {
  drafting: 'Rédaction PV',
  'by-city': 'Par ville',
  'tarifs-infos': 'Tarifs & Infos',
  guides: 'Guides pratiques',
  communication: 'Communication',
  training: 'Formations',
}
