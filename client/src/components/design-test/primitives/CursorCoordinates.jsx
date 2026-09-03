import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * "The interface is alive," not "the website is following my mouse": a
 * small coordinate readout that tracks the pointer within one bounded
 * canvas. Desktop fine-pointer only, off for touch and reduced-motion —
 * this is a technical annotation, not a novelty cursor. rAF-throttled so
 * it never fires more than once per frame.
 */
export default function CursorCoordinates({ containerRef }) {
  const reduceMotion = useReducedMotion()
  const [pos, setPos] = useState(null)
  const frame = useRef(null)

  useEffect(() => {
    if (reduceMotion) return undefined
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const el = containerRef.current
    if (!el) return undefined

    const onMove = (e) => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        if (x < 0 || x > 1 || y < 0 || y > 1) {
          setPos(null)
          return
        }
        setPos({ x, y, px: e.clientX - rect.left, py: e.clientY - rect.top })
      })
    }
    const onLeave = () => setPos(null)

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [containerRef, reduceMotion])

  if (!pos) return null

  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded border border-ink/10 bg-card/90 px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-muted shadow-soft"
      style={{ left: pos.px, top: pos.py }}
      aria-hidden="true"
    >
      X {pos.x.toFixed(2)} / Y {pos.y.toFixed(2)}
    </div>
  )
}
