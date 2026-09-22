import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileCheck2 } from 'lucide-react'
import { fetchMyClientReports, formatSize } from '@/services/clientReports'
import Button from '@/components/ui/Button'

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

/** The signed-in client's reports (PDFs uploaded for them). The server returns only their own. */
export default function ClientReports() {
  const { data: reports = [], isLoading, isError } = useQuery({ queryKey: ['client-reports', 'mine'], queryFn: fetchMyClientReports })

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-emerald">Library</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Client Reports</h1>
      <p className="mt-2 text-sm text-muted">Reports prepared for you. Open one to read it here.</p>

      <div className="mt-6 space-y-3">
        {isLoading && [0, 1].map((i) => <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-card" />)}
        {isError && <p role="alert" className="rounded-2xl border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">Your reports could not be loaded. Please try again.</p>}
        {!isLoading && !isError && reports.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-muted">No reports have been shared with you yet.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-card p-4 shadow-soft">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald/10 text-emerald"><FileCheck2 className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.title}</p>
              <p className="text-xs text-muted">Uploaded {fmtDate(r.createdAt)} · {formatSize(r.sizeBytes)}</p>
            </div>
            <Button as={Link} to={`/app/client-reports/${r.id}`} size="sm" variant="soft" magnetic={false}>View</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
