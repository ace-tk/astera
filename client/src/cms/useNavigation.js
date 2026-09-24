import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNavigation } from '@/services/cms'
import { ATOOPV_NAV } from '@/constants/content'
import { CMS_ENABLED } from './config'
import { fromResolvedMenu, UTILITY_HREFS } from './navConvert'

/*
 * The website's navigation data, with the CMS sitting UNDERNEATH the existing UI.
 *
 * Rules (they keep the site safe and identical while the CMS is being adopted):
 *   • The built-in data (constants/content.js, servicesNav.js, resourcesNav.js) renders
 *     first and is the fallback: no CMS, an empty CMS, an unreachable API, a timeout —
 *     the navigation is never empty and never blocks on the network.
 *   • Once the CMS answers, the same components re-render from CMS data. The components
 *     and their markup are unchanged; only where the data comes from differs.
 *   • Only PUBLISHED pages are ever in that data, so unpublishing a page removes it from
 *     every menu, side navigation, previous/next link and listing at once.
 */

const SNAPSHOT_KEY = 'atoopv:cms-navigation:v1'

const readSnapshot = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SNAPSHOT_KEY) || 'null') || undefined
  } catch {
    return undefined
  }
}
const writeSnapshot = (data) => {
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(data))
  } catch {
    /* private mode / quota — the snapshot is only an optimisation */
  }
}

/** One cached request for menu + side navigation + page index. */
export function useCmsNavigation() {
  return useQuery({
    queryKey: ['cms', 'navigation'],
    queryFn: async () => {
      const data = await fetchNavigation()
      writeSnapshot(data)
      return data
    },
    enabled: CMS_ENABLED,
    retry: false,
    staleTime: 30_000,
    // The last answer paints instantly on a return visit; it is revalidated straight away.
    initialData: readSnapshot,
    initialDataUpdatedAt: 0,
  })
}

const UTILITY_LINKS = ATOOPV_NAV.filter((i) => UTILITY_HREFS.includes(i.href))

/** Pure: the navbar's ATOOPV items for a given CMS answer (the built-in list when there is none). */
export function buildMainNav(data) {
  if (!data?.menu?.configured) return ATOOPV_NAV
  // CMS menus, then any code-level utility link(s), exactly where they are today.
  return [...fromResolvedMenu(data.menu.items), ...UTILITY_LINKS]
}

/** The main menu in the exact shape the navbar renders (ATOOPV_NAV). */
export function useMainNav() {
  const { data } = useCmsNavigation()
  return useMemo(() => buildMainNav(data), [data])
}

/** Pure: a section's side-navigation items from a CMS answer and the built-in list. */
export function mergeSectionNav(section, staticItems) {
  if (!section) return staticItems
  const toItem = (e) => ({ label: e.label, to: e.to, ...(e.end ? { end: true } : {}) })
  if (section.configured) return section.entries.map(toItem)
  const have = new Set(staticItems.map((i) => i.to))
  const extra = section.entries.filter((e) => !have.has(e.to)).map(toItem)
  return extra.length ? [...staticItems, ...extra] : staticItems
}

/**
 * A section's side navigation items [{label, to, end}] — also the order previous/next follows.
 * `staticItems` is the built-in list.
 */
export function useSectionNav(section, staticItems) {
  const { data } = useCmsNavigation()
  return useMemo(() => mergeSectionNav(data?.sections?.[section], staticItems), [data, section, staticItems])
}

/** Published CMS pages of a section (optionally with a label), from the light page index. */
export function useCmsPages({ section, tag } = {}) {
  const { data } = useCmsNavigation()
  return useMemo(
    () => (data?.pages || []).filter((p) => (!section || p.section === section) && (!tag || (p.tags || []).includes(tag))),
    [data, section, tag],
  )
}
