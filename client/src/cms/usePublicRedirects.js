import { useQuery } from '@tanstack/react-query'
import { fetchPublicRedirects } from '@/services/cms'
import { CMS_ENABLED } from './config'

/** The CMS's 301 table (old address → new address). Cached for 5 minutes; empty when the CMS is off or unreachable. */
export function usePublicRedirects() {
  return useQuery({
    queryKey: ['cms', 'redirects'],
    queryFn: fetchPublicRedirects,
    enabled: CMS_ENABLED,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

/** The redirect that applies to `pathname`, if any (trailing slash ignored). */
export function redirectFor(redirects, pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return (redirects || []).find((r) => r.from === clean) || null
}
