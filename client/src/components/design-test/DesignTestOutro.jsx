import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import TechnicalGrid from './primitives/TechnicalGrid'
import TechnicalLabel from './primitives/TechnicalLabel'
import DrawLine from './primitives/DrawLine'
import MotionReveal from './primitives/MotionReveal'
import { LAB_META, OUTRO_STATEMENT } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

/**
 * The lab's closing beat — a restrained editorial ending rather than an
 * abrupt stop after Experiment 06. Mirrors the intro's structural language
 * (grid, thin rules, masked headline) so the page reads as one composed
 * document that opens and closes deliberately.
 */
export default function DesignTestOutro() {
  const goToStart = () => {
    const el = document.querySelector('main.design-test')
    if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: 0 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden border-t border-ink/10 bg-paper py-24 sm:py-32">
      <TechnicalGrid showTicks fade={false} />

      <div className="shell relative flex flex-col items-center text-center">
        <DrawLine axis="x" origin="center" duration={1} className="max-w-xs" />

        <h2 className="mt-10 font-display text-display-sm leading-[0.98] tracking-tight text-ink sm:text-display">
          {OUTRO_STATEMENT.map((line) => (
            <MotionReveal key={line} amount={0.6}>
              <span className="block">{line}</span>
            </MotionReveal>
          ))}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          <TechnicalLabel dot={false}>ATOOPV</TechnicalLabel>
          <TechnicalLabel dot={false}>{LAB_META.titleLines.join(' ')}</TechnicalLabel>
          <TechnicalLabel dot={false}>11 / 11</TechnicalLabel>
        </motion.div>

        <motion.button
          type="button"
          onClick={goToStart}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="group mt-10 inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-ink/25 hover:text-ink"
        >
          Replay experiments
          <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      </div>
    </section>
  )
}
