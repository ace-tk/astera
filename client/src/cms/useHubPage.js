import { useMemo } from 'react'
import { SITE_PAGES } from './sitePageRegistry'
import { useSitePage } from './useSitePage'

/**
 * The hub/landing pages (Services, Nos services PV, Communication CSE, Formations élus, Tarifs, Guides &
 * livres blancs) render a bundled markdown file. Their admin text — title, badge and the page text itself
 * (Markdown) — lives in a site page (`hub-<slug>`, Content → Menus → Site pages): this returns the bundled
 * page with whatever the admin published merged over it, in the exact shape the page already renders.
 * No slug / not a hub → the bundled page itself; nothing published → an equal copy of it.
 */
export function useHubPage(slug, bundled) {
  const key = slug && SITE_PAGES[`hub-${slug}`] ? `hub-${slug}` : null
  const base = useMemo(() => (bundled ? { title: bundled.title, badge: bundled.breadcrumb, markdown: bundled.body } : undefined), [bundled])
  const c = useSitePage(key, base)
  return useMemo(() => {
    if (!key || !bundled) return bundled
    return { ...bundled, title: c.title, breadcrumb: c.badge, body: c.markdown, ...(c.fragmentsIntro ? { fragmentsIntro: c.fragmentsIntro } : {}) }
  }, [key, bundled, c])
}
