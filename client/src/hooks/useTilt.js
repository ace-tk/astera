import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Subtle 3D tilt that follows the cursor across an element and springs flat on
 * leave. Returns a ref plus rotateX/rotateY springs to bind to a motion
 * element's `style` (wrap the parent in `perspective`). Max tilt is small on
 * purpose — depth, not a gimmick.
 */
export function useTilt(max = 8) {
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 200, damping: 20 })
  const sy = useSpring(py, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const rotateY = useTransform(sx, [0, 1], [-max, max])

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }
  const onMouseLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave }
}
