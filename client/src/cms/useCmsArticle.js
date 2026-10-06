import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { fetchCmsPage, fetchPagePreview } from '@/services/cms'
import { CMS_ENABLED } from './config'
import { useCmsNavigation } from './useNavigation'

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
 *   • the CMS           — preview, brand-new CMS pages, every page in `drivenSlugs`, AND every page the
 *                         live CMS index says is published (see below)
 *   • bundled markdown  — only what the CMS does not have (no network at all for those)
 *
 * The published-page index (`/cms/navigation`, already fetched on every page for the menus, one cached
 * request) is what keeps this from ever going stale again. Before, "is this page CMS-driven?" was a
 * hand-maintained list; two client-reported bugs (2026-10-02, 2026-10-06) were pages that had been
 * migrated and published in the CMS but nobody had added them to that list, so their edits never showed.
 * Now a page that exists published in the CMS is used automatically; `drivenSlugs` stays only to keep
 * the old rule that an UNPUBLISHED migrated page 404s instead of silently resurrecting its bundled copy.
 *
 * The index entry also supplies the address the page is actually STORED under (`storedPath`) — migrated
 * Ressources articles are still stored at `/atoopv/ressources/<slug>`, not the current `/ressources/<slug>`.
 *
 * Returns { status: 'ready' | 'loading' | 'redirect' | 'missing', page?, redirectTo?, preview? }.
 */
export function useCmsArticle({ path, section, slug, bundled, hub, drivenSlugs, templateKey }) {
  const [search] = useSearchParams()
  const previewId = CMS_ENABLED && !hub ? search.get('preview') : null

  const { data: nav } = useCmsNavigation()
  const published = (nav?.pages || []).find((p) => p.templateKey === templateKey && p.section === section && p.slug === slug)
  const cmsPath = published?.storedPath || published?.path || path

  const useCms = CMS_ENABLED && !hub && Boolean(previewId || !bundled || drivenSlugs.has(slug) || published)

  const query = useQuery({
    queryKey: ['cms', 'article', previewId ? `preview:${previewId}` : 'live', cmsPath],
    queryFn: () => (previewId ? fetchPagePreview(previewId).then((page) => ({ page })) : fetchCmsPage(cmsPath)),
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
