import { Link, useLocation } from 'react-router-dom'

/**
 * Renders a NAV_LINKS entry correctly regardless of href shape.
 *
 * Real routes (`/foo`) always go through React Router's Link. In-page
 * anchors (`#foo`) need different handling depending on where you are:
 * already on the home page, they render as a plain `<a href="#foo">` so
 * useSmoothScroll's global click listener (which matches `a[href^="#"]`)
 * intercepts it and Lenis-scrolls to the section — a React Router Link
 * would instead resolve to `/#foo` and silently do nothing, since a
 * hash-only route change doesn't trigger any scroll on its own. From any
 * other page, it's a Link to `/#foo`: a real navigation home, after which
 * useSmoothScroll's own mount-time hash check scrolls to the section once
 * Landing (and Lenis) are ready.
 */
export default function HashAwareLink({ href, children, ...props }) {
  const { pathname } = useLocation()
  const isHash = href.startsWith('#')

  if (isHash && pathname === '/') {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link to={isHash ? `/${href}` : href} {...props}>
      {children}
    </Link>
  )
}
