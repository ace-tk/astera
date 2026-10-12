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
export { CMS_DRIVEN_SLUGS } from './drivenSlugs'
import { CMS_DRIVEN_RESSOURCES } from './drivenSlugs'

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
export { CMS_DRIVEN_RESSOURCES }

/** CMS address of a Ressources article: migrated ones live under the legacy `/atoopv/ressources/…` path. */
export const ressourceCmsPath = (slug) =>
  CMS_DRIVEN_RESSOURCES.has(slug) ? `/atoopv/ressources/${slug}` : `/ressources/${slug}`
