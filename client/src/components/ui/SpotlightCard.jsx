import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * A white card that (a) gently floats up on hover, (b) tracks the cursor with a
 * soft accent-tinted spotlight, and (c) optionally tilts a few degrees toward
 * the pointer for real depth. The "cursor-aware card" from the brief — subtle,
 * never flashy.
 */
export default function SpotlightCard({ className, tint = '54 93 245', children, lift = true, tilt = false, ...props }) {
  const ref = useRef(null)
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  // normalized pointer position for the tilt springs
  const nx = useSpring(useMotionValue(0.5), { stiffness: 200, damping: 20 })
  const ny = useSpring(useMotionValue(0.5), { stiffness: 200, damping: 20 })
  const rotateX = useTransform(ny, [0, 1], [6, -6])
  const rotateY = useTransform(nx, [0, 1], [-6, 6])

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
    if (tilt) {
      nx.set((e.clientX - rect.left) / rect.width)
      ny.set((e.clientY - rect.top) / rect.height)
    }
  }

  const onMouseLeave = () => {
    if (tilt) {
      nx.set(0.5)
      ny.set(0.5)
    }
  }

  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgb(${tint} / 0.10), transparent 70%)`

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={lift ? { y: -6 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-ink/8 bg-card shadow-soft',
        'transition-shadow duration-500 ease-entry hover:shadow-lift',
        className,
      )}
      {...props}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background }} />
      {children}
    </motion.div>
  )
}
