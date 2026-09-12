import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X, ArrowUpRight, ChevronDown, BookOpen } from 'lucide-react'
import { NAV_LINKS, ATOOPV_NAV, MOBILE_HOME_LINK, DEVIS_CTA_HREF } from '@/constants/content'
import Button from '@/components/ui/Button'
import Wordmark from '@/components/common/Wordmark'
import NavDropdown from '@/components/landing/NavDropdown'
import MegaMenuPanel from '@/components/landing/MegaMenuPanel'
import HashAwareLink from '@/components/landing/HashAwareLink'
import EditorialMenuItem from '@/components/landing/EditorialMenuItem'
import { cn } from '@/utils/cn'

const CLOSE_DELAY_MS = 150

/**
 * Reserved placement for a future "Shop Books" entry point — content and
 * final destination to follow later; for now this links to the existing
 * /atoopv/boutique route (the same target ComplianceBooksTeaser's "Découvrir
 * la boutique" button already uses further down the homepage), styled as a
 * compact utility pill matching ThemeSwitcher's visual weight so the two
 * read as one paired control rather than a second primary CTA.
 */
function ShopBooksButton({ className, onClick }) {
  return (
    <Link
      to="/atoopv/boutique"
      onClick={onClick}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-full border border-ink/8 bg-card/50 px-2.5 text-xs font-medium text-ink/70 backdrop-blur-md transition-colors hover:border-ink/20 hover:text-ink',
        className,
      )}
    >
      <BookOpen className="h-3.5 w-3.5 text-muted" />
      Shop Books
    </Link>
  )
}

const triggerClass =
  'flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'
const plainLinkClass = 'rounded-full px-2.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'

/**
 * One row of the mobile nav overlay. The ATOOPV brief caps mobile at two
 * levels (never three) and wants only one accordion open at a time, so this
 * is deliberately flatter than a generic recursive tree: `expandedKey` is a
 * single value (not a set), and a mega item's second level comes from its
 * own short `mobileItems` list rather than walking `mega.columns` (which
 * would be 11-16 leaf links deep — fine for a hover mega-menu, too many for
 * a thumb).
 */
