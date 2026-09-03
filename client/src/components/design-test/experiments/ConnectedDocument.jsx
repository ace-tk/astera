import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { CONNECTED_FRAGMENTS, CONNECTED_TEASER } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function Fragment({ fragment, index, progress }) {
  const x = useTransform(progress, [0, 1], [fragment.x, 0])
  const y = useTransform(progress, [0, 1], [fragment.y, index * 64 - 96])
  const rotate = useTransform(progress, [0, 1], [fragment.rotate, 0])
  const borderOpacity = useTransform(progress, [0.6, 1], [0.1, 0.4])

  return (
    <motion.div
      style={{ x, y, rotate }}
      className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-card p-4 shadow-soft sm:w-64"
    >
      <motion.div style={{ opacity: borderOpacity }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <TechnicalLabel dot={false} className="text-ink/50">
        {fragment.role}
      </TechnicalLabel>
      <p className={fragment.kind === 'quote' ? 'mt-2 text-sm italic leading-snug text-ink' : 'mt-2 font-display text-lg text-ink'}>
        {fragment.kind === 'quote' ? `« ${fragment.text} »` : fragment.text}
      </p>
    </motion.div>
  )
}

/**
 * The bridge to Prompt 2: scattered conversation fragments drift into a
 * single aligned column as the section scrolls, hinting at the raw
 * conversation → structured document transformation without building it —
 * that full transcript/PV interaction is explicitly reserved for Prompt 2.
 */
export default function ConnectedDocument() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const progress = useTransform(scrollYProgress, [0.15, 0.75], [0, 1])

  return (
    <section id="experiment-06" ref={sectionRef} className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader
          index="06"
          eyebrow="EXPERIMENT / 06"
          titleLines={['FROM CONVERSATION', 'TO DOCUMENT.']}
          className="mb-14 sm:mb-20"
        />

        <div className="relative mx-auto h-[28rem] max-w-2xl overflow-hidden sm:h-[32rem]">
          <div className="absolute left-1/2 top-1/2 h-3/4 w-px -translate-x-1/2 -translate-y-1/2 bg-ink/10" aria-hidden="true" />
          {CONNECTED_FRAGMENTS.map((fragment, i) => (
            <Fragment key={fragment.id} fragment={fragment} index={i} progress={progress} />
          ))}
        </div>

        <div className="mx-auto mt-16 flex max-w-xs flex-col items-center gap-3 text-center sm:mt-24">
          {CONNECTED_TEASER.map((line, i) => (
            <div key={line} className="flex flex-col items-center gap-3">
              {i > 0 && <span className="font-mono text-muted/40">↓</span>}
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: EASE }}
                className="font-mono text-xs uppercase tracking-[0.24em] text-muted"
              >
                {line}
              </motion.span>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto mt-14 max-w-md rounded-xl border border-ink/10 bg-card p-6 shadow-soft sm:mt-20"
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <TechnicalLabel dot={false}>PROCÈS-VERBAL — DRAFT</TechnicalLabel>
            <span className="h-1.5 w-1.5 rounded-full bg-ink/20" />
          </div>
          <div className="mt-4 space-y-2.5">
            <div className="h-2 w-3/4 rounded-full bg-ink/10" />
            <div className="h-2 w-full rounded-full bg-ink/10" />
            <div className="h-2 w-5/6 rounded-full bg-ink/10" />
            <div className="h-2 w-2/3 rounded-full bg-ink/[0.07]" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/50">Suite dans EXPERIMENT 07 — PROMPT 2</p>
        </motion.div>
      </div>
    </section>
  )
}
