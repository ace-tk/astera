import { useEffect } from 'react'

const DEFAULT_TITLE = 'Astera — From conversations to clarity.'

function upsertMetaDescription(content) {
  let tag = document.querySelector('meta[name="description"]')
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', 'description')
    document.head.appendChild(tag)
  }
  const previous = tag.getAttribute('content')
  tag.setAttribute('content', content)
  return previous
}

/**
 * Sets the document title and meta description for the current route, and
 * restores the previous values on unmount. No new dependency: this is a
 * small enough surface that react-helmet would be overkill for a
 * client-only SPA that doesn't need SSR head management.
 */
export function usePageMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title ? `${title} — Astera` : DEFAULT_TITLE

    let previousDescription
    if (description) previousDescription = upsertMetaDescription(description)

    return () => {
      document.title = previousTitle
      if (description && previousDescription !== undefined) upsertMetaDescription(previousDescription)
    }
  }, [title, description])
}
