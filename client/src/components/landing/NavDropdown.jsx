import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import HashAwareLink from '@/components/landing/HashAwareLink'
import EditorialMenuItem from '@/components/landing/EditorialMenuItem'
import { cn } from '@/utils/cn'

/**
 * One row inside a dropdown panel. Items that carry their own `children`
 * (e.g. "Modèles de PV", "Actualité Sociale") open a second flyout panel to
 * the side on hover/focus, mirroring the original ATOOPV nested submenu —
 * the label itself stays a real link (click navigates immediately; hover or
 * focus reveals the flyout first), same grammar as the top-level dropdown.
 *
 * A leaf row (no children) uses EditorialMenuItem — the same dashed-rule +
 * arrow treatment as every other navbar dropdown/mega-menu — via its `href`
 * prop so a same-page `#anchor` (Story's own items) still gets HashAwareLink's
 * Lenis-scroll handling underneath.
 */
function DropdownItem({ item, onNavigate }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const triggerRef = useRef(null)
  const { pathname } = useLocation()
  // Escape closes the flyout and moves focus back onto its own trigger —
  // but that trigger sits inside this same onFocus-to-open wrapper, so the
  // programmatic .focus() call would immediately reopen it. This flag tells
  // the very next focus-driven openNow() to no-op instead.
  const suppressFocusOpen = useRef(false)
  const hasChildren = Boolean(item.children?.length)

  if (!hasChildren) {
    // A `#anchor` item (Story's own "How it works"/"Features") has no
    // "current page" to be active for — only a real route (e.g. "Pricing")
    // can match the current pathname.
    const isActive = !item.href.startsWith('#') && pathname === item.href
    return (
      <EditorialMenuItem href={item.href} onClick={onNavigate} active={isActive} dense className="px-3">
        {item.label}
      </EditorialMenuItem>
    )
  }

  const openNow = () => {
    if (suppressFocusOpen.current) {
      suppressFocusOpen.current = false
      return
    }
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  // A short delay absorbs the mouse crossing the gap between the trigger
  // and the flyout panel without needing pixel-geometry hit-testing.
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 100)
  }
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }
  const handleKeyDown = (e) => {
    // Only intercept while this flyout is actually open, and only for that
    // first Escape — otherwise this handler would swallow every Escape
    // press (even once already closed) and the parent NavDropdown could
    // never receive a second Escape to close itself.
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      suppressFocusOpen.current = true
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onFocus={openNow}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <HashAwareLink
        ref={triggerRef}
        href={item.href}
        onClick={onNavigate}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'group/item flex items-center justify-between gap-2 border-b border-dashed border-ink/12 px-3 py-2.5 text-sm leading-snug text-ink/80 transition-colors duration-200 hover:border-royal/40 hover:text-royal',
        )}
      >
        {item.label}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/40 transition-all duration-200 group-hover/item:translate-x-0.5 group-hover/item:text-royal" />
      </HashAwareLink>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute left-full top-0 z-50 ml-1 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-card p-1.5 shadow-float"
          >
            {item.children.map((child) => (
              <EditorialMenuItem
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                active={!child.href.startsWith('#') && pathname === child.href}
                dense
                className="px-3"
              >
                {child.label}
              </EditorialMenuItem>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * A navbar link that also reveals a dropdown of sub-links on hover — same
 * rounded-2xl / border-ink/10 / bg-card / shadow-float / spring-transition
 * grammar as UserMenu's account dropdown, so it reads as the same family of
 * component rather than a one-off. The label itself is a real link (click
 * navigates to `href` immediately; hover reveals the panel first). Items
 * inside the panel can themselves carry `children`, rendered as a nested
 * flyout via DropdownItem above.
 */
export default function NavDropdown({ label, href, items }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  // Same "don't let the trigger's own re-focus reopen the panel" guard as
  // DropdownItem — see its comment for why this is needed.
  const suppressFocusOpen = useRef(false)
  const linkClass =
    'flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'

  const openNow = () => {
    if (suppressFocusOpen.current) {
      suppressFocusOpen.current = false
      return
    }
    setOpen(true)
  }
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false)
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false)
      suppressFocusOpen.current = true
      triggerRef.current?.focus()
    }
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={openNow}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <HashAwareLink ref={triggerRef} href={href} className={cn(linkClass, 'group')} aria-haspopup="true" aria-expanded={open}>
        {/* Same dashed-rule + arrow-nudge trigger language as every other
            navbar dropdown (see Navbar.jsx's own ATOOPV_NAV triggers) — kept
            on this inner span rather than the rounded-full `HashAwareLink`
            itself so the line sits under the label, not the pill's curve. */}
        <span className="flex items-center gap-1 border-b border-dashed border-ink/15 pb-0.5 transition-colors duration-200 group-hover:border-royal/40">
          {label}
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-all duration-200 group-hover:translate-y-0.5', open && 'rotate-180')} />
        </span>
      </HashAwareLink>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-ink/10 bg-card p-1.5 shadow-float"
          >
            {items.map((item) => (
              <DropdownItem key={item.href} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
