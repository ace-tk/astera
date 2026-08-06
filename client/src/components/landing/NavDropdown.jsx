import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import HashAwareLink from '@/components/landing/HashAwareLink'
import { cn } from '@/utils/cn'

const itemClass =
  'block rounded-xl px-3 py-2.5 text-sm leading-snug text-ink/80 transition-colors hover:bg-ink/[0.04] hover:text-ink'

/**
 * One row inside a dropdown panel. Items that carry their own `children`
 * (e.g. "Modèles de PV", "Actualité Sociale") open a second flyout panel to
 * the side on hover/focus, mirroring the original ATOOPV nested submenu —
 * the label itself stays a real link (click navigates immediately; hover or
 * focus reveals the flyout first), same grammar as the top-level dropdown.
 */
function DropdownItem({ item, onNavigate }) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef(null)
  const triggerRef = useRef(null)
  // Escape closes the flyout and moves focus back onto its own trigger —
  // but that trigger sits inside this same onFocus-to-open wrapper, so the
  // programmatic .focus() call would immediately reopen it. This flag tells
  // the very next focus-driven openNow() to no-op instead.
  const suppressFocusOpen = useRef(false)
  const hasChildren = Boolean(item.children?.length)

  if (!hasChildren) {
    return (
      <HashAwareLink href={item.href} onClick={onNavigate} className={itemClass}>
        {item.label}
      </HashAwareLink>
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
        className={cn(itemClass, 'flex items-center justify-between gap-2')}
      >
        {item.label}
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink/40" />
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
              <HashAwareLink key={child.href} href={child.href} onClick={onNavigate} className={itemClass}>
                {child.label}
              </HashAwareLink>
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
      <HashAwareLink ref={triggerRef} href={href} className={linkClass} aria-haspopup="true" aria-expanded={open}>
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
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
