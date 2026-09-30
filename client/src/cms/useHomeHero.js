import { useQuery } from '@tanstack/react-query'
import { fetchCmsHomeHero } from '@/services/cms'
import { CMS_ENABLED } from './config'
import { DEFAULT_HOME_HERO_CONTENT } from './homeHeroDefaults'

/**
 * The homepage hero carousel's 3 slide images, with the site's real
 * (hardcoded-at-migration-time) images as the fallback — same rule as
 * useFooter.js/useNavigation.js: no CMS, an invalid answer, an unreachable
 * API, or a timeout must never leave the carousel blank or broken. Once the
 * CMS answers with real content, the carousel re-renders from it; the
 * component and its markup are unchanged either way.
 */
export function useHomeHeroCms() {
  const query = useQuery({
    queryKey: ['cms', 'home-hero'],
    queryFn: () => fetchCmsHomeHero(),
    enabled: CMS_ENABLED,
    retry: false,
    staleTime: 30_000,
  })
  const slides = query.data?.slides
  return { slides: Array.isArray(slides) && slides.length === 3 ? slides : DEFAULT_HOME_HERO_CONTENT.slides }
}
