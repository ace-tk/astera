import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Share2, Sparkles, AlertTriangle, CheckCircle2, Flag, Clapperboard, BookOpen, Fingerprint, Gauge, PencilLine } from 'lucide-react'
import { useReport } from '@/hooks/useReports'
import { useReportEdits } from '@/hooks/useReportEdits'
import { useToast } from '@/context/ToastContext'
import MeetingDNA from '@/components/dna/MeetingDNA'
import ReviewMode from '@/components/report/ReviewMode'
import { DNA_TRAITS } from '@/constants/demoMeetings'
import { accent } from '@/utils/accent'
import ReportTimeline from '@/components/report/ReportTimeline'
import ReportCover, { wasCovered } from '@/components/report/ReportCover'
import NarratedSummary from '@/components/report/NarratedSummary'
import ReportFeedback from '@/components/report/ReportFeedback'
import ConfidenceDetails from '@/components/report/ConfidenceDetails'
import InfoBadge from '@/components/interview/InfoBadge'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const RISK_STYLE = {
  high: { text: 'text-rose', bg: 'bg-rose/10', label: 'High' },
  medium: { text: 'text-orange', bg: 'bg-orange/10', label: 'Medium' },
  low: { text: 'text-golden', bg: 'bg-golden/10', label: 'Low' },
}

const PRIORITY_BADGE = {
  high: 'bg-rose/10 text-rose',
  medium: 'bg-orange/10 text-orange',
  low: 'bg-emerald/10 text-emerald',
}

