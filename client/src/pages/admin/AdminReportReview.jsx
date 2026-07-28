import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PencilLine, Check, X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { fetchAdminReport, updateAdminReport } from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import ReviewMode from '@/components/report/ReviewMode'
import ReportComposer from '@/components/admin/ReportComposer'
import StatusChip from '@/components/admin/StatusChip'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'

export default function AdminReportReview() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [reviewOpen, setReviewOpen] = useState(false)

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['admin', 'report', id],
    queryFn: () => fetchAdminReport(id),
    retry: false,
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'report', id] })
    qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
  }

  const setStatus = useMutation({
    mutationFn: (reviewStatus) => updateAdminReport(id, { reviewStatus }),
    onSuccess: (_r, reviewStatus) => {
      refresh()
      toast({ title: reviewStatus === 'approved' ? 'Report approved' : 'Report rejected', variant: 'success', color: reviewStatus === 'approved' ? 'emerald' : 'rose' })
    },
    onError: () => toast({ title: 'Couldn’t update status', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  const saveEdits = async (next) => {
    await updateAdminReport(id, { title: next.title, headline: next.headline, commitments: next.commitments })
    refresh()
  }

  const [composerOpen, setComposerOpen] = useState(false)
  const [composerSaving, setComposerSaving] = useState(false)
  const saveComposer = async (payload, publish) => {
    setComposerSaving(true)
    try {
      await updateAdminReport(id, { ...payload, publishStatus: publish ? 'published' : 'draft' })
      refresh()
      setComposerOpen(false)
      toast({ title: publish ? 'Report published successfully' : 'Draft saved', variant: 'success', color: 'emerald' })
    } catch (err) {
      toast({ title: 'Couldn’t save', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setComposerSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
        <div className="h-40 animate-pulse rounded-3xl bg-card" />
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div>
          <h2 className="font-display text-xl font-semibold">Report not found</h2>
          <Button as={Link} to="/app/admin/reports" variant="soft" size="sm" className="mt-5"><ArrowLeft className="h-4 w-4" /> Back to reports</Button>
        </div>
      </div>
    )
  }

  // Admin-authored reports (created from a Report Request) use the draft/
  // publish workflow and the structured composer; AI-generated reports keep
  // today's reviewStatus approve/reject + ReviewMode flow, untouched.
  const isAuthored = Boolean(report.request)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/app/admin/reports" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          {isAuthored ? (
            <Button variant="soft" size="sm" magnetic={false} onClick={() => setComposerOpen((v) => !v)}>
              <PencilLine className="h-4 w-4" /> {composerOpen ? 'Close editor' : 'Edit'}
            </Button>
          ) : (
            <>
              <Button variant="soft" size="sm" magnetic={false} onClick={() => setReviewOpen(true)}><PencilLine className="h-4 w-4" /> Edit</Button>
              <Button variant="soft" size="sm" magnetic={false} onClick={() => setStatus.mutate('draft')} disabled={setStatus.isPending}><X className="h-4 w-4" /> Reject</Button>
              <Button variant="accent" size="sm" magnetic={false} onClick={() => setStatus.mutate('approved')} disabled={setStatus.isPending || report.reviewStatus === 'approved'}><Check className="h-4 w-4" /> Approve</Button>
            </>
          )}
        </div>
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={isAuthored ? report.publishStatus : report.reviewStatus} />
          {isAuthored && report.reportType && <span className="chip text-xs">{report.reportType}</span>}
          <span className="text-sm text-muted">Owner · {report.owner?.name || 'Unknown'} ({report.owner?.email || '—'})</span>
        </div>
        <h1 className="mt-4 font-display text-display-sm font-semibold leading-[1.05] tracking-tight text-balance">{report.title}</h1>
      </Reveal>

      {isAuthored && composerOpen && (
        <Reveal delay={0.05} className="mt-8">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <ReportComposer
              initial={report}
              saving={composerSaving}
              onSaveDraft={(payload) => saveComposer(payload, false)}
              onPublish={(payload) => saveComposer(payload, true)}
            />
          </div>
        </Reveal>
      )}

      {/* Summary */}
      <Reveal delay={0.05} className="mt-8">
        <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
          <span className="text-xs font-medium uppercase tracking-widest text-muted">Executive summary</span>
          <p className="mt-3 leading-relaxed text-ink/85">{report.headline}</p>
        </div>
      </Reveal>

      {/* Metric strip */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ['decisions', 'Decisions', CheckCircle2, 'text-royal'],
          ['risks', 'Risks', AlertTriangle, 'text-rose'],
          ['commitments', 'Action items', Flag, 'text-golden'],
        ].map(([k, label, Icon, color]) => (
          <div key={k} className="rounded-2xl border border-ink/8 bg-card p-4 text-center shadow-soft">
            <Icon className={`mx-auto h-5 w-5 ${color}`} />
            <div className="mt-2 font-display text-2xl font-semibold">{report.metrics?.[k] ?? 0}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Action items */}
      {report.commitments?.length > 0 && (
        <Reveal delay={0.05} className="mt-8">
          <h2 className="flex items-center gap-2 font-display text-xl font-medium tracking-tight"><Flag className="h-5 w-5 text-golden" /> Action items</h2>
          <div className="mt-4 space-y-2">
            {report.commitments.map((c, i) => (
              <div key={i} className="rounded-2xl border border-ink/8 bg-card p-4 shadow-soft">
                <p className="text-sm font-medium">{c.text}</p>
                <p className="mt-1 text-xs text-muted">{c.owner} · due {c.due}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {isAuthored && (
        <Reveal delay={0.05} className="mt-8">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <span className="text-xs font-medium uppercase tracking-widest text-muted">Report details</span>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Meeting type" value={report.meetingType} />
              <Detail label="Client / Organization" value={report.clientOrg} />
              <Detail label="Meeting owner" value={report.meetingOwner} />
              <Detail label="Language" value={report.language} />
              <Detail label="Delivery mode" value={report.deliveryMode} />
              <Detail label="Duration" value={report.duration} />
            </div>
            {report.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {report.tags.map((t) => <span key={t} className="chip text-xs">{t}</span>)}
              </div>
            )}
            {report.complianceNotes && (
              <div className="mt-5">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">Compliance notes</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{report.complianceNotes}</p>
              </div>
            )}
            {report.riskNotes && (
              <div className="mt-5">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">Risk notes</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{report.riskNotes}</p>
              </div>
            )}
            {report.reportContent && (
              <div className="mt-5">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">Report content</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{report.reportContent}</p>
              </div>
            )}
          </div>
        </Reveal>
      )}

      <ReviewMode open={reviewOpen} onClose={() => setReviewOpen(false)} report={report} edits={{}} onSave={saveEdits} mode="cloud" />
    </div>
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
