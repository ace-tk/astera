import { cn } from '@/utils/cn'

// Admin status states — a colored dot carries the status, with a dark
// label on a soft tint so every chip clears WCAG AA contrast. Covers report
// review states plus the record states (customers/users/reports lifecycle)
// used across the rest of the Admin Portal.
const REVIEW_STATUS = {
  approved: { label: 'Approved', dot: 'bg-emerald', bg: 'bg-emerald/10' },
  pending: { label: 'Pending Review', dot: 'bg-orange', bg: 'bg-orange/10' },
  draft: { label: 'Draft', dot: 'bg-ink/40', bg: 'bg-ink/[0.06]' },
  published: { label: 'Published', dot: 'bg-emerald', bg: 'bg-emerald/10' },
  archived: { label: 'Archived', dot: 'bg-ink/40', bg: 'bg-ink/[0.06]' },
  active: { label: 'Active', dot: 'bg-emerald', bg: 'bg-emerald/10' },
  disabled: { label: 'Disabled', dot: 'bg-rose', bg: 'bg-rose/10' },
  // Report Requests pipeline.
  pending_review: { label: 'Pending Review', dot: 'bg-orange', bg: 'bg-orange/10' },
  in_progress: { label: 'In Progress', dot: 'bg-sky', bg: 'bg-sky/10' },
  ready: { label: 'Ready', dot: 'bg-golden', bg: 'bg-golden/10' },
  delivered: { label: 'Delivered', dot: 'bg-emerald', bg: 'bg-emerald/10' },
  // All Files — report generation state.
  processing: { label: 'Processing', dot: 'bg-sky', bg: 'bg-sky/10' },
  failed: { label: 'Failed', dot: 'bg-rose', bg: 'bg-rose/10' },
}

export default function StatusChip({ status }) {
  const s = REVIEW_STATUS[status] || REVIEW_STATUS.pending
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-ink', s.bg)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} /> {s.label}
    </span>
  )
}
