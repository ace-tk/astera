import { motion } from 'framer-motion'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import DrawLine from '../primitives/DrawLine'
import MotionReveal from '../primitives/MotionReveal'
import { EDITORIAL_PROCESS_STAGES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function ProcessRow({ stage }) {
  return (
    <div className="relative py-8 first:pt-0">
      <DrawLine axis="x" origin="left" duration={0.9} className="absolute left-0 top-0" />
      <div className="grid grid-cols-[3rem_1fr] gap-4 pt-8 sm:grid-cols-[4.5rem_1fr] sm:gap-8">
        <TechnicalLabel dot={false} className="pt-1 text-ink/35">
          {stage.number}
        </TechnicalLabel>
        <div>
          <MotionReveal>
            <h3 className="font-display text-xl leading-tight text-ink sm:text-2xl">{stage.title}</h3>
          </MotionReveal>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="mt-2 max-w-md text-sm leading-relaxed text-muted"
          >
            {stage.description}
          </motion.p>
        </div>
      </div>
    </div>
  )
}

/**
 * Editorial two-column layout: a sticky title on the left, a document-style
 * list of stages on the right. Each row's line "extends from the page edge"
 * toward it as it enters, and earlier rows stay visible — the whole thing
 * accumulates into a printed process document rather than replacing itself.
 */
export default function EditorialProcess() {
  return (
    <section id="experiment-03" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ExperimentHeader
            index="03"
            eyebrow="EXPERIMENT / 03"
            titleLines={['THE PROCESS,', 'RECOMPOSED.']}
            titleClassName="text-4xl sm:text-5xl"
          />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Cinq étapes, un seul document. Chaque ligne relie une décision de design à sa place dans le flux ATOOPV.
          </p>
        </div>

        <div>
          {EDITORIAL_PROCESS_STAGES.map((stage) => (
            <ProcessRow key={stage.number} stage={stage} />
          ))}
        </div>
      </div>
    </section>
  )
}
