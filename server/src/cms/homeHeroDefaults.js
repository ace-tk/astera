/**
 * The homepage hero carousel's real, live slide images as of the Home Hero
 * CMS migration (2026-09-30) — i.e. exactly what
 * `client/src/components/atoopv/RoadmapCarousel.jsx` used to hardcode as
 * `SLIDE_IMAGES`. `homeHeroService.getHomeHero()` seeds a brand-new HomeHero
 * document with this in BOTH `draft` and `live` the first time it is ever
 * read, so the public homepage never shows anything different from what it
 * already shows today, and no separate "import" admin step is needed.
 */
export const DEFAULT_HOME_HERO_CONTENT = {
  slides: [
    { id: 'slide-1', path: '/homepage-hero/slide-1.webp', alt: 'Réunion du CSE autour de la table, procès-verbal en préparation' },
    { id: 'slide-2', path: '/homepage-hero/slide-2.webp', alt: 'Relecture et signature du procès-verbal' },
    { id: 'slide-3', path: '/homepage-hero/slide-3.webp', alt: 'Prise de notes manuscrite pendant la réunion' },
  ],
}
