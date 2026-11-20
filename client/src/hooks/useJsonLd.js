import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { defaultNodesFor, graphOf } from '@/seo/jsonld'
import { getPageJsonLd, setPageJsonLd, subscribePageJsonLd } from '@/seo/jsonLdStore'

const SCRIPT_ID = 'atoopv-jsonld'

/**
 * A page-specific JSON-LD node list (breadcrumb, article ...). Pass a memoised array; pass null while the data is not ready.
 * Page nodes replace the default node of the same @type (a page's own breadcrumb wins over the route's).
 */
export function useJsonLd(pageNodes) {
  useEffect(() => {
    if (!pageNodes) return undefined
    setPageJsonLd(pageNodes)
    return () => setPageJsonLd(null)
  }, [pageNodes])
}

/** Mounted once (App.jsx, next to useCanonical): writes ONE <script type="application/ld+json"> with an @graph for the current page. */
export function useJsonLdHead() {
  const { pathname } = useLocation()
  const pageNodes = useSyncExternalStore(subscribePageJsonLd, getPageJsonLd, () => null)
  const graph = useMemo(() => {
    const own = (pageNodes || []).filter(Boolean)
    const ownTypes = new Set(own.map((n) => n['@type']))
    const defaults = defaultNodesFor(pathname).filter((n) => n && !ownTypes.has(n['@type']))
    return graphOf([...defaults, ...own])
  }, [pathname, pageNodes])

  useEffect(() => {
    let tag = document.getElementById(SCRIPT_ID)
    if (!graph) {
      tag?.remove()
      return
    }
    if (!tag) {
      tag = document.createElement('script')
      tag.id = SCRIPT_ID
      tag.type = 'application/ld+json'
      document.head.appendChild(tag)
    }
    tag.textContent = JSON.stringify(graph)
  }, [graph])
}