export default function Report() {
  const { id } = useParams()
  const { data: report, isLoading } = useReport(id)
  const { edits, save, edited } = useReportEdits(id)
  const { toast } = useToast()
  const [covered, setCovered] = useState(true)
  const [confOpen, setConfOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)

  // Merge the user's Review Mode edits over the report for display.
  const view = useMemo(
    () =>
      report
        ? {
            ...report,
            title: edits.title ?? report.title,
            headline: edits.headline ?? report.headline,
            commitments: edits.commitments ?? report.commitments,
          }
        : report,
    [report, edits],
  )

  // Reveal the cover once per report per session.
  useEffect(() => {
    if (report) setCovered(!wasCovered(report.id))
  }, [report?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // The cover's confidence ring opens this modal via an event.
  useEffect(() => {
    const openConf = () => setConfOpen(true)
    window.addEventListener('astera:confidence', openConf)
    return () => window.removeEventListener('astera:confidence', openConf)
  }, [])

  if (isLoading || !report) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
        <div className="h-24 animate-pulse rounded-3xl bg-card" />
        <div className="h-64 animate-pulse rounded-3xl bg-card" />
      </div>
    )
  }

  const a = accent(report.color)

  return (
    <>
    <AnimatePresence>
      {covered && <ReportCover report={view} onReveal={() => setCovered(false)} />}
    </AnimatePresence>
    <article className="mx-auto max-w-4xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link to="/app/reports" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          <Button as={Link} to={`/app/read/${report.id}`} variant="accent" size="sm"><BookOpen className="h-4 w-4" /> Read</Button>
          <Button as={Link} to={`/app/replay/${report.id}`} variant="soft" size="sm"><Clapperboard className="h-4 w-4" /> Replay</Button>
          <Button variant="soft" size="sm" onClick={() => { setReviewOpen(true) }}><PencilLine className="h-4 w-4" /> Review</Button>
          <Button
            variant="soft"
            size="sm"
            onClick={async () => {
              const url = `${window.location.origin}/app/report/${report.id}`
              try {
                await navigator.clipboard.writeText(url)
                toast({ title: 'Share link copied', description: 'Anyone with the link can read this report.', variant: 'success', color: 'royal' })
              } catch {
                toast({ title: 'Copy that link', description: url, variant: 'info', color: 'royal', duration: 6000 })
              }
            }}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Masthead */}
      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', a.softBg, a.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} /> {report.subtitle}
          </span>
          {edits.priority && (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', PRIORITY_BADGE[edits.priority])}>
              {edits.priority[0].toUpperCase() + edits.priority.slice(1)} priority
            </span>
          )}
          {edited && <span className="rounded-full bg-ink/[0.05] px-3 py-1 text-xs font-medium text-muted">Reviewed</span>}
        </div>
        <h1 className="mt-5 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          {view.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
          <span>{new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span>·</span>
          <span>{report.duration} runtime</span>
          <span>·</span>
          <span>{report.participants.length} participants</span>
        </div>
      </Reveal>

      {/* Lede / AI summary */}
      <Reveal delay={0.1} className="mt-10">
        <div className="relative overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          <span className={cn('eyebrow', a.text)}><Sparkles className="h-3.5 w-3.5" /> Astera summary</span>
          <div className="mt-4">
            <NarratedSummary key={view.headline} text={view.headline} color={report.color} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {report.participants.map((p) => (
              <span key={p} className="chip text-xs">{p}</span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Metric strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['decisions', 'Decisions', 'text-royal'],
          ['commitments', 'Commitments', 'text-golden'],
          ['risks', 'Risks', 'text-rose'],
          ['owners', 'Owners', 'text-purple'],
        ].map(([k, label, c], i) => (
          <Reveal key={k} delay={0.1 + i * 0.05}>
            <div className="rounded-2xl border border-ink/8 bg-card p-5 text-center shadow-soft">
              <div className={cn('font-display text-3xl font-semibold', c)}>{report.metrics[k]}</div>
              <div className="mt-1 text-xs text-muted">{label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Meeting DNA — signature fingerprint */}
      {report.dna && (
        <Reveal delay={0.1} className="mt-14">
          <div className="overflow-hidden rounded-3xl border border-ink/8 bg-card shadow-soft">
            <div className="grid items-center gap-8 p-8 md:grid-cols-[240px_1fr]">
              <div className="grid place-items-center">
                <MeetingDNA dna={report.dna} color={report.color} size={220} showLabels={false} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn('eyebrow', a.text)}><Fingerprint className="h-3.5 w-3.5" /> Meeting DNA</span>
                  <InfoBadge
                    title="Meeting DNA"
                    points={[
                      'Six normalized traits are plotted on radial axes as an SVG polygon — an organic "gene shape" rather than bars.',
                      'The shape is deterministic per meeting, so each fingerprint is recognizable at a glance.',
                      'Rendered as pure SVG with a gradient + glow filter; animates via Framer with a spring, respecting reduced-motion.',
                    ]}
                  />
                </div>
                <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-balance">
                  Every meeting has a fingerprint.
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Astera reads the shape of the conversation — how decisive it was, how much the room
                  collaborated, the energy in it, and how confident the AI is in what it found.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {DNA_TRAITS.map((t) => (
                    <div key={t.key} className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', accent(t.color).bg)} />
                      <span className="text-xs text-muted">{t.label}</span>
                      <span className={cn('ml-auto text-sm font-semibold', accent(t.color).text)}>
                        {t.labelKey ? report.dna[t.labelKey] : `${report.dna[t.key]}%`}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setConfOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-purple/25 bg-purple/[0.06] px-4 py-2 text-sm font-medium text-purple transition-colors hover:bg-purple/10"
                >
                  <Gauge className="h-4 w-4" /> {report.dna.aiConfidence}% AI confidence · view breakdown
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {edits.notes && (
        <Reveal delay={0.05} className="mt-6">
          <div className="rounded-3xl border border-purple/20 bg-purple/[0.04] p-6">
            <span className="eyebrow text-purple"><PencilLine className="h-3.5 w-3.5" /> Your notes</span>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/85">{edits.notes}</p>
          </div>
        </Reveal>
      )}

      <ConfidenceDetails report={report} open={confOpen} onClose={() => setConfOpen(false)} />
      <ReviewMode open={reviewOpen} onClose={() => setReviewOpen(false)} report={report} edits={edits} onSave={save} />

      {/* Timeline */}
      <Reveal delay={0.1} className="mt-14">
        <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          <ReportTimeline timeline={report.timeline} duration={report.duration} />
        </div>
      </Reveal>

      {/* Decisions */}
      <section className="mt-16">
        <h2 className="flex items-center gap-3 font-display text-2xl font-medium tracking-tight">
          <CheckCircle2 className="h-6 w-6 text-royal" /> Decisions
        </h2>
        <div className="mt-6 space-y-3">
          {report.decisions.map((d, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex items-start gap-4 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-royal/10 font-display text-sm font-semibold text-royal">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium leading-snug">{d.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="chip text-xs">Owner · {d.owner}</span>
                    <span>at {d.at}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/8">
                        <span className="block h-full rounded-full bg-royal" style={{ width: `${d.confidence * 100}%` }} />
                      </span>
                      {Math.round(d.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Risks + Commitments two-up */}
      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="flex items-center gap-3 font-display text-2xl font-medium tracking-tight">
            <AlertTriangle className="h-6 w-6 text-rose" /> Risks
          </h2>
          <div className="mt-6 space-y-3">
            {report.risks.map((r, i) => {
              const rs = RISK_STYLE[r.level]
              return (
                <Reveal key={i} delay={i * 0.06}>
                  <div className={cn('rounded-2xl border border-ink/8 bg-card p-5 shadow-soft')}>
                    <div className="flex items-center justify-between">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', rs.bg, rs.text)}>{rs.label} risk</span>
                      <span className="text-xs text-muted">{r.at}</span>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-snug">{r.text}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="flex items-center gap-3 font-display text-2xl font-medium tracking-tight">
            <Flag className="h-6 w-6 text-golden" /> Commitments
          </h2>
          <div className="mt-6 space-y-3">
            {view.commitments.map((c, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-golden/15 text-golden">
                    <Flag className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-snug">{c.text}</p>
                    <p className="mt-1 text-xs text-muted">{c.owner} · due {c.due} · {c.at}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* Talk-time */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-medium tracking-tight">Who held the room</h2>
        <div className="mt-6 space-y-3 rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          {report.talkTime.map((t, i) => (
            <div key={t.name} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm text-ink/80">{t.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                <motion.span
                  className="block h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${t.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm text-muted">{t.pct}%</span>
            </div>
          ))}
        </div>
      </section>

      <ReportFeedback reportId={report.id} />
    </article>
    </>
  )
}
