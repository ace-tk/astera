import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Reveal from '@/components/ui/Reveal'
import { STATS } from '@/constants/content'

/**
 * The narrative beat between hero and product. A large editorial statement
 * whose words brighten as they scroll through the viewport, plus a stat band.
 */
function ScrollLitLine({ children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.35'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1])
  return (
    <motion.span ref={ref} style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  )
}

export default function Story() {
  const words =
    'Every meeting holds a decision, a promise, a risk. Most of it evaporates the moment the call ends. Astera keeps it — and hands it back as a story.'.split(
      ' ',
    )

  return (
    <section id="story" className="relative py-section">
      <div className="shell">
        <Reveal>
          <span className="eyebrow"><span className="h-px w-8 bg-ink/30" /> The premise</span>
        </Reveal>

        <h2 className="mt-8 max-w-4xl font-display text-display-sm font-medium leading-[1.08] tracking-tight text-balance">
          {words.map((w, i) => (
            <ScrollLitLine key={i}>{w}</ScrollLitLine>
          ))}
        </h2>

        {/* Stat band */}
        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-ink/8 pt-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div>
                <div className="flex items-baseline gap-1 font-display text-6xl font-semibold tracking-tight">
                  {s.value}
                  <span className="text-2xl text-accent">{s.suffix}</span>
                </div>
                <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
