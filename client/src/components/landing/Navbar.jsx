import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react'
import { NAV_LINKS } from '@/constants/content'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import Button from '@/components/ui/Button'
import Wordmark from '@/components/common/Wordmark'
import NavDropdown from '@/components/landing/NavDropdown'
import HashAwareLink from '@/components/landing/HashAwareLink'
import { cn } from '@/utils/cn'

/**
 * One row of the mobile nav overlay, recursive so an item's `children` can
 * themselves carry `children` (e.g. Ressources -> Modèles de PV -> Cas
 * pratiques) without hand-duplicating the accordion markup per depth.
 * `expanded` is a Set of open hrefs shared across the whole tree, so a
 * parent and its child accordion can be open at the same time.
 */
function MobileNavItem({ item, depth, expanded, onToggle, onNavigate }) {
  const hasChildren = Boolean(item.children?.length)
  const isExpanded = expanded.has(item.href)
  const linkClass = cn(
    'block rounded-2xl px-4',
    depth === 0 ? 'py-3 text-lg font-medium hover:bg-ink/[0.04]' : 'py-2.5 text-base leading-snug text-ink/70 hover:bg-ink/[0.04]',
  )

  if (!hasChildren) {
    return (
      <HashAwareLink href={item.href} onClick={onNavigate} className={linkClass}>
        {item.label}
      </HashAwareLink>
    )
  }

  return (
    <div>
      <div className="flex items-center">
        <HashAwareLink href={item.href} onClick={onNavigate} className={cn(linkClass, 'flex-1')}>
          {item.label}
        </HashAwareLink>
        <button
          onClick={() => onToggle(item.href)}
          aria-label={isExpanded ? `Masquer le sous-menu ${item.label}` : `Afficher le sous-menu ${item.label}`}
          aria-expanded={isExpanded}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-ink/[0.04]"
        >
          <ChevronDown className={cn('h-5 w-5 transition-transform', isExpanded && 'rotate-180')} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pl-4"
          >
            {item.children.map((child) => (
              <MobileNavItem
                key={child.href}
                item={child}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Floating pill navbar that condenses once you scroll past the hero. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(() => new Set())
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  const toggleMobile = (href) => {
    setMobileExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(href)) next.delete(href)
      else next.add(href)
      return next
    })
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
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
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="ATOOPV home">
          <Wordmark imgClassName="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((l) => {
            const linkClass =
              'rounded-full px-2.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'
            if (l.children) {
              return <NavDropdown key={l.href} label={l.label} href={l.href} items={l.children} />
            }
            return (
              <HashAwareLink key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </HashAwareLink>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <ThemeSwitcher />
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

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute inset-x-4 top-20 rounded-3xl border border-ink/10 bg-card p-4 shadow-float md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <MobileNavItem
                key={l.href}
                item={l}
                depth={0}
                expanded={mobileExpanded}
                onToggle={toggleMobile}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/8 pt-3">
              <ThemeSwitcher align="left" />
              <Button as={Link} to="/app" size="sm">
                Open app
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
