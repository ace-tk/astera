import { useEffect } from 'react'

const DEFAULT_TITLE = 'ATOOPV — From conversations to clarity.'

function upsertMeta(selector, create) {
  let tag = document.querySelector(selector)
  if (!tag) {
    tag = create()
    document.head.appendChild(tag)
  }
  return tag
}

function upsertNamed(name, content) {
  const tag = upsertMeta(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('name', name)
    return el
  })
  const previous = tag.getAttribute('content')
  tag.setAttribute('content', content)
  return previous
}

function upsertProperty(property, content) {
  const tag = upsertMeta(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('property', property)
    return el
  })
  const previous = tag.getAttribute('content')
  tag.setAttribute('content', content)
  return previous
}

function removeNamed(name) {
  document.querySelector(`meta[name="${name}"]`)?.remove()
}

const upsertMetaDescription = (content) => upsertNamed('description', content)

/**
 * Sets the document title, meta description, and (additively) Open Graph /
 * Twitter / robots metadata for the current route, restoring the previous
 * values on unmount. No new dependency: this is a small enough surface that
 * react-helmet would be overkill for a client-only SPA that doesn't need SSR
 * head management.
 *
 * `title`/`description` behave exactly as before for every existing caller.
 * New, optional and off-by-default:
 *   - `noindex: true` adds `<meta name="robots" content="noindex, nofollow">`
 *     for pages that must not be indexed (e.g. /login, /register, /forgot).
 *   - `ogTitle`/`ogDescription` default to `title`/`description` and update
 *     og:title/og:description/twitter:title/twitter:description so social
 *     previews match the page instead of the static index.html defaults.
 * The self-referencing canonical URL and og:url are handled separately, once
 * per route, by useCanonical() (src/hooks/useCanonical.js) — every route gets
 * one automatically, with no per-page wiring required.
 */
export function usePageMeta({ title, description, noindex = false, ogTitle, ogDescription }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — ATOOPV` : DEFAULT_TITLE

    let previousDescription
    if (description) previousDescription = upsertMetaDescription(description)

    const finalOgTitle = ogTitle || title
    const finalOgDescription = ogDescription || description
    let previousOgTitle
    let previousOgDescription
    let previousTwitterTitle
    let previousTwitterDescription
    if (finalOgTitle) {
      previousOgTitle = upsertProperty('og:title', finalOgTitle)
      previousTwitterTitle = upsertNamed('twitter:title', finalOgTitle)
    }
    if (finalOgDescription) {
      previousOgDescription = upsertProperty('og:description', finalOgDescription)
      previousTwitterDescription = upsertNamed('twitter:description', finalOgDescription)
    }

    if (noindex) upsertNamed('robots', 'noindex, nofollow')

    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) upsertMetaDescription(previousDescription)
      if (finalOgTitle && previousOgTitle !== undefined) upsertProperty('og:title', previousOgTitle)
      if (finalOgTitle && previousTwitterTitle !== undefined) upsertNamed('twitter:title', previousTwitterTitle)
      if (finalOgDescription && previousOgDescription !== undefined) upsertProperty('og:description', previousOgDescription)
      if (finalOgDescription && previousTwitterDescription !== undefined) upsertNamed('twitter:description', previousTwitterDescription)
      if (noindex) removeNamed('robots')
    }
  }, [title, description, noindex, ogTitle, ogDescription])
}
