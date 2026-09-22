import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileCheck2, Trash2, UploadCloud, X } from 'lucide-react'
import {
  fetchAdminClientReports, uploadAdminClientReport, deleteAdminClientReport, fetchAdminClientReportFile, checkReportFile, formatSize, MAX_REPORT_MB,
} from '@/services/clientReports'
import { useToast } from '@/context/ToastContext'
import PdfViewer from '@/components/common/PdfViewer'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

/** Admin: the PDF reports for one client — upload, view, remove. Nothing else. */
export default function ClientReportsPanel({ customerId }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const key = ['admin', 'customer', customerId, 'client-reports']
  const { data: reports = [], isLoading, isError } = useQuery({ queryKey: key, queryFn: () => fetchAdminClientReports(customerId) })

  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [problem, setProblem] = useState('')
  const [viewing, setViewing] = useState(null) // report
  const [removing, setRemoving] = useState(null) // report
  const fileRef = useRef(null)

  const reset = () => { setUploading(false); setTitle(''); setFile(null); setProblem(''); if (fileRef.current) fileRef.current.value = '' }

  const save = useMutation({
    mutationFn: () => uploadAdminClientReport(customerId, { file, title: title.trim() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); reset(); toast({ title: 'Report uploaded', description: 'The client can now open it from Client Reports.', variant: 'success', color: 'emerald' }) },
    onError: (err) => setProblem(err?.data?.error || 'The report could not be saved. Please try again.'),
  })
  const remove = useMutation({
    mutationFn: (r) => deleteAdminClientReport(r.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: 'Report removed', description: 'The client can no longer open it.', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t remove the report', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  const pick = (f) => { setFile(f || null); setProblem(f ? checkReportFile(f) : '') }
  const submit = (e) => {
    e.preventDefault()
    const msg = checkReportFile(file)
    if (msg) return setProblem(msg)
    setProblem('')
    save.mutate()
  }

  const load = useCallback(() => fetchAdminClientReportFile(viewing.id), [viewing])
  useEffect(() => {
    if (!viewing) return undefined
    const onKey = (e) => e.key === 'Escape' && setViewing(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing])

  return (
    <section aria-label="Client Reports">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4.5 w-4.5 text-muted" />
          <h2 className="font-display text-lg font-medium tracking-tight">Client Reports</h2>
          <span className="text-sm text-muted">({reports.length})</span>
        </div>
        <Button variant="soft" size="sm" magnetic={false} onClick={() => (uploading ? reset() : setUploading(true))}>
          <UploadCloud className="h-4 w-4" /> {uploading ? 'Cancel' : 'Upload PDF'}
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted">PDF reports only this client can open from their Client Reports page.</p>

      {uploading && (
        <form onSubmit={submit} className="mt-4 grid gap-4 rounded-3xl border border-ink/8 bg-card p-5 shadow-soft sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Report name (optional)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Defaults to the file name" aria-label="Report name" className="input" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">PDF file (max {MAX_REPORT_MB} MB)</span>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={(e) => pick(e.target.files?.[0])} aria-label="PDF file" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-ink/[0.06] file:px-3 file:py-2 file:text-sm file:font-medium" />
          </label>
          {problem && <p role="alert" className="text-sm text-rose sm:col-span-2">{problem}</p>}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="accent" size="sm" disabled={!file || save.isPending}>{save.isPending ? 'Saving…' : 'Save report'}</Button>
          </div>
        </form>
      )}

      <div className="mt-4 rounded-3xl border border-ink/8 bg-card shadow-soft">
        {isLoading && <p className="px-5 py-4 text-sm text-muted">Loading…</p>}
        {isError && <p role="alert" className="px-5 py-4 text-sm text-rose">The reports could not be loaded.</p>}
        {!isLoading && !isError && reports.length === 0 && <p className="px-5 py-4 text-sm text-muted">No PDF reports uploaded for this client yet.</p>}
        <ul className="divide-y divide-ink/5">
          {reports.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted">Uploaded {fmtDate(r.createdAt)} · {formatSize(r.sizeBytes)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="soft" size="sm" magnetic={false} onClick={() => setViewing(r)}>View</Button>
                <Button variant="soft" size="sm" magnetic={false} onClick={() => setRemoving(r)} className="!text-rose" aria-label={`Remove ${r.title}`}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {viewing && createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={viewing.title}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onMouseDown={() => setViewing(null)} />
          <div className="relative w-full max-w-5xl rounded-3xl border border-ink/8 bg-paper p-5 shadow-float">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="truncate font-display text-lg font-medium tracking-tight">{viewing.title}</h3>
              <button type="button" onClick={() => setViewing(null)} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-ink/[0.06]"><X className="h-4 w-4" /></button>
            </div>
            <PdfViewer load={load} title={viewing.title} />
          </div>
        </div>,
        document.body,
      )}

      {createPortal(
        <ConfirmDialog
          open={Boolean(removing)}
          onCancel={() => setRemoving(null)}
          onConfirm={() => { const r = removing; setRemoving(null); remove.mutate(r) }}
          icon={Trash2}
          danger
          title="Remove this report?"
          description={`“${removing?.title}” will be deleted and the client will no longer be able to open it.`}
          confirmLabel="Remove report"
        />,
        document.body,
      )}
    </section>
  )
}
