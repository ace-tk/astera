import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Paperclip, Download, ArrowRight, Calendar, Clock3 } from 'lucide-react'
import {
  fetchAdminRequest, updateAdminRequestStatus, createReportFromRequest,
  updateAdminReport, fetchRequestAttachmentUrl, downloadRequestAttachment,
} from '@/services/admin'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import ReportComposer from '@/components/admin/ReportComposer'
import StatusChip from '@/components/admin/StatusChip'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'

const NEXT_STATUS = { pending_review: 'in_progress', in_progress: 'ready' }
const NEXT_LABEL = { pending_review: 'Mark In Progress', in_progress: 'Mark Ready' }

const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')

export default function AdminReportRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data: req, isLoading, isError } = useQuery({
    queryKey: ['admin', 'report-request', id],
    queryFn: () => fetchAdminRequest(id),
    retry: false,
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'report-request', id] })
    qc.invalidateQueries({ queryKey: ['admin', 'report-requests'] })
  }

  const advanceStatus = useMutation({
    mutationFn: (status) => updateAdminRequestStatus(id, status),
    onSuccess: () => { refresh(); toast({ title: 'Status updated', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t update status', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  const [creating, setCreating] = useState(false)
  const createAndMaybePublish = async (payload, publish) => {
    setCreating(true)
    try {
      const report = await createReportFromRequest(id, payload)
      if (publish) await updateAdminReport(report.id, { publishStatus: 'published' })
      refresh()
      toast({ title: publish ? 'Report published' : 'Draft saved', variant: 'success', color: 'emerald' })
      navigate(`/app/admin/reports/${report.id}`)
    } catch (err) {
      toast({ title: 'Couldn’t save the report', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setCreating(false)
    }
  }

  // Lazily load the attachment as a blob URL for inline preview.
  const [attachment, setAttachment] = useState(null)
  useEffect(() => {
    if (!req?.attachment?.gridFsId) return
    let url
    fetchRequestAttachmentUrl(id, token)
      .then((res) => { url = res.url; setAttachment(res) })
      .catch(() => {})
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [req?.attachment?.gridFsId, id, token])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
        <div className="h-40 animate-pulse rounded-3xl bg-card" />
      </div>
    )
  }

  if (isError || !req) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div>
          <h2 className="font-display text-xl font-semibold">Request not found</h2>
          <Button as={Link} to="/app/admin/report-requests" variant="soft" size="sm" className="mt-5"><ArrowLeft className="h-4 w-4" /> Back to requests</Button>
        </div>
      </div>
    )
  }

  const next = NEXT_STATUS[req.status]
  const mime = req.attachment?.mimeType || ''
  const previewable = mime.startsWith('audio/') || mime.startsWith('video/') || mime === 'application/pdf'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/app/admin/report-requests" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>
        {next && (
          <Button variant="soft" size="sm" magnetic={false} onClick={() => advanceStatus.mutate(next)} disabled={advanceStatus.isPending}>
            <ArrowRight className="h-4 w-4" /> {NEXT_LABEL[req.status]}
          </Button>
        )}
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={req.status} />
          <span className="text-sm text-muted">{req.customer?.name || 'Unknown'} ({req.customer?.email || '—'})</span>
        </div>
        <h1 className="mt-4 font-display text-display-sm font-semibold leading-[1.05] tracking-tight text-balance">{req.meetingName}</h1>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <div className="grid gap-4 rounded-3xl border border-ink/8 bg-card p-6 shadow-soft sm:grid-cols-2">
          <Detail label="Report type" value={req.reportType} />
          <Detail label="Delivery mode" value={req.deliveryMode} />
          <Detail label="Meeting date" value={req.meetingDate} icon={Calendar} />
          <Detail label="Meeting time" value={req.meetingTime} icon={Clock3} />
          <Detail label="Submitted" value={fmtDateTime(req.createdAt)} />
          <Detail label="Customer" value={`${req.customer?.name || '—'} · ${req.customer?.email || '—'}`} />
        </div>
      </Reveal>

      {req.customerNotes && (
        <Reveal delay={0.08} className="mt-6">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <span className="text-xs font-medium uppercase tracking-widest text-muted">Customer notes</span>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-ink/85">{req.customerNotes}</p>
          </div>
        </Reveal>
      )}

      {req.attachment?.fileName && (
        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Paperclip className="h-4 w-4 text-muted" /> {req.attachment.fileName}
              </span>
              <Button
                variant="soft" size="sm" magnetic={false}
                onClick={() => downloadRequestAttachment(id, req.attachment.fileName, token)}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted">Uploaded {fmtDateTime(req.createdAt)} · {((req.attachment.sizeBytes || 0) / 1_000_000).toFixed(1)} MB</p>
            {previewable && attachment && (
              <div className="mt-4">
                {mime.startsWith('audio/') && <audio controls src={attachment.url} className="w-full" />}
                {mime.startsWith('video/') && <video controls src={attachment.url} className="w-full rounded-2xl" />}
                {mime === 'application/pdf' && <iframe title="Attachment preview" src={attachment.url} className="h-[32rem] w-full rounded-2xl border border-ink/8" />}
              </div>
            )}
          </div>
        </Reveal>
      )}

      <Reveal delay={0.12} className="mt-10">
        {req.report ? (
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <p className="font-display text-lg font-medium tracking-tight">A report has already been created for this request.</p>
            <p className="mt-1 text-sm text-muted">Continue editing, saving draft changes, or publishing it from the report editor.</p>
            <Button as={Link} to={`/app/admin/reports/${req.report}`} variant="accent" size="sm" className="mt-4">
              Open report editor <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-medium tracking-tight">Create the report</h2>
            <p className="mt-1 text-sm text-muted">Author the report for this request. Save it as a draft, or publish it straight to the customer.</p>
            <div className="mt-6">
              <ReportComposer
                initial={{ title: req.meetingName, reportType: req.reportType, deliveryMode: req.deliveryMode }}
                saving={creating}
                onSaveDraft={(payload) => createAndMaybePublish(payload, false)}
                onPublish={(payload) => createAndMaybePublish(payload, true)}
              />
            </div>
          </div>
        )}
      </Reveal>
    </div>
  )
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <p className="mt-1 text-sm font-medium">{value || '—'}</p>
    </div>
  )
}
