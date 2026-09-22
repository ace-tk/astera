import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'
import { inlineFormat } from '@/cms/inlineFormat'

function FAQItem({ item, isOpen, onToggle, isLast, richAnswers }) {
  return (
    <div className={cn('py-4', !isLast && 'border-b border-ink/8')}>
      <button onClick={onToggle} aria-expanded={isOpen} className="group flex w-full items-center justify-between gap-4 text-left">
        <span
          className={cn(
            'font-display text-base font-medium tracking-tight transition-colors duration-300 sm:text-lg',
            isOpen ? 'text-royal' : 'text-ink group-hover:text-royal',
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-all duration-300', isOpen ? 'rotate-180 text-royal' : 'text-ink/30 group-hover:text-royal/60')}
        />
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
            <p className="pr-8 pt-3 text-sm leading-relaxed text-muted text-pretty">{(richAnswers && inlineFormat(item.answer)) || item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Accordion FAQ — single-open, chevron-rotate reveal. Generic over `items`
 * so any service page with "Questions fréquentes" content can reuse it.
 * Editorial rules (a top border plus a divider between items) instead of a
 * bordered/shadowed card panel — the page's own background shows through.
 *
 * `richAnswers` (CMS pages only) shows bold / italic / underline written in an answer;
 * without it, answers are plain text exactly as before.
 */
export default function FAQSection({ eyebrow = 'Questions', heading = 'Frequently asked questions', items, richAnswers = false }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div>
      <Reveal className="max-w-2xl">
        <span className="eyebrow">
          <span className="h-px w-8 bg-ink/30" /> {eyebrow}
        </span>
        <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{heading}</h2>
      </Reveal>

      <Reveal delay={0.05} className="mt-8 border-t border-ink/8">
        {items.map((item, i) => (
          <FAQItem key={item.question} item={item} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} isLast={i === items.length - 1} richAnswers={richAnswers} />
        ))}
      </Reveal>
    </div>
  )
}
