import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import { FAQ_ITEMS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

function FaqRow({ item, index, isOpen, onToggle }) {
  const triggerId = `faq-${item.id}-trigger`
  const panelId = `faq-${item.id}-panel`

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border transition-colors duration-300',
        isOpen ? 'border-ink/12 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]' : 'border-transparent bg-ink/[0.035] hover:bg-ink/[0.055]',
      )}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:gap-5 sm:px-6 sm:py-[1.125rem]"
      >
        <span className="w-4 shrink-0 font-mono text-xs text-ink/35">{String(index + 1)}</span>
        <span className="flex-1 text-[0.9rem] font-medium text-ink sm:text-base">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white"
          aria-hidden="true"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.38, ease: EASE }, opacity: { duration: 0.28, ease: EASE } }}
          >
            <div className="px-5 pb-[1.125rem] pl-[3rem] pr-6 sm:px-6 sm:pb-5 sm:pl-[3.5rem]">
              {item.answer.split('\n').map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted">
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * The reference's own composition, reproduced as a self-contained card: a
 * dark, softly-lit frame (noise texture + a corner glow, both already used
 * elsewhere in the lab) around a light panel carrying its own pill/heading —
 * distinct from the design-test chrome around it, matching the brief's split
 * between "existing lab language around it" and "faithful reproduction
 * inside it."
 */
function FaqPanel() {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-ink p-4 sm:p-8 lg:p-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 18% -10%, rgba(255,255,255,0.16), transparent 60%)' }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.06]" aria-hidden="true" />

      <div className="relative mx-auto max-w-2xl rounded-[1.75rem] bg-gradient-to-b from-white to-[#f1f1ef] p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-10 lg:p-12">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted shadow-sm">
            011
            <span className="h-1 w-1 rounded-full bg-ink/25" aria-hidden="true" />
            FAQS
          </span>
        </div>

        <h3 className="mt-6 text-center font-display text-[1.9rem] font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          Common Questions
        </h3>

        <div className="mt-8 flex flex-col gap-2.5 sm:mt-10">
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={item.id} item={item} index={i} isOpen={openId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-1 text-center sm:mt-10">
          <p className="text-sm text-muted">Have any other questions?</p>
          <button
            type="button"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-opacity hover:opacity-70"
          >
            Contact Us
            <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * COMMON QUESTIONS (Experiment 11) — a close visual reproduction of a
 * supplied FAQ/accordion reference: a large soft panel floating in a dark,
 * softly-lit frame, one open item at a time, the "+" rotating 45° into "×"
 * rather than swapping icons. The lab's own editorial chrome (numeral,
 * eyebrow, heading) leads into it exactly like every other experiment; the
 * panel itself is where visual fidelity to the reference takes priority.
 */
export default function FaqAccordion() {
  return (
    <section id="experiment-11" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="11" eyebrow="EXPERIMENT / 11" titleLines={['COMMON', 'QUESTIONS']} className="mb-14 sm:mb-20" />
        <TechnicalLabel dot={false} className="mb-6 text-muted/50">
          OPEN / CLOSE
        </TechnicalLabel>
        <FaqPanel />
      </div>
    </section>
  )
}
