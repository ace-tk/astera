import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadCloud, Search, Trash2, AlertTriangle, Inbox } from 'lucide-react'
import { useReports, useUpdateReport, useDeleteReport } from '@/hooks/useReports'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { isDemoId } from '@/services/mockData'
import { fetchMyRequests } from '@/services/reportRequests'
import ReportCard from '@/components/dashboard/ReportCard'
import StatusChip from '@/components/admin/StatusChip'
import EmptyState from '@/components/common/EmptyState'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const SUMMARY = [
  { label: 'Reports this month', value: '18', accent: 'text-royal', bar: 'bg-royal' },
  { label: 'Decisions captured', value: '214', accent: 'text-purple', bar: 'bg-purple' },
  { label: 'Open commitments', value: '7', accent: 'text-golden', bar: 'bg-golden' },
  { label: 'Follow-through', value: '87%', accent: 'text-emerald', bar: 'bg-emerald' },
]

// Sort options for the reports list.
const SORTS = {
  recent: { label: 'Newest first', fn: (a, b) => new Date(b.date) - new Date(a.date) },
  oldest: { label: 'Oldest first', fn: (a, b) => new Date(a.date) - new Date(b.date) },
  title: { label: 'Title A–Z', fn: (a, b) => (a.title || '').localeCompare(b.title || '') },
  decisions: { label: 'Most decisions', fn: (a, b) => (b.metrics?.decisions || 0) - (a.metrics?.decisions || 0) },
}

// Frontend search over the fetched reports — title, summary, company, tags.
const matches = (r, q) =>
  [r.title, r.headline, r.subtitle, r.category, ...(r.participants || []), ...(r.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(q)

export default function Overview() {
  const { data: reports = [], isLoading } = useReports()
  const { isAuthed } = useAuth()
  const { toast } = useToast()
  const { data: myRequests = [] } = useQuery({
    queryKey: ['reports', 'my-requests'],
    queryFn: fetchMyRequests,
    enabled: isAuthed,
  })
  // Once delivered, the report itself shows up below — no need to keep it here.
  const openRequests = myRequests.filter((r) => r.status !== 'delivered')
  const updateReport = useUpdateReport()
  const deleteReport = useDeleteReport()

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('recent')
  const [confirm, setConfirm] = useState(null) // report pending delete

  const view = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? reports.filter((r) => matches(r, q)) : reports
    return [...filtered].sort(SORTS[sort].fn)
  }, [reports, query, sort])

  const editableOf = (r) => isAuthed && !isDemoId(r.id)

  const rename = (r, title) =>
    updateReport.mutate(
      { id: r.id, patch: { title } },
      {
        onSuccess: () => toast({ title: 'Renamed', description: `Now “${title}”.`, variant: 'success', color: 'emerald' }),
        onError: (err) =>
          toast({
            title: 'Couldn’t rename',
            description: err?.status === 404 ? 'This report is no longer available.' : 'Please try again.',
            variant: 'warn',
            color: 'rose',
          }),
      },
    )

  const doDelete = () => {
    const r = confirm
    setConfirm(null)
    deleteReport.mutate(r.id, {
      onSuccess: () => toast({ title: 'Report deleted', description: `“${r.title}” is gone.`, variant: 'success', color: 'emerald' }),
      onError: (err) =>
        toast({
          title: 'Couldn’t delete',
          description: err?.status === 404 ? 'This report is no longer available.' : 'Please try again.',
          variant: 'warn',
          color: 'rose',
        }),
    })
  }

  const [featured, ...rest] = view

  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow">Good afternoon, Maya</p>
        <h1 className="mt-3 max-w-2xl font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every conversation, understood.
        </h1>
      </Reveal>

      {/* Summary tiles */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUMMARY.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <div className={cn('font-display text-4xl font-semibold tracking-tight', s.accent)}>{s.value}</div>
              <p className="mt-2 text-sm text-muted">{s.label}</p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink/8">
                <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${60 + i * 10}%` }} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* My Requests — in-flight Report Requests, until delivered */}
      {openRequests.length > 0 && (
        <Reveal className="mt-10">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 font-display text-lg font-medium tracking-tight">
              <Inbox className="h-4.5 w-4.5 text-orange" /> My requests
            </h2>
            <div className="mt-4 space-y-2">
              {openRequests.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.meetingName}</p>
                    <p className="mt-0.5 text-xs text-muted">{r.reportType} · submitted {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <StatusChip status={r.status} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Search + sort */}
      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            aria-label="Search reports"
            className="h-11 w-full rounded-full border border-ink/8 bg-card pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort reports"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          {Object.entries(SORTS).map(([k, s]) => (
            <option key={k} value={k}>{s.label}</option>
          ))}
        </select>
      </div>

      {view.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            color="royal"
            icon={Search}
            title="No matching reports."
            description={`Nothing matches “${query}”. Try a different title, participant, or keyword.`}
          />
        </div>
      ) : (
        <>
          {/* Featured / latest */}
          <div className="mt-10 flex items-end justify-between">
            <h2 className="font-display text-2xl font-medium tracking-tight">
              {query ? 'Top match' : sort === 'recent' ? 'Latest report' : 'Reports'}
            </h2>
            <span className="text-sm text-muted">{view.length} report{view.length === 1 ? '' : 's'}</span>
          </div>
          <Reveal className="mt-5">
            {featured && (
              <ReportCard
                report={featured}
                featured
                editable={editableOf(featured)}
                onRename={(t) => rename(featured, t)}
                onDelete={() => setConfirm(featured)}
              />
            )}
          </Reveal>
          {isLoading && <p className="mt-4 text-sm text-muted">Gathering your intelligence…</p>}

          {rest.length > 0 && (
            <>
              <h2 className="mt-14 font-display text-2xl font-medium tracking-tight">More</h2>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {rest.map((r, i) => (
                  <Reveal key={r.id} delay={i * 0.06}>
                    <ReportCard
                      report={r}
                      editable={editableOf(r)}
                      onRename={(t) => rename(r, t)}
                      onDelete={() => setConfirm(r)}
                    />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            onMouseDown={() => setConfirm(null)}
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onMouseDown={(e) => e.stopPropagation()}
              role="alertdialog"
              aria-modal="true"
              className="relative w-full max-w-sm rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose/10 text-rose">
                <Trash2 className="h-5 w-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">Delete this report?</h2>
              <p className="mt-2 text-sm text-muted">
                “{confirm.title}” will be permanently removed from your workspace. This can’t be undone.
              </p>
              <div className="mt-7 flex justify-end gap-2">
                <Button variant="ghost" size="sm" magnetic={false} onClick={() => setConfirm(null)}>Cancel</Button>
                <Button variant="accent" size="sm" onClick={doDelete} className="!bg-rose !shadow-none">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
