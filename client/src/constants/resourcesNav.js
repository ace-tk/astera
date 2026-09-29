/**
 * Sidebar nav for the ported Ressources section. Kept to hub-level pages
 * only — mirrors the real atoopv.com nav dropdown, which likewise doesn't
 * list every individual article (those are reached by clicking through a
 * hub page's own body links, exactly as extracted).
 */
export const RESSOURCES_NAV = [
  { label: 'Ressources', to: '/ressources', end: true },
  { label: 'Guides juridiques', to: '/ressources/guides-livres-blancs-cse' },
  { label: 'Modèles de PV', to: '/ressources/modeles-pv' },
  { label: 'Cas pratiques', to: '/ressources/cas-pratiques' },
  { label: 'Actualité sociale', to: '/ressources/actualite-sociale' },
  { label: 'Jurisprudence sociale', to: '/ressources/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse' },
  { label: 'Veille juridique CSE', to: '/ressources/veille-juridique-cse' },
  { label: 'Lire un arrêt de cassation', to: '/ressources/comment-lire-arret-cour-de-cassation' },
  { label: 'La Minute CSE', to: '/ressources/la-minute-cse' },
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
