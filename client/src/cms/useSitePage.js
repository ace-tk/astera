import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCmsSitePage } from '@/services/cms'
import { CMS_ENABLED } from './config'
import { mergeContent } from './mergeContent'
import { SITE_PAGES } from './sitePageRegistry'

/**
 * A site page's content: the hardcoded content as the base, the published CMS content merged
 * over it — same fallback rule as useHomeHeroCms()/useFooterCms(): no CMS, a page that was
 * never edited, an invalid answer, an unreachable API or a timeout always renders the real
 * default content, never a blank or broken page. (A key that is not a site page — e.g. null — just gives the defaults.) The first render is the defaults; once the
 * CMS answers the page re-renders with the published text.
 */
const NONE = {}

export function useSitePage(key, bundled) {
  // `bundled`: values that live in a bundled markdown file (hub pages, CGV) — see `fileSource` in sitePageRegistry.js.
  const registered = SITE_PAGES[key]?.defaults ?? NONE
  const defaults = useMemo(() => (bundled ? { ...registered, ...bundled } : registered), [registered, bundled])
  const query = useQuery({
    queryKey: ['cms', 'site-page', key],
    queryFn: () => fetchCmsSitePage(key),
    enabled: CMS_ENABLED && Boolean(SITE_PAGES[key]),
    retry: false,
    staleTime: 30_000,
  })
  return useMemo(() => (query.data ? mergeContent(defaults, query.data) : defaults), [defaults, query.data])
}
