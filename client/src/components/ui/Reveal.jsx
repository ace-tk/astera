import { motion } from 'framer-motion'

/**
 * The house entrance animation: nothing pops in. Content rises a little,
 * un-blurs, and fades — the Apple/Linear feel. Stagger children by passing
 * an incrementing `delay`. Honors reduced-motion via Framer's global setting.
 */
const DIRECTIONS = {
  up: { y: 26, x: 0 },
  down: { y: -26, x: 0 },
  left: { x: 26, y: 0 },
  right: { x: -26, y: 0 },
  none: { x: 0, y: 0 },
}

export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  blur = true,
  amount = 0.35,
  once = true,
  className,
  as = 'div',
}) {
  const Comp = motion[as] || motion.div
  const offset = DIRECTIONS[direction] || DIRECTIONS.up
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, ...offset, filter: blur ? 'blur(10px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  )
}
