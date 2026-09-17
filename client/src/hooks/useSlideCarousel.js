import { useCallback, useEffect, useRef, useState } from 'react'

/** Shared by every slide-carousel track so two tracks driven by the same
 * index (e.g. left text + right visual) always settle in lockstep. */
export const SLIDE_TRANSITION = { type: 'spring', stiffness: 300, damping: 32 }

/** Drag-to-swipe offset (px) past which a drag counts as a slide change,
 * matching the threshold already used by ReportPreviewCarousel. */
export const SLIDE_DRAG_THRESHOLD = 50

/**
 * Single source of truth for a fixed-count slide index, shared by two (or
 * more) independently-drawn tracks that must never fall out of sync — e.g.
 * the ATOOPV hero's paired left-text/right-Roadmap carousel. `step(dir)`
 * clamps rather than wraps, matching a drag-to-swipe gesture where there's
 * no "next" past the last slide.
 */
export function useSlideCarousel(count) {
  const [active, setActive] = useState(0)

  const step = useCallback(
    (dir) => setActive((current) => Math.min(Math.max(current + dir, 0), count - 1)),
    [count],
  )

  return { active, setActive, step }
}

/**
 * Measures a ref'd element's rendered width in pixels, kept live via
 * ResizeObserver — the same technique ReportPreviewCarousel already uses to
 * drive its drag-carousel's `animate.x`. Used instead of a CSS-percentage
 * transform because a percentage `translateX` resolves against the
 * *transformed element's own* box, not its overflowing children, so it
 * only works reliably once nested inside more than one flex container if
 * every ancestor happens to hand down a definite width — not guaranteed
 * (confirmed broken specifically in the hero's right column, which sits
 * inside a `justify-center` flex wrapper). A measured pixel width sidesteps
 * that ambiguity entirely.
 *
 * IMPORTANT: the ref'd element must have an explicit width (e.g. `w-full
 * min-w-0`), not rely on default flex/block stretch sizing. Its children
 * carry an explicit pixel width and `shrink-0` (non-shrinkable) so they can
 * overflow it; without a hard `width` rule pinning the wrapper itself to
 * its parent, that non-shrinkable content can inflate the wrapper's own
 * measured size, which feeds back into the next measurement — an
 * exponential (×slide-count per tick) runaway confirmed empirically here.
 */
export function useTrackWidth(fallback = 400) {
  const ref = useRef(null)
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const update = () => setWidth(node.getBoundingClientRect().width)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return [ref, width]
}
