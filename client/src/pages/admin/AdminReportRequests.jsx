import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Inbox, Search, Clock, Loader2, FileCheck2, PackageCheck, Layers } from 'lucide-react'
import { fetchAdminRequests } from '@/services/admin'
import { REPORT_TYPES, DELIVERY_MODES, REQUEST_STATUSES } from '@/constants/reportRequests'
import StatusChip from '@/components/admin/StatusChip'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const STATUS_LABEL = { pending_review: 'Pending Review', in_progress: 'In Progress', ready: 'Ready', delivered: 'Delivered' }

const CARDS = [
  { key: 'pending_review', label: 'Pending Review', icon: Inbox, color: 'text-orange' },
  { key: 'in_progress', label: 'In Progress', icon: Loader2, color: 'text-sky' },
  { key: 'ready', label: 'Ready', icon: FileCheck2, color: 'text-golden' },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck, color: 'text-emerald' },
  { key: 'total', label: 'Total Requests', icon: Layers, color: 'text-purple' },
]

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—')

export default function AdminReportRequests() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [reportType, setReportType] = useState('')
  const [deliveryMode, setDeliveryMode] = useState('')

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin', 'report-requests', { status, reportType, deliveryMode }],
    queryFn: () => fetchAdminRequests({ status, reportType, deliveryMode }),
  })

  const view = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return requests
    return requests.filter((r) =>
      [r.meetingName, r.customerNotes, r.customer?.name, r.customer?.email].filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }, [requests, query])

  const counts = useMemo(() => {
    const c = { pending_review: 0, in_progress: 0, ready: 0, delivered: 0, total: requests.length }
    requests.forEach((r) => { if (c[r.status] !== undefined) c[r.status] += 1 })
    return c
  }, [requests])

  return (
    <>
      <Reveal>
        <p className="eyebrow text-accent"><Inbox className="h-3.5 w-3.5" /> Admin · Report Requests</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every customer ask, from request to delivery.
        </h1>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <c.icon className={cn('h-5 w-5', c.color)} />
              <div className="mt-3 font-display text-4xl font-semibold tracking-tight">{counts[c.key]}</div>
              <p className="mt-1 text-sm text-muted">{c.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by meeting, customer, or notes…"
            aria-label="Search report requests"
            className="h-11 w-full rounded-full border border-ink/8 bg-card pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent">
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} aria-label="Filter by category" className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent">
          <option value="">All categories</option>
          {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} aria-label="Filter by delivery mode" className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent">
          <option value="">All delivery modes</option>
          {DELIVERY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Meeting</th>
              <th className="px-5 py-3.5 font-medium">Type</th>
              <th className="px-5 py-3.5 font-medium">Delivery</th>
              <th className="px-5 py-3.5 font-medium">Meeting Date</th>
              <th className="px-5 py-3.5 font-medium">Submitted</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">
                <Clock className="mx-auto mb-2 h-5 w-5 animate-pulse" /> Loading requests…
              </td></tr>
            )}
            {view.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{r.customer?.name || '—'}</p>
                  <p className="text-xs text-muted">{r.customer?.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Link to={`/app/admin/report-requests/${r.id}`} className="font-medium hover:underline">{r.meetingName}</Link>
                </td>
                <td className="px-5 py-3.5 text-muted">{r.reportType}</td>
                <td className="px-5 py-3.5 text-muted">{r.deliveryMode}</td>
                <td className="px-5 py-3.5 text-muted">{r.meetingDate || '—'}</td>
                <td className="px-5 py-3.5 text-muted">{fmt(r.createdAt)}</td>
                <td className="px-5 py-3.5"><StatusChip status={r.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end">
                    <Button as={Link} to={`/app/admin/report-requests/${r.id}`} size="sm" variant="soft" magnetic={false}>Open</Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && view.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-muted">No report requests match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
