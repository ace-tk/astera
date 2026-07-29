import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X, Download, Share2, PencilLine, RefreshCw, Ban, Trash2, ExternalLink, Copy,
  CheckCircle2, AlertTriangle, Flag, Mic, Clock3, Eye,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminFile } from '@/services/files'
import { fileCategoryIcon } from '@/utils/fileCategory'
import StatusChip from '@/components/admin/StatusChip'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')
const fmtSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Right column — file preview + info + quick actions. A persistent 3rd
 * column (not a modal), reusing ReviewMode.jsx's header-chip / labeled-section
 * / footer-actions structure without the fixed-overlay parts.
 */
export default function FilePreviewPanel({ file, onClose, onRename, onArchive, onDelete, onDownload, toast }) {
  const cat = fileCategoryIcon(file.category)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(file.name)

  useEffect(() => {
    setName(file.name)
    setEditing(false)
  }, [file.id, file.name])

  const { data } = useQuery({
    queryKey: ['admin', 'file', file.id],
    queryFn: () => fetchAdminFile(file.id),
  })

  const report = data?.report
  const placeholderAction = (label) => () => toast({ title: `${label} is coming soon`, variant: 'success', color: 'sky' })

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <cat.icon className="h-4 w-4 text-muted" /> File details
        </span>
        <button onClick={onClose} aria-label="Close preview" className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.05] hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Large preview */}
        <div className="grid aspect-video place-items-center rounded-2xl bg-ink/[0.04]">
          <cat.icon className="h-12 w-12 text-muted/60" />
        </div>

        <div className="mt-4">
          {editing ? (
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" autoFocus />
              <Button size="sm" variant="accent" magnetic={false} onClick={() => { onRename(file, name); setEditing(false) }}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
              <Button size="sm" variant="ghost" magnetic={false} onClick={() => { setName(file.name); setEditing(false) }}><X className="h-3.5 w-3.5" /></Button>
            </div>
          ) : (
            <h2 className="truncate font-display text-lg font-medium tracking-tight">{file.name}</h2>
          )}
          <div className="mt-2 flex items-center gap-2">
            <StatusChip status={file.status} />
            <span className="text-xs text-muted">{cat.label}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <QuickAction icon={Download} label="Download" disabled={!file.downloadable} onClick={() => onDownload(file)} />
          <QuickAction icon={Share2} label="Share" onClick={placeholderAction('Sharing')} />
          <QuickAction icon={Copy} label="Copy Link" onClick={placeholderAction('Copy Link')} />
          <QuickAction icon={PencilLine} label="Rename" onClick={() => setEditing(true)} />
          <QuickAction icon={RefreshCw} label="Replace" onClick={placeholderAction('Replace file')} />
          <QuickAction icon={Ban} label={file.archived ? 'Unarchive' : 'Archive'} disabled={file.kind !== 'report'} onClick={() => onArchive(file)} />
        </div>
        <Button variant="ghost" size="sm" magnetic={false} className="mt-2 w-full !text-rose" onClick={() => onDelete(file)}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>

        {/* File information */}
        <div className="mt-6 rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
          <span className="text-xs font-medium uppercase tracking-widest text-muted">File information</span>
          <div className="mt-4 space-y-3">
            <Detail label="File name" value={file.name} />
            <Detail
              label="Customer"
              value={file.customer ? (
                <Link to={`/app/admin/customers/${file.customer.id}`} className="inline-flex items-center gap-1 text-royal hover:underline">
                  {file.customer.name} <ExternalLink className="h-3 w-3" />
                </Link>
              ) : null}
            />
            <Detail label="Uploaded by" value={file.customer?.name} />
            <Detail label="Created date" value={fmtDateTime(file.createdAt)} />
            <Detail label="File size" value={fmtSize(file.sizeBytes)} />
            <Detail label="Report type" value={file.reportType} />
            <Detail label="Meeting date" value={fmtDate(file.meetingDate)} />
          </div>
        </div>

        {/* Report metadata — only for report-kind files */}
        {file.kind === 'report' && report && (
          <div className="mt-4 rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
            <span className="text-xs font-medium uppercase tracking-widest text-muted">Report metadata</span>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={CheckCircle2} label="Decisions" value={report.metrics?.decisions ?? 0} color="text-royal" />
              <Metric icon={AlertTriangle} label="Risks" value={report.metrics?.risks ?? 0} color="text-rose" />
              <Metric icon={Flag} label="Actions" value={report.metrics?.commitments ?? 0} color="text-golden" />
              <Metric icon={Mic} label="Speakers" value={report.participants?.length ?? 0} color="text-purple" />
              <Metric icon={Clock3} label="Duration" value={report.duration || '—'} color="text-sky" />
            </div>
            <Button as={Link} to={`/app/admin/reports/${report.id}`} variant="soft" size="sm" magnetic={false} className="mt-4 w-full">
              <Eye className="h-4 w-4" /> Open full report
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-2xl border border-ink/8 bg-card py-3 text-xs font-medium text-muted transition-colors',
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-ink/20 hover:text-ink',
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      <p className="mt-1 text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-paper p-3 text-center">
      <Icon className={cn('mx-auto h-4 w-4', color)} />
      <div className="mt-1.5 font-display text-lg font-semibold">{value}</div>
      <div className="text-[0.65rem] text-muted">{label}</div>
    </div>
  )
}
