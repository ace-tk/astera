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
 */
export const CMS_DRIVEN_SLUGS = new Set(['redaction-pv-cssct'])

/** Emergency kill switch: build with VITE_CMS_SOURCE=bundled to ignore the CMS entirely. */
export const CMS_ENABLED = import.meta.env.VITE_CMS_SOURCE !== 'bundled'

/** Ressources Article pages that are driven by the CMS (none migrated yet; new CMS pages work without being listed). */
export const CMS_DRIVEN_RESSOURCES = new Set()
