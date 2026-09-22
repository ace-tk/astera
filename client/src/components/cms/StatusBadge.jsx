import { cn } from '@/utils/cn'

/** Draft / Published / Published with unpublished changes / Unpublished / Removed. */
export default function StatusBadge({ status, hasUnpublishedChanges, className }) {
  const [label, tone] =
    status === 'published'
      ? hasUnpublishedChanges
        ? ['Published · unpublished changes', 'border-golden/40 bg-golden/15 text-ink']
        : ['Published', 'border-emerald/30 bg-emerald/10 text-emerald']
      : status === 'archived'
        ? ['Removed', 'border-rose/30 bg-rose/10 text-rose']
        : status === 'unpublished'
          ? ['Unpublished', 'border-ink/15 bg-ink/[0.07] text-ink/70']
          : ['Draft', 'border-ink/12 bg-ink/[0.05] text-ink/70']
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium', tone, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
