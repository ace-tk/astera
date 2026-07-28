import { Calendar, CalendarClock } from 'lucide-react'
import { categoryIcon } from '@/utils/reportCategory'
import { estimatedDelivery } from '@/constants/reportRequests'
import StatusChip from '@/components/admin/StatusChip'
import RequestTimeline from './RequestTimeline'
import DeliveryBadge from './DeliveryBadge'

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

/** A richer "My Requests" card — icons, an urgent-priority badge, an estimated
 * delivery window, and a compact stage timeline. Same card, more hierarchy. */
export default function RequestCard({ request }) {
  const cat = categoryIcon(request.reportType)
  const eta = estimatedDelivery(request.deliveryMode)

  return (
    <div className="rounded-2xl border border-ink/8 bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink/[0.05] text-muted">
            <CalendarClock className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{request.meetingName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {cat && (
                <span className="inline-flex items-center gap-1"><cat.icon className="h-3.5 w-3.5" /> {request.reportType}</span>
              )}
              <DeliveryBadge mode={request.deliveryMode} />
              {request.meetingDate && (
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmt(request.meetingDate)}</span>
              )}
              <span>Submitted {fmt(request.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusChip status={request.status} />
          {eta && request.status !== 'delivered' && (
            <span className="text-[0.7rem] text-muted">Est. delivery: {eta}</span>
          )}
        </div>
      </div>

      <RequestTimeline status={request.status} className="mt-4" />
    </div>
  )
}
