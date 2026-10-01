import { useQuery } from '@tanstack/react-query'
import { fetchCmsLegalPages } from '@/services/cms'
import { CMS_ENABLED } from './config'
import { DEFAULT_LEGAL_PAGES_CONTENT } from './legalPagesDefaults'

const KEYS = ['mentionsLegales', 'cgv', 'confidentialite', 'cookies']
const isValid = (d) => d && KEYS.every((k) => d[k]?.title && typeof d[k]?.body === 'string')

/**
 * The site's 4 footer legal pages' content, with the real (hardcoded-at-
 * migration-time) text as the fallback — same rule as useHomeHeroCms()/
 * useFooterCms(): no CMS, an invalid answer, an unreachable API, or a
 * timeout must never leave one of these pages blank or broken.
 */
export function useLegalPagesCms() {
  const query = useQuery({
    queryKey: ['cms', 'legal-pages'],
    queryFn: () => fetchCmsLegalPages(),
    enabled: CMS_ENABLED,
    retry: false,
    staleTime: 30_000,
  })
  return isValid(query.data) ? query.data : DEFAULT_LEGAL_PAGES_CONTENT
}
