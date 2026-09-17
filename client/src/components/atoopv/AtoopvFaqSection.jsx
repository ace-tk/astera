import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import Reveal from '@/components/ui/Reveal'
import { FAQ_ITEMS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

/**
 * Same accordion behavior as the /design-test FaqAccordion experiment
 * (single item open at a time, height/opacity expand, "+" rotating 45°
 * into "×") — reproduced rather than imported so it can use AtoopV's own
 * theme-aware card colors (`bg-card`) instead of the lab's fixed
 * `bg-white` panel. Content is `FAQ_ITEMS` from constants/designTest.js,
 * unmodified — same questions, answers and order as Design Test page 11.
 */
function FaqRow({ item, index, isOpen, onToggle }) {
  const triggerId = `home-faq-${item.id}-trigger`
  const panelId = `home-faq-${item.id}-panel`

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border transition-colors duration-300',
        isOpen ? 'border-ink/12 bg-card shadow-soft' : 'border-transparent bg-ink/[0.035] hover:bg-ink/[0.055]',
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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
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
 * FAQ — final content section before the footer. Compact by design: a
 * small mono eyebrow (same scale/hierarchy as "Nos formats" in
 * AtoopvOffersTimeline, not a big font-display heading) sitting directly
 * above the accordion, no lead paragraph, no illustration.
 */
export default function AtoopvFaqSection() {
  const [openId, setOpenId] = useState(null)
  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section className="relative border-t border-ink/10 bg-paper py-16 sm:py-20">
      <div className="shell">
        <Reveal>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">FAQ</span>
        </Reveal>

        <Reveal delay={0.05} className="mx-auto mt-6 flex max-w-2xl flex-col gap-2.5 sm:mt-8">
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow key={item.id} item={item} index={i} isOpen={openId === item.id} onToggle={() => toggle(item.id)} />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
