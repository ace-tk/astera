/**
 * Fallback-only mirror of server/src/cms/homeHeroDefaults.js's
 * DEFAULT_HOME_HERO_CONTENT. Used ONLY when the CMS request fails or times
 * out (see useHomeHero.js) — the homepage hero carousel must never render
 * blank/broken because of a temporary API failure.
 */
export const DEFAULT_HOME_HERO_CONTENT = {
  slides: [
    { id: 'slide-1', path: '/homepage-hero/slide-1.webp', alt: 'Réunion du CSE autour de la table, procès-verbal en préparation' },
    { id: 'slide-2', path: '/homepage-hero/slide-2.webp', alt: 'Relecture et signature du procès-verbal' },
    { id: 'slide-3', path: '/homepage-hero/slide-3.webp', alt: 'Prise de notes manuscrite pendant la réunion' },
  ],
}
