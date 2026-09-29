import { useQuery } from '@tanstack/react-query'
import { fetchCmsFooter } from '@/services/cms'
import { CMS_ENABLED } from './config'
import { DEFAULT_FOOTER_CONTENT } from './footerDefaults'

/**
 * The public footer's content, with the site's real (hardcoded-at-migration-time)
 * content as the fallback — same rule as useNavigation.js: no CMS, an empty
 * answer, an unreachable API, or a timeout must never leave the footer blank or
 * broken. Once the CMS answers with real content, the footer re-renders from it;
 * the component and its markup are unchanged either way.
 */
export function useFooterCms() {
  const query = useQuery({
    queryKey: ['cms', 'footer'],
    queryFn: () => fetchCmsFooter(),
    enabled: CMS_ENABLED,
    retry: false,
    staleTime: 30_000,
  })
  const content = query.data && typeof query.data === 'object' ? query.data : DEFAULT_FOOTER_CONTENT
  return { content, isLoading: query.isLoading }
}
