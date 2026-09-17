import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { DEVIS_CTA_HREF } from '@/constants/content'
import { ANNOUNCEMENT_MESSAGES } from '@/constants/atoopvHome'

const ROTATE_MS = 4200

/**
 * Slim floating announcement strip above the homepage navbar (ATOOPV
 * `/atoopv` only — Navbar.jsx shifts its own top offset down to make room,
 * conditionally, only on this route). Visually a smaller pill in the same
 * translucent/blurred language as the navbar pill and ShopBooksButton, not
 * a full-bleed banner. Phone + CTA are static; only the message crossfades.
 */
export default function AtoopvAnnouncementBar() {
  const [index, setIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || ANNOUNCEMENT_MESSAGES.length < 2) return undefined
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % ANNOUNCEMENT_MESSAGES.length)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-2">
      <div className="flex h-8 w-full max-w-shell items-center justify-between gap-4 rounded-full border border-ink/8 bg-card/60 px-4 shadow-soft backdrop-blur-md">
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="truncate text-[11px] font-medium text-ink/70 sm:text-xs"
            >
              {ANNOUNCEMENT_MESSAGES[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <a href="tel:+33412100606" className="text-xs font-medium text-ink/70 transition-colors hover:text-ink">
            04 12 10 06 06
          </a>
          <Link
            to={DEVIS_CTA_HREF}
            className="inline-flex items-center rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-paper transition-colors hover:bg-royal"
          >
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  )
}
