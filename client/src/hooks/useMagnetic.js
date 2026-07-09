import { useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * Magnetic hover: the element eases toward the cursor while hovered and
 * springs home on leave. Returns a ref plus x/y springs to bind to a
 * motion element's `style`. Strength is the fraction of cursor offset applied.
 */
export function useMagnetic(strength = 0.35) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { ref, springX, springY, onMouseMove, onMouseLeave }
}
