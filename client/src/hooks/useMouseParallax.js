import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * Tracks the cursor as a normalized (-0.5..0.5) offset from viewport center,
 * spring-smoothed. Multiply by a per-layer depth to build parallax that
 * responds to the mouse — the hero's "alive" feeling.
 */
export function useMouseParallax() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const onMove = (e) => {
      x.set(e.clientX / window.innerWidth - 0.5)
      y.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])

  return { x: sx, y: sy }
}
