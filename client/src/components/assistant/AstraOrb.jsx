import { motion, useReducedMotion } from 'framer-motion'

/**
 * ASTRA's living orb — a slowly rotating conic gradient with drifting internal
 * blobs and a glass highlight. It has *moods*: `state` modulates the rotation
 * speed, glow color, brightness, and pulse so Astra feels alive and reflects
 * what she's doing (sleeping → listening → thinking → writing → completed).
 */
const ASTRA_STATES = {
  sleeping: { speed: 20, glow: '124 58 237', dim: 0.6, pulse: false, blob: 9 },
  idle: { speed: 11, glow: '124 58 237', dim: 0.92, pulse: false, blob: 7 },
  listening: { speed: 9, glow: '56 189 248', dim: 1, pulse: true, blob: 6 },
  thinking: { speed: 4.5, glow: '124 58 237', dim: 1, pulse: true, blob: 3.5 },
  reviewing: { speed: 6, glow: '54 93 245', dim: 1, pulse: true, blob: 5 },
  writing: { speed: 3.5, glow: '246 196 83', dim: 1, pulse: true, blob: 3 },
  completed: { speed: 13, glow: '22 179 100', dim: 1, pulse: false, blob: 8 },
}

export default function AstraOrb({ size = 60, breathing = true, state = 'idle', className = '' }) {
  const reduce = useReducedMotion()
  const cfg = ASTRA_STATES[state] || ASTRA_STATES.idle

  return (
    <motion.div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      animate={breathing && !reduce ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: state === 'thinking' || state === 'writing' ? 2 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* state glow halo */}
      {cfg.pulse && !reduce && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 0 rgb(${cfg.glow} / 0.5)` }}
          animate={{ boxShadow: [`0 0 0 0 rgb(${cfg.glow} / 0.45)`, `0 0 0 10px rgb(${cfg.glow} / 0)`] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ boxShadow: `0 8px 30px -6px rgb(${cfg.glow} / 0.55)`, opacity: cfg.dim }}
      >
        <motion.div
          className="absolute inset-[-30%]"
          style={{ background: 'conic-gradient(from 0deg, #7C3AED, #365DF5, #38BDF8, #FF6B6B, #F6C453, #7C3AED)' }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: cfg.speed, repeat: Infinity, ease: 'linear' }}
        />
        {/* drifting inner blob for organic movement */}
        <motion.div
          className="absolute h-1/2 w-1/2 rounded-full bg-white/40 blur-md"
          animate={reduce ? undefined : { x: ['-20%', '60%', '10%', '-20%'], y: ['10%', '-10%', '70%', '10%'] }}
          transition={{ duration: cfg.blob, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* glass highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/30" />
      </motion.div>
    </motion.div>
  )
}
