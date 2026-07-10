import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

/**
 * The Astera lockup — a small compass-star mark plus the wordmark. Double-click
 * the mark to launch a paper airplane (a tiny easter egg); the star also spins
 * on hover.
 */
export default function Wordmark({ className, mono = false }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <motion.span
        className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-xl bg-ink text-paper"
        onDoubleClick={() => window.dispatchEvent(new CustomEvent('astera:plane'))}
        whileHover={{ rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        title="Astera"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3l2.2 6.2L20 12l-5.8 2.8L12 21l-2.2-6.2L4 12l5.8-2.8z" fill="currentColor" />
        </svg>
      </motion.span>
      {!mono && <span className="font-display text-lg font-semibold tracking-tight">Astera</span>}
    </span>
  )
}
