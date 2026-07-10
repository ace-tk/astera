import { motion, useReducedMotion } from 'framer-motion'

/**
 * The "alive" backdrop: three large, slowly drifting color halos over a faint
 * grid and a whisper of film grain. Colors are theme-driven (--halo-*), so the
 * background re-tints with every palette. Purely decorative and non-interactive.
 */
export default function AmbientBackground() {
  const reduce = useReducedMotion()
  const blobs = [
    { v: '--halo-1', className: 'left-[-8%] top-[-6%] h-[42vw] w-[42vw]', anim: { x: [0, 40, -20, 0], y: [0, -30, 20, 0] } },
    { v: '--halo-2', className: 'right-[-10%] top-[18%] h-[38vw] w-[38vw]', anim: { x: [0, -30, 20, 0], y: [0, 30, -20, 0] } },
    { v: '--halo-3', className: 'left-[30%] bottom-[-14%] h-[46vw] w-[46vw]', anim: { x: [0, 24, -30, 0], y: [0, -20, 24, 0] } },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* faint editorial grid */}
      <div className="absolute inset-0 bg-grid-faint [background-size:64px_64px] opacity-60 mask-fade-b" />

      {/* drifting color halos */}
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-blob blur-3xl ${b.className}`}
          style={{ background: `radial-gradient(circle at 50% 50%, rgb(var(${b.v}) / 0.5), transparent 62%)` }}
          animate={reduce ? undefined : b.anim}
          transition={{ duration: 26 + i * 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* film grain to kill any banding in the gradients */}
      <div className="absolute inset-0 bg-noise opacity-[0.05] mix-blend-multiply" />
    </div>
  )
}
