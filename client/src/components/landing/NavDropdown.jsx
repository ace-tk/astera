import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * A navbar link that also reveals a dropdown of sub-links on hover — same
 * rounded-2xl / border-ink/10 / bg-card / shadow-float / spring-transition
 * grammar as UserMenu's account dropdown, so it reads as the same family of
 * component rather than a one-off. The label itself is a real link (click
 * navigates to `href` immediately; hover reveals the panel first).
 */
export default function NavDropdown({ label, href, items }) {
  const [open, setOpen] = useState(false)
  const linkClass =
    'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ink/[0.04] hover:text-ink'

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link to={href} className={linkClass} aria-haspopup="true" aria-expanded={open}>
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-2xl border border-ink/10 bg-card p-1.5 shadow-float"
          >
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm leading-snug text-ink/80 transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
