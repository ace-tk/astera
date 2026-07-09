import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { useMagnetic } from '@/hooks/useMagnetic'
import { cn } from '@/utils/cn'

/**
 * Astera's button — nothing like a default shadcn button. It lifts on hover,
 * carries a soft shadow, and (for primary) drifts magnetically toward the
 * cursor. Variants map to the design language rather than generic states.
 */
const VARIANTS = {
  primary:
    'bg-ink text-paper shadow-lift hover:shadow-float border border-ink',
  accent:
    'bg-accent text-white shadow-glow border border-transparent',
  ghost:
    'bg-transparent text-ink border border-ink/12 hover:border-ink/25 hover:bg-ink/[0.03]',
  soft:
    'bg-card text-ink border border-ink/8 shadow-soft hover:shadow-lift',
}

const SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-[0.95rem] gap-2',
  lg: 'h-14 px-8 text-base gap-2.5',
}

const Button = forwardRef(function Button(
  { as = 'button', variant = 'primary', size = 'md', magnetic = variant !== 'ghost', className, children, ...props },
  ref,
) {
  const mag = useMagnetic(magnetic ? 0.28 : 0)
  const Comp = motion[as] || motion.button

  return (
    <Comp
      ref={(node) => {
        mag.ref.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      onMouseMove={magnetic ? mag.onMouseMove : undefined}
      onMouseLeave={magnetic ? mag.onMouseLeave : undefined}
      style={magnetic ? { x: mag.springX, y: mag.springY } : undefined}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={cn(
        'group relative inline-flex select-none items-center justify-center rounded-full font-medium tracking-tight',
        'transition-[box-shadow,border-color,background-color] duration-300 ease-entry',
        'focus-visible:outline-offset-4',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {/* Inner sheen so the fill never reads flat. */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent opacity-60" />
      <span className="relative inline-flex items-center gap-[inherit]">{children}</span>
    </Comp>
  )
})

export default Button
