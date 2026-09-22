import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { fetchCmsPage, fetchPagePreview } from '@/services/cms'
import { CMS_ENABLED } from './config'

/** CMS page -> the exact object shape the bundled markdown loaders produce, so each
 * template's existing rendering code needs no changes. */
function toLegacyPage(cmsPage, category) {
  return {
    slug: cmsPage.slug,
    title: cmsPage.title,
    breadcrumb: cmsPage.content?.badge ?? '',
    body: cmsPage.content?.body ?? '',
    fragmentsIntro: cmsPage.content?.fragmentsIntro,
    category,
    sourceUrl: '',
    seo: cmsPage.seo,
    fromCms: true,
    preview: Boolean(cmsPage.preview),
  }
}

const isNotFound = (err) => err?.status === 404

/**
 * Decides where an article page's content comes from:
 *   • bundled markdown  — every page that has not been migrated (no network at all)
 *   • the CMS           — migrated pages (`drivenSlugs`), brand-new CMS pages, and admin previews
 *
 * Returns { status: 'ready' | 'loading' | 'redirect' | 'missing', page?, redirectTo?, preview? }.
 */
export function useCmsArticle({ path, section, slug, bundled, hub, drivenSlugs }) {
  const [search] = useSearchParams()
  const previewId = CMS_ENABLED && !hub ? search.get('preview') : null

  const useCms = CMS_ENABLED && !hub && Boolean(previewId || !bundled || drivenSlugs.has(slug))

  const query = useQuery({
    queryKey: ['cms', 'article', previewId ? `preview:${previewId}` : 'live', path],
    queryFn: () => (previewId ? fetchPagePreview(previewId).then((page) => ({ page })) : fetchCmsPage(path)),
    enabled: useCms,
    retry: false,
    staleTime: previewId ? 0 : 10_000,
    gcTime: previewId ? 0 : 5 * 60_000,
  })

  if (!useCms) return { status: bundled ? 'ready' : 'missing', page: bundled }
  if (query.isLoading) return { status: 'loading' }

  if (query.data?.redirect) return { status: 'redirect', redirectTo: query.data.redirect.to }
  if (query.data?.page) {
    const page = query.data.page
    // A preview must be for THIS page; anything else falls through to "missing".
    if (previewId && page.section !== section) return { status: 'missing' }
    return { status: 'ready', page: toLegacyPage(page, section), preview: Boolean(previewId) }
  }

  // No data: either "not found / unpublished" (the CMS answered) or a transport failure.
  if (isNotFound(query.error)) return { status: 'missing' }
  return bundled ? { status: 'ready', page: bundled } : { status: 'missing' }
}
