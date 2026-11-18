import { useEffect, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_URL } from '@/config'
import { getCanonicalOverride, subscribeCanonicalOverride } from './canonicalStore'

function upsertLink(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

function upsertOgUrl(content) {
  let tag = document.querySelector('meta[property="og:url"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', 'og:url')
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * Sets a correct, self-referencing <link rel="canonical"> and og:url on every
 * route change — mounted once (see App.jsx), so every page gets one with no
 * per-page wiring. Query strings and hashes are stripped (a canonical points
 * at the resource, not one particular query variant); a trailing slash is
 * stripped except on the root "/", so "/foo" and "/foo/" don't canonicalize
 * to two different URLs.
 *
 * Production base is SITE_URL (https://atoopv.com) everywhwere — this is the
 * one place that decides it, so no page/component hardcodes a domain.
 */
export function useCanonical() {
  const { pathname } = useLocation()
  // A page may point its canonical at another URL (CMS field "Canonical URL"); see canonicalStore.js.
  const override = useSyncExternalStore(subscribeCanonicalOverride, getCanonicalOverride, () => null)

  useEffect(() => {
    const own = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    const href = `${SITE_URL}${override || own}`
    upsertLink('canonical', href)
    upsertOgUrl(href)
  }, [pathname, override])
}
