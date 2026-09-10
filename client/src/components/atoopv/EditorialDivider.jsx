import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * A thin, editorial section divider: an optional two-digit number, a hairline
 * rule that draws itself in on scroll-into-view, and an optional dot marker.
 * Reusable wherever a page already has a natural section boundary — never
 * used to invent one. Text-only content it accepts (`number`) must come
 * from the caller's own existing content/labels.
 */
export default function EditorialDivider({ number, className }) {
  return (
    <div className={cn('flex items-center gap-4', className)} aria-hidden="true">
      {number && <span className="font-display text-xs tabular-nums text-ink/30">{number}</span>}
      <motion.span
        className="h-px flex-1 origin-left bg-ink/8"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
