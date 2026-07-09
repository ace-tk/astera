import { cn } from '@/utils/cn'

/** The Astera lockup — a small compass-star mark plus the wordmark. */
export default function Wordmark({ className, mono = false }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-ink text-paper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3l2.2 6.2L20 12l-5.8 2.8L12 21l-2.2-6.2L4 12l5.8-2.8z" fill="currentColor" />
        </svg>
      </span>
      {!mono && <span className="font-display text-lg font-semibold tracking-tight">Astera</span>}
    </span>
  )
}
