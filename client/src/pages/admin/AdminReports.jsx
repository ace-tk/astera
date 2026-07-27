import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Trash2, ShieldCheck } from 'lucide-react'
import { fetchAdminReports, updateAdminReport, deleteAdminReport } from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import StatusChip from '@/components/admin/StatusChip'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—')

export default function AdminReports() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data: reports = [], isLoading } = useQuery({ queryKey: ['admin', 'reports'], queryFn: () => fetchAdminReports() })
  const [confirm, setConfirm] = useState(null)

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const approve = useMutation({
    mutationFn: (id) => updateAdminReport(id, { reviewStatus: 'approved' }),
    onSuccess: () => { refresh(); toast({ title: 'Report approved', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t approve', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  const remove = useMutation({
    mutationFn: (id) => deleteAdminReport(id),
    onSuccess: () => { refresh(); toast({ title: 'Report deleted', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t delete', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  return (
    <>
      <Reveal>
        <p className="eyebrow text-accent"><ShieldCheck className="h-3.5 w-3.5" /> Admin · Reports</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Review, approve, and manage every report.
        </h1>
      </Reveal>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 font-medium">Title</th>
              <th className="px-5 py-3.5 font-medium">Owner</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Created</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading reports…</td></tr>}
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3.5">
                  <Link to={`/app/admin/reports/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
                </td>
                <td className="px-5 py-3.5 text-muted">{r.owner?.name || '—'}</td>
                <td className="px-5 py-3.5"><StatusChip status={r.reviewStatus} /></td>
                <td className="px-5 py-3.5 text-muted">{fmt(r.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <Button as={Link} to={`/app/admin/reports/${r.id}`} size="sm" variant="soft" magnetic={false}>Open</Button>
                    <Button
                      size="sm"
                      variant="soft"
                      magnetic={false}
                      onClick={() => approve.mutate(r.id)}
                      disabled={r.reviewStatus === 'approved' || approve.isPending}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <button
                      onClick={() => setConfirm(r)}
                      aria-label={`Delete ${r.title}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-rose/40 hover:text-rose"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && reports.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No reports yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-4" onMouseDown={() => setConfirm(null)}
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onMouseDown={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true"
              className="relative w-full max-w-sm rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose/10 text-rose"><Trash2 className="h-5 w-5" /></span>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">Delete this report?</h2>
              <p className="mt-2 text-sm text-muted">“{confirm.title}” will be permanently removed. This can’t be undone.</p>
              <div className="mt-7 flex justify-end gap-2">
                <Button variant="ghost" size="sm" magnetic={false} onClick={() => setConfirm(null)}>Cancel</Button>
                <Button variant="accent" size="sm" className="!bg-rose !shadow-none" onClick={() => { remove.mutate(confirm.id); setConfirm(null) }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
