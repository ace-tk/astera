import { motion } from 'framer-motion'
import clsx from 'clsx'

const VARIANTS = { hidden: { y: '100%' }, visible: { y: '0%' } }

/**
 * Clip-mask reveal: the content sits inside an overflow-hidden window and
 * rises from behind it, rather than fading in place. Used for headlines and
 * titles across the lab so type "arrives" the way it would in the print
 * references, not with a generic fade.
 *
 * The `whileInView` trigger lives on the outer (untransformed) wrapper, not
 * the inner one that actually moves: IntersectionObserver clips a target's
 * intersection through any ancestor's `overflow: hidden`, so while the
 * inner element sits translated fully below its own clipping box (its
 * initial `y: 100%`), it is — correctly — never "in view" and would never
 * fire. The outer div stays in normal flow and is always fully visible, so
 * it triggers reliably; the inner child inherits the "visible" variant.
 */
export default function MotionReveal({ children, delay = 0, duration = 0.9, once = true, amount = 0.6, className }) {
  return (
    <motion.div
      className={clsx('overflow-hidden', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
    >
      <motion.div variants={VARIANTS} transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}>
        {children}
      </motion.div>
    </motion.div>
  )
}
