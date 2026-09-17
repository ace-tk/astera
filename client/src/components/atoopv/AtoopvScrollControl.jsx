import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowDown, ArrowUp } from 'lucide-react'

/**
 * Small floating corner scroll affordance — replaces the old bottom
 * "SCROLL DOWN / 01·06" strip removed from the hero. Lives outside the
 * hero entirely (fixed to the viewport, page-level), so it can't affect
 * hero height or the 3-slide carousel. ↓ scrolls to the same `#stats`
 * anchor the old strip pointed to; once scrolled past roughly the hero's
 * own height it flips to ↑, which scrolls back to the top.
 *
 * Reuses the app's existing Lenis smooth-scroll instance (window.__lenis,
 * set up by useSmoothScroll) for the same easing/offset every other
 * in-page anchor already uses, falling back to native smooth scroll for
 * reduced-motion visitors (Lenis never initializes for them).
 */
export default function AtoopvScrollControl() {
  const [pastHero, setPastHero] = useState(false)
  const { scrollY } = useScroll()
  const reduceMotion = useReducedMotion()

  useMotionValueEvent(scrollY, 'change', (v) => {
    const threshold = window.innerHeight * 0.8
    setPastHero(v > threshold)
  })

  const handleClick = () => {
    const lenis = window.__lenis
    if (pastHero) {
      if (lenis) lenis.scrollTo(0)
      else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const target = document.getElementById('stats')
    if (!target) return
    if (lenis) lenis.scrollTo(target, { offset: -96 })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={pastHero ? 'Remonter en haut de page' : 'Défiler vers le contenu'}
      className="fixed bottom-5 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-ink/8 bg-card/70 text-ink shadow-soft backdrop-blur-md transition-colors hover:bg-card sm:bottom-6 sm:right-6"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={pastHero ? 'up' : 'down'}
          initial={reduceMotion ? false : { opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {pastHero ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
