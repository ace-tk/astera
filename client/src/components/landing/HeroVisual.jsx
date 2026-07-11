import { motion, useTransform } from 'framer-motion'
import { useMouseParallax } from '@/hooks/useMouseParallax'
import Waveform from './Waveform'
import Glyph from '@/components/ui/Glyph'

/**
 * The hero's centerpiece: a composed intelligence report floating above a live
 * waveform, flanked by drifting metric cards. Every layer parallaxes against
 * the cursor at its own depth to create real spatial dimension.
 */
function Layer({ depth, px, py, className, children, float }) {
  const x = useTransform(px, (v) => v * depth)
  const y = useTransform(py, (v) => v * depth)
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        animate={float ? { y: [0, -12, 0] } : undefined}
        transition={float ? { duration: 6 + depth * 0.02, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function HeroVisual() {
  const { x: px, y: py } = useMouseParallax()

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      {/* soft glow pad behind the stack */}
      <div className="absolute inset-8 rounded-[3rem] bg-gradient-to-br from-accent/10 to-transparent blur-2xl" />

      {/* main report card */}
      <Layer depth={-22} px={px} py={py} float className="inset-x-6 top-10 z-20">
        <div className="rounded-[2rem] border border-ink/8 bg-card p-6 shadow-float">
          <div className="mb-4 flex items-center justify-between">
            <span className="chip text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Report ready
            </span>
            <span className="text-xs text-muted">74:12</span>
          </div>
          <p className="font-display text-2xl leading-tight tracking-tight" aria-hidden="true">
            Q3 Roadmap alignment
          </p>
          <p className="mt-2 text-sm text-muted">
            Seven participants aligned on shipping the billing rewrite before the
            enterprise pilot. Two risks surfaced.
          </p>
          <div className="mt-5">
            <Waveform bars={40} height={40} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['9', 'Decisions', 'text-royal'],
              ['4', 'Owners', 'text-purple'],
              ['2', 'Risks', 'text-rose'],
            ].map(([n, l, c]) => (
              <div key={l} className="rounded-2xl bg-paper p-3">
                <div className={`font-display text-xl ${c}`}>{n}</div>
                <div className="text-[0.7rem] text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Layer>

      {/* floating decision chip */}
      <Layer depth={-46} px={px} py={py} float className="left-[-4%] top-[42%] z-30">
        <div className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-card px-4 py-3 shadow-lift">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald/12 text-emerald">
            <Glyph name="shield" size={22} />
          </span>
          <div>
            <div className="text-xs font-medium">Commitment flagged</div>
            <div className="text-[0.7rem] text-muted">Legal review by Fri</div>
          </div>
        </div>
      </Layer>

      {/* floating AI chip */}
      <Layer depth={-60} px={px} py={py} float className="right-[-6%] top-[20%] z-30">
        <div className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-card px-4 py-3 shadow-lift">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple/12 text-purple">
            <Glyph name="brain" size={22} />
          </span>
          <div>
            <div className="text-xs font-medium">Intent detected</div>
            <div className="text-[0.7rem] text-muted">Positive · aligned</div>
          </div>
        </div>
      </Layer>

      {/* timeline sliver at the bottom */}
      <Layer depth={-34} px={px} py={py} float className="inset-x-10 bottom-4 z-10">
        <div className="rounded-2xl border border-ink/8 bg-card/90 p-4 shadow-lift backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-[0.7rem] text-muted">
            <span>00:00</span><span>Timeline</span><span>74:12</span>
          </div>
          <div className="relative h-2 rounded-full bg-paper">
            {[15, 38, 55, 72, 88].map((p, i) => (
              <span
                key={p}
                className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ring-2 ring-card ${['bg-coral', 'bg-purple', 'bg-emerald', 'bg-golden', 'bg-royal'][i]}`}
                style={{ left: `${p}%` }}
              />
            ))}
          </div>
        </div>
      </Layer>
    </div>
  )
}
