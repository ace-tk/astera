import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL } from '@/config'
import { articleNode, breadcrumbNode, organizationStub, absoluteUrl } from './jsonld'
import { normalizeCanonicalPath } from '@/hooks/canonicalStore'
import { useJsonLd } from '@/hooks/useJsonLd'

/** The image that Open Graph / Twitter use for every page (index.html). Read from the document so the two can never differ. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/atoopv-media/services-hero.jpg`
const ogImage = () => (typeof document !== 'undefined' && document.querySelector('meta[property="og:image"]')?.getAttribute('content')) || DEFAULT_OG_IMAGE

/**
 * The JSON-LD of one content page.
 *   trail    the parents shown in the page's breadcrumb, as { name, path }, WITHOUT the page itself
 *   current  the page's own name (the last item)
 *   article  null, or { headline, description, publishedAt, updatedAt } for an Article page
 *   canonicalPath  the CMS "Canonical URL" of the page, if any (the page's address in the data is then the canonical one)
 */
export function usePageLd({ trail = [], current, article = null, canonicalPath }) {
  const { pathname } = useLocation()
  const own = normalizeCanonicalPath(canonicalPath) || (pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname)
  const key = JSON.stringify([trail, current, article, own])
  const nodes = useMemo(() => {
    if (!current) return null
    const list = [breadcrumbNode([...trail, { name: current, path: own }])]
    if (article?.headline) {
      list.push(articleNode({ ...article, canonicalUrl: absoluteUrl(own), image: ogImage() }))
      list.push(organizationStub())
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useJsonLd(nodes)
}
