import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { NAV_LINKS } from '@/constants/content'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import Button from '@/components/ui/Button'
import Wordmark from '@/components/common/Wordmark'
import { cn } from '@/utils/cn'

/** Floating pill navbar that condenses once you scroll past the hero. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24))

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
    >
      <motion.nav
        animate={{
          width: scrolled ? 'min(64rem, 100%)' : 'min(72rem, 100%)',
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={cn(
          'flex items-center justify-between gap-4 rounded-full border px-4 sm:px-5',
          scrolled
            ? 'border-ink/10 bg-card/80 shadow-lift backdrop-blur-xl'
            : 'border-transparent bg-card/40 backdrop-blur-md',
        )}
      >
        <Link to="/" className="flex items-center gap-2.5" aria-label="Astera home">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const linkClass =
              'rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'
            return l.href.startsWith('/') ? (
              <Link key={l.href} to={l.href} className={linkClass}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
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
            {NAV_LINKS.map((l) => {
              const linkClass = 'block rounded-2xl px-4 py-3 text-lg font-medium hover:bg-ink/[0.04]'
              return l.href.startsWith('/') ? (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className={linkClass}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={linkClass}>
                  {l.label}
                </a>
              )
            })}
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
