import { motion, useReducedMotion } from 'framer-motion'

/**
 * A living meeting waveform. Bars breathe on a deterministic per-index rhythm
 * (no Math.random, so SSR/hydration stay stable) and are tinted by the theme
 * accent. Used in the hero and the upload processing state.
 */
export default function Waveform({ bars = 48, className = '', height = 96 }) {
  const reduce = useReducedMotion()
  // Deterministic pseudo-heights — a couple of sine waves layered together.
  const seeds = Array.from({ length: bars }, (_, i) => {
    const a = Math.sin(i * 0.5) * 0.5 + 0.5
    const b = Math.sin(i * 0.17 + 1.3) * 0.5 + 0.5
    return 0.25 + (a * 0.55 + b * 0.45) * 0.75
  })

  return (
    <div className={`flex items-center gap-[3px] ${className}`} style={{ height }} aria-hidden>
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="w-[3px] flex-1 rounded-full bg-accent"
          style={{ opacity: 0.35 + s * 0.55 }}
          initial={{ scaleY: s }}
          animate={reduce ? { scaleY: s } : { scaleY: [s * 0.4, s, s * 0.55, s * 0.9, s * 0.4] }}
          transition={{ duration: 1.8 + (i % 5) * 0.25, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.09 }}
        />
      ))}
    </div>
  )
}