function MobileNavRow({ item, expandedKey, onToggle, onNavigate }) {
  const { pathname } = useLocation()
  const subItems = item.children || item.mobileItems
  const isExpanded = expandedKey === (item.key || item.href)
  const linkClass = 'block flex-1 rounded-2xl px-4 py-3.5 text-lg font-medium hover:bg-ink/[0.04]'

  if (!subItems?.length) {
    return (
      <HashAwareLink href={item.href} onClick={onNavigate} className={cn(linkClass, 'block')}>
        {item.label}
      </HashAwareLink>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <HashAwareLink href={item.href} onClick={onNavigate} className={linkClass}>
          {item.label}
        </HashAwareLink>
        <button
          onClick={() => onToggle(item.key || item.href)}
          aria-label={isExpanded ? `Masquer le sous-menu ${item.label}` : `Afficher le sous-menu ${item.label}`}
          aria-expanded={isExpanded}
          aria-controls={`mobile-sub-${item.key || item.href}`}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full hover:bg-ink/[0.04]"
        >
          <ChevronDown className={cn('h-5 w-5 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`mobile-sub-${item.key || item.href}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pl-4"
          >
            {subItems.map((child) => (
              <EditorialMenuItem
                key={child.href}
                {...(child.href.startsWith('#') ? { href: child.href } : { to: child.href })}
                onClick={onNavigate}
                active={!child.href.startsWith('#') && pathname === child.href}
                className="min-h-[48px] px-1"
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

/** Floating pill navbar that condenses once you scroll past the hero. */
export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)
  const [openMegaKey, setOpenMegaKey] = useState(null)
  const closeTimer = useRef(null)
  const triggerRefs = useRef({})
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  // The ATOOPV homepage ("Accueil") isn't a top-level nav item any more —
  // it's reached via the logo, so the logo needs to know which "home" it's
  // standing in for: the Astera marketing root ("/") everywhere else, or
  // the ported ATOOPV homepage while already inside that section.
  const inAtoopv = location.pathname.startsWith('/atoopv') || location.pathname.startsWith('/services')
  const logoHref = inAtoopv ? '/atoopv' : '/'

  const toggleMobile = (key) => setExpandedKey((prev) => (prev === key ? null : key))

  const openMegaNow = (key) => {
    clearTimeout(closeTimer.current)
    setOpenMegaKey(key)
  }
  const closeMegaSoon = () => {
    closeTimer.current = setTimeout(() => setOpenMegaKey(null), CLOSE_DELAY_MS)
  }
  const closeMegaNow = () => {
    clearTimeout(closeTimer.current)
    setOpenMegaKey(null)
  }
  const cancelMegaClose = () => clearTimeout(closeTimer.current)
  const handleNavKeyDown = (e) => {
    if (e.key === 'Escape' && openMegaKey) {
      e.stopPropagation()
      const key = openMegaKey
      closeMegaNow()
      triggerRefs.current[key]?.focus()
    }
  }

  const openMegaItem = ATOOPV_NAV.find((i) => i.key === openMegaKey)

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
      onKeyDown={handleNavKeyDown}
    >
      <motion.nav
        animate={{
          width: 'min(80rem, 100%)',
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={cn(
          'flex items-center justify-between gap-3 rounded-full border px-4 sm:px-5',
          scrolled
            ? 'border-ink/10 bg-card/80 shadow-lift backdrop-blur-xl'
            : 'border-transparent bg-card/40 backdrop-blur-md',
        )}
      >
        <Link to={logoHref} className="flex shrink-0 items-center gap-2.5" aria-label="ATOOPV home">
          <Wordmark imgClassName="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          <div onMouseEnter={closeMegaNow}>
            <NavDropdown label={NAV_LINKS[0].label} href={NAV_LINKS[0].href} items={NAV_LINKS[0].children} />
          </div>

          {ATOOPV_NAV.map((item) => {
            if (!item.mega) {
              return (
                <Link key={item.href} to={item.href} className={plainLinkClass} onMouseEnter={closeMegaNow} onFocus={closeMegaNow}>
                  {item.label}
                </Link>
              )
            }
            return (
              <Link
                key={item.key}
                ref={(el) => {
                  triggerRefs.current[item.key] = el
                }}
                to={item.href}
                className={triggerClass}
                onMouseEnter={() => openMegaNow(item.key)}
                onFocus={() => openMegaNow(item.key)}
                onMouseLeave={closeMegaSoon}
                onBlur={closeMegaSoon}
                onClick={closeMegaNow}
                aria-haspopup="true"
                aria-expanded={openMegaKey === item.key}
                aria-controls={`mega-panel-${item.key}`}
              >
                {item.label}
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', openMegaKey === item.key && 'rotate-180')} />
              </Link>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button as={Link} to={DEVIS_CTA_HREF} size="sm" variant="accent" className="hidden lg:inline-flex">
            Devis PV
          </Button>
          <div className="hidden sm:block">
            <ShopBooksButton />
          </div>
          <Button as={Link} to="/app" size="sm" variant="primary" className="hidden sm:inline-flex">
            Open app <ArrowUpRight className="h-4 w-4" />
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 bg-card/70 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Positioned relative to this full-viewport-width header (not the nav
          pill or an individual trigger) so it's always centered on the page,
          regardless of which trigger is open or how narrow the viewport is —
          the width clamp inside MegaMenuPanel keeps it from ever overflowing
          the sides. The horizontal centering lives on this plain wrapper
          (not the motion.div below) because Framer Motion writes its own
          `transform` inline style for the y/scale animation, which would
          silently overwrite a `-translate-x-1/2` Tailwind class applied to
          the same element. */}
      <div className="absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 md:block">
        <AnimatePresence>
          {openMegaItem && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <MegaMenuPanel
                item={openMegaItem}
                onNavigate={closeMegaNow}
                onMouseEnter={cancelMegaClose}
                onMouseLeave={closeMegaSoon}
                onFocus={cancelMegaClose}
                onBlur={closeMegaSoon}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute inset-x-4 top-20 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-float md:hidden"
          >
            <Button as={Link} to={DEVIS_CTA_HREF} size="md" variant="accent" className="m-4 mb-0 shrink-0" onClick={() => setOpen(false)}>
              Devis PV
            </Button>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <HashAwareLink
                href={MOBILE_HOME_LINK.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3.5 text-lg font-medium hover:bg-ink/[0.04]"
              >
                {MOBILE_HOME_LINK.label}
              </HashAwareLink>
              <MobileNavRow item={NAV_LINKS[0]} expandedKey={expandedKey} onToggle={toggleMobile} onNavigate={() => setOpen(false)} />
              {ATOOPV_NAV.map((item) => (
                <MobileNavRow
                  key={item.key || item.href}
                  item={item}
                  expandedKey={expandedKey}
                  onToggle={toggleMobile}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/8 pt-3">
                <ShopBooksButton onClick={() => setOpen(false)} />
                <Button as={Link} to="/app" size="sm" onClick={() => setOpen(false)}>
                  Open app
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
