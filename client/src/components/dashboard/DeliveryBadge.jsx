import { Flame } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Delivery-mode badge — Urgent stands out immediately (red, flame icon, "High
 * Priority"); Normal stays quiet so it never competes for attention. Shared by
 * the customer's request cards and the admin's Report Requests views.
 */
export default function DeliveryBadge({ mode, className }) {
  const urgent = mode === 'Urgent'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
        urgent ? 'bg-rose/10 font-semibold text-rose' : 'bg-ink/[0.05] text-muted',
        className,
      )}
    >
      {urgent && <Flame className="h-3 w-3" />} {mode}{urgent && ' · High Priority'}
    </span>
  )
}
