import { motion } from 'framer-motion'
import clsx from 'clsx'

const SIZES = {
  sm: 'text-3xl sm:text-4xl',
  md: 'text-5xl sm:text-6xl',
  lg: 'text-6xl sm:text-display-sm',
  xl: 'text-7xl sm:text-[9rem] lg:text-[11rem]',
}

/**
 * The oversized chapter numeral used throughout the lab. `total` renders
 * the quiet "/ 06" suffix that ties every experiment back to the set.
 * Accepts `style` so scroll-linked pages can drive it with motion values
 * without re-rendering React.
 */
export default function SectionNumber({ value, total, size = 'lg', muted = false, className, style }) {
  return (
    <motion.div
      style={style}
      className={clsx(
        'flex items-baseline gap-2 font-display leading-none tabular-nums',
        SIZES[size],
        muted ? 'text-ink/20' : 'text-ink',
        className,
      )}
    >
      <span>{value}</span>
      {total && <span className="text-[0.32em] font-normal tracking-tight text-muted">/ {total}</span>}
    </motion.div>
  )
}
