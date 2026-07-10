import { motion, useReducedMotion } from 'framer-motion'

/**
 * ASTRA's living orb — a slowly rotating conic gradient with drifting internal
 * blobs and a glass highlight. Breathes gently. Reused as the floating trigger
 * and as the small avatar beside each of Astra's messages.
 */
export default function AstraOrb({ size = 60, breathing = true, className = '' }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      animate={breathing && !reduce ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_8px_30px_-6px_rgba(124,58,237,0.5)]">
        <motion.div
          className="absolute inset-[-30%]"
          style={{
            background:
              'conic-gradient(from 0deg, #7C3AED, #365DF5, #38BDF8, #FF6B6B, #F6C453, #7C3AED)',
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />
        {/* drifting inner blob for organic movement */}
        <motion.div
          className="absolute h-1/2 w-1/2 rounded-full bg-white/40 blur-md"
          animate={reduce ? undefined : { x: ['-20%', '60%', '10%', '-20%'], y: ['10%', '-10%', '70%', '10%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* glass highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
      </div>
    </motion.div>
  )
}
