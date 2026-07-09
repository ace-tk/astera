import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * A white card that (a) gently floats up on hover and (b) tracks the cursor
 * with a soft radial spotlight tinted by the feature's accent. This is the
 * "cursor-aware card" from the brief — subtle depth, never flashy.
 */
export default function SpotlightCard({ className, tint = '54 93 245', children, lift = true, ...props }) {
  const ref = useRef(null)
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgb(${tint} / 0.10), transparent 70%)`

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      whileHover={lift ? { y: -6 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
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
