import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="py-2">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-3 text-left"
      >
        <span className="font-display text-base font-medium tracking-tight text-ink sm:text-lg">{item.question}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform duration-300', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 pr-8 text-sm leading-relaxed text-muted text-pretty">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Accordion FAQ — single-open, chevron-rotate reveal. Generic over `items`
 * so any service page with "Questions fréquentes" content can reuse it.
 */
export default function FAQSection({ eyebrow = 'Questions', heading = 'Frequently asked questions', items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div>
      <Reveal className="max-w-2xl">
        <span className="eyebrow">
          <span className="h-px w-8 bg-ink/30" /> {eyebrow}
        </span>
        <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <div className="divide-y divide-ink/8 rounded-3xl border border-ink/8 bg-card px-6 shadow-soft sm:px-8">
          {items.map((item, i) => (
            <FAQItem key={item.question} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </div>
      </Reveal>
    </div>
  )
}
