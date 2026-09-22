import { config } from '@/config'

/**
 * Images from the CMS media library are stored as a path (`/api/media/<id>/<file>`) so they keep
 * working whichever host serves the API. The website may be served from a different host than the
 * API (Vercel → Render), so a media path is pointed at the API's own origin; every other address
 * (e.g. the absolute image URLs existing posts already use) is returned unchanged.
 */
export function resolveMediaUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('/api/media/')) return url
  return `${config.apiUrl.replace(/\/api\/?$/, '')}${url}`
}
