/**
 * Pages that were merged into another page (SEO fix list, item 2). The old address answers a 301 at the
 * server (scripts/seo/redirectMap.mjs); inside the app it must also disappear from every menu, listing and
 * internal link, wherever it comes from — including addresses still stored in the CMS.
 */
export const MERGED_PAGES = {
  '/services/guides/delai-pv-cse': '/services/tarifs-infos/delai-redaction-pv-cse',
}

const strip = (p) => (typeof p === 'string' ? p.replace(/\/$/, '') : p)

/** The address a link should point at (the kept page for a merged one, the address itself otherwise). */
export const finalPath = (p) => MERGED_PAGES[strip(p)] ?? p

export const isMergedAway = (p) => Object.prototype.hasOwnProperty.call(MERGED_PAGES, strip(p))
