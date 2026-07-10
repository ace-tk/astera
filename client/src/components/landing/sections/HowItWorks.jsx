import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { JOURNEY } from '@/constants/content'
import { accent } from '@/utils/accent'
import Glyph from '@/components/ui/Glyph'
import Reveal from '@/components/ui/Reveal'

/**
 * The conversation's journey through Astera, told as a vertical thread. A
 * central line "draws" itself as you scroll, and each stage rises in from the
 * side it sits on. This replaces a row of static icons with a real narrative.
 */
function Stage({ stage, index }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'center 0.5'] })
  const dot = useTransform(scrollYProgress, [0, 1], [0.4, 1])
  const a = accent(stage.color)
  const left = index % 2 === 0

  return (
    <div ref={ref} className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-6 sm:py-9">
      {/* card side */}
      <Reveal
        direction={left ? 'right' : 'left'}
        className={left ? 'col-start-1 text-right' : 'col-start-3 text-left'}
      >
        <div className={`inline-flex max-w-sm flex-col gap-2 rounded-3xl border ${a.border} bg-card p-6 shadow-soft ${left ? 'items-end' : 'items-start'}`}>
          <span className={`grid h-12 w-12 place-items-center rounded-2xl ${a.softBg} ${a.text}`}>
            <Glyph name={stage.glyph} size={30} />
          </span>
          <h3 className="mt-1 font-display text-2xl font-medium tracking-tight">{stage.title}</h3>
          <p className="text-sm leading-relaxed text-muted">{stage.body}</p>
        </div>
      </Reveal>

      {/* center node */}
      <div className="col-start-2 flex flex-col items-center">
        <motion.span
          style={{ scale: dot }}
          className={`z-10 grid h-6 w-6 place-items-center rounded-full ${a.bg} ring-4 ring-paper`}
        >
          <span className="h-2 w-2 rounded-full bg-white/80" />
        </motion.span>
      </div>

      {/* number ghost on the empty side */}
      <div className={`hidden font-display text-8xl font-semibold text-ink/[0.04] sm:block ${left ? 'col-start-3 pl-8' : 'col-start-1 text-right pr-8'}`}>
        {String(index + 1).padStart(2, '0')}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.6', 'end 0.7'] })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="how" className="relative overflow-hidden py-section">
      <div className="shell">
        <Reveal className="text-center">
          <span className="eyebrow justify-center">How it works</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
            One recording in. A whole story out.
          </h2>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          {/* the drawing thread */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/8" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-gradient-to-b from-coral via-purple to-sky"
          />
          {JOURNEY.map((stage, i) => (
            <Stage key={stage.key} stage={stage} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
