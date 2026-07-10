import { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * The evolved ambient system. Layers a soft mesh gradient, a whisper of grain,
 * a fine dot field, and a few slow-drifting blobs so no surface ever feels
 * empty. `mood` re-tints the whole field to carry a section's emotion
 * (workspace = ivory calm, ai = deep violet, replay = emerald, etc.) while
 * still deferring to the active theme's halo variables.
 */
const MOODS = {
  ivory: ['var(--halo-1)', 'var(--halo-2)', 'var(--accent)'],
  ai: ['124 58 237', 'var(--halo-2)', '56 189 248'],
  timeline: ['22 179 100', 'var(--halo-2)', '74 222 128'],
  reports: ['54 93 245', 'var(--halo-2)', '56 189 248'],
  gold: ['246 196 83', '255 159 67', 'var(--accent)'],
  rose: ['244 63 94', 'var(--halo-2)', '124 58 237'],
}

function MeshBackground({ mood = 'ivory', dots = true, blobs = true, className = '' }) {
  const reduce = useReducedMotion()
  const [c1, c2, c3] = (MOODS[mood] || MOODS.ivory).map((c) =>
    c.startsWith('var') ? `rgb(${c})` : `rgb(${c})`,
  )

  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* mesh gradient wash */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: `radial-gradient(60% 60% at 15% 10%, ${c1.replace('rgb', 'rgba').replace(')', ', 0.18)')}, transparent 60%),
            radial-gradient(50% 50% at 85% 20%, ${c3.replace('rgb', 'rgba').replace(')', ', 0.14)')}, transparent 55%),
            radial-gradient(55% 55% at 60% 100%, ${c2.replace('rgb', 'rgba').replace(')', ', 0.16)')}, transparent 60%)`,
        }}
      />

      {/* fine dot field */}
      {dots && (
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'radial-gradient(rgb(17 24 39 / 0.05) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(80% 80% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(80% 80% at 50% 40%, black, transparent)',
          }}
        />
      )}

      {/* drifting blobs */}
      {blobs &&
        [
          { c: c1, className: 'left-[-6%] top-[-8%] h-[34vw] w-[34vw]', anim: { x: [0, 30, -18, 0], y: [0, -22, 16, 0] }, d: 28 },
          { c: c3, className: 'right-[-8%] top-[24%] h-[30vw] w-[30vw]', anim: { x: [0, -24, 16, 0], y: [0, 22, -14, 0] }, d: 34 },
        ].map((b, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-blob blur-3xl ${b.className}`}
            style={{ background: `radial-gradient(circle at 50% 50%, ${b.c.replace('rgb', 'rgba').replace(')', ', 0.4)')}, transparent 64%)` }}
            animate={reduce ? undefined : b.anim}
            transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

      {/* grain */}
      <div className="absolute inset-0 bg-noise opacity-[0.045] mix-blend-multiply" />
    </div>
  )
}

export default memo(MeshBackground)
