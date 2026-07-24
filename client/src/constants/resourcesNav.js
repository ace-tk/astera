/**
 * Sidebar nav for the ported Ressources section. Kept to hub-level pages
 * only — mirrors the real atoopv.com nav dropdown, which likewise doesn't
 * list every individual article (those are reached by clicking through a
 * hub page's own body links, exactly as extracted).
 */
export const RESSOURCES_NAV = [
  { label: 'Ressources', to: '/atoopv/ressources', end: true },
  { label: 'Guides juridiques', to: '/atoopv/ressources/guides-livres-blancs-cse' },
  { label: 'Modèles de PV', to: '/atoopv/ressources/modeles-pv' },
  { label: 'Cas pratiques', to: '/atoopv/ressources/cas-pratiques' },
  { label: 'Actualité sociale', to: '/atoopv/ressources/actualite-sociale' },
  { label: 'Jurisprudence sociale', to: '/atoopv/ressources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse' },
  { label: 'Veille juridique CSE', to: '/atoopv/ressources/veille-juridique-cse' },
  { label: 'Lire un arrêt de cassation', to: '/atoopv/ressources/comment-lire-arret-cour-de-cassation' },
  { label: 'La Minute CSE', to: '/atoopv/ressources/la-minute-cse' },
]

export const RESSOURCES_HUB_SLUGS = new Set([
  'guides-livres-blancs-cse',
  'modeles-pv',
  'cas-pratiques',
  'actualite-sociale',
  'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse',
  'comment-lire-arret-cour-de-cassation',
  'la-minute-cse',
])
