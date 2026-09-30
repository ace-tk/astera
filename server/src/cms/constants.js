// Hard limits for the CMS. Kept in one place so the schema, the Mongoose
// validators and the tests can't drift apart.

/** The main navigation may never have more than this many top-level items. */
export const MAX_MAIN_MENU_ITEMS = 7
// The mega-menu panel is designed for up to three columns (plus its trailing
// CTA / cities column), so groups are capped to match the existing design.
export const MAX_MENU_GROUPS = 3
export const MAX_GROUP_ENTRIES = 12
export const MAX_MENU_MOBILE_ITEMS = 10
export const MAX_SECTION_NAV_ENTRIES = 300

/** The visual motif a mega menu shows in its trailing column (code-defined, see MegaMenuVisual). */
export const MENU_VISUALS = ['pv', 'formations', 'ressources', 'blog']
export const MENU_COLORS = ['royal', 'purple', 'coral', 'golden', 'emerald', 'sky']

export const MENU_KEYS = ['main']

/* --------------------------------- Footer --------------------------------- */
// The footer is a single, always-one-document CMS resource (not keyed like Menu),
// so these are simple ceilings rather than per-key limits.
export const MAX_FOOTER_COLUMNS = 6
export const MAX_FOOTER_COLUMN_LINKS = 10
export const MAX_FOOTER_LEGAL_LINKS = 10
export const MAX_FOOTER_SOCIAL_LINKS = 10
/** Known icon keys the public footer knows how to render; 'other' falls back to a generic link glyph. */
export const FOOTER_SOCIAL_ICONS = ['linkedin', 'instagram', 'facebook', 'twitter', 'youtube', 'other']

/* --------------------------------- Home hero --------------------------------- */
// Also a single, always-one-document CMS resource. The number of slides is
// fixed at 3 — the homepage's carousel (RoadmapCarousel.jsx) is structurally
// built for exactly 3 (same "fixed structure, only content editable"
// philosophy as the main menu) — so this isn't a ceiling, it's exact.
export const HOME_HERO_SLIDE_COUNT = 3

export const PAGE_STATUSES = ['draft', 'published', 'archived']

/** URL segment: lowercase words separated by single hyphens. */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const MAX_SLUG_LENGTH = 100

export const MAX_BODY_CHARS = 300_000

export const MEDIA_MAX_BYTES = 5 * 1024 * 1024
