import { cn } from '@/utils/cn'

// The three admin review states.
const REVIEW_STATUS = {
  approved: { label: 'Approved', cls: 'bg-emerald/10 text-emerald' },
  pending: { label: 'Pending Review', cls: 'bg-orange/10 text-orange' },
  draft: { label: 'Draft', cls: 'bg-ink/[0.06] text-muted' },
}

export default function StatusChip({ status }) {
  const s = REVIEW_STATUS[status] || REVIEW_STATUS.pending
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', s.cls)}>{s.label}</span>
}
