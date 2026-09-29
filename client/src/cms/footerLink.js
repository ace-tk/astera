/**
 * A footer link's `{type, route|url}` shape (server/src/cms/schemas.js's `footerLinkSchema`)
 * resolved to whichever prop the site's link components expect: react-router `to` for
 * an in-site route, a plain `href` for everything else (external/mailto/tel/anchor).
 */
export function resolveFooterLink(link) {
  if (!link) return { href: '#' }
  if (link.type === 'route') return { to: link.route || '/' }
  return { href: link.url || '#' }
}
