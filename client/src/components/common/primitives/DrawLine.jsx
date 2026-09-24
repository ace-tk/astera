import { motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * A hairline rule that draws itself in (scaleX/scaleY 0 → 1) as it enters
 * the viewport — the "connecting lines" vocabulary used across the lab to
 * suggest structure rather than decoration. Transform-only, so it's cheap
 * and honors reduced-motion automatically via the app's global MotionConfig.
 */
export default function DrawLine({
  axis = 'x',
  origin = 'left',
  delay = 0,
  duration = 1,
  once = true,
  amount = 0.4,
  className,
  style,
}) {
  const isX = axis === 'x'
  return (
    <motion.div
      initial={{ scaleX: isX ? 0 : 1, scaleY: isX ? 1 : 0 }}
      whileInView={{ scaleX: 1, scaleY: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: origin, ...style }}
      className={clsx(isX ? 'h-px w-full' : 'h-full w-px', 'bg-ink/15', className)}
    />
  )
}
