import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Brain, Lightbulb, ShieldCheck, Sparkles } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const HEALTH_STATUS = {
  Excellent: { text: 'text-emerald', bg: 'bg-emerald/[0.10]' },
  Strong: { text: 'text-royal', bg: 'bg-royal/[0.10]' },
  Balanced: { text: 'text-golden', bg: 'bg-golden/[0.10]' },
  'Needs Attention': { text: 'text-rose', bg: 'bg-rose/[0.10]' },
}

function ScoreCounter({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let frame = 0
    let startTime = null
    const duration = 900

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setDisplay(Math.round(progress * value))
      if (progress < 1) {
        frame = window.requestAnimationFrame(step)
      }
    }

    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [value])

  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="font-display text-5xl font-semibold tracking-tight text-ink"
    >
      {display}
    </motion.span>
  )
}

export function buildReportAnalyzerData(report) {
  const decisions = report?.metrics?.decisions ?? 4
  const commitments = report?.metrics?.commitments ?? 3
  const risks = report?.metrics?.risks ?? 1
  const owners = report?.metrics?.owners ?? 2
  const confidence = report?.dna?.aiConfidence ?? 82

  const score = Math.min(99, Math.round(70 + decisions * 2 + commitments + Math.max(0, confidence - 70) / 2 - risks))

  const snapshot = {
    score,
    confidence,
    meetingType: report?.subtitle || 'Strategic Review',
    status: risks > 2 ? 'Needs Attention' : commitments > 3 ? 'Strong' : 'Balanced',
  }

  const analysis = [
    {
      title: 'Strengths',
      icon: ShieldCheck,
      tone: 'text-emerald',
      bullets: [
        decisions >= 5 ? 'Clear strategic alignment across the room' : 'The discussion stayed focused on outcomes',
        owners >= 3 ? 'Ownership is visible and well distributed' : 'Participants stayed engaged through the full review',
      ],
    },
    {
      title: 'Risks',
      icon: AlertTriangle,
      tone: 'text-rose',
      bullets: [
        report?.risks?.[0]?.text || 'A few open items still need a decision owner',
        risks > 1 ? 'Follow-through depends on timely approvals' : 'The path forward remains manageable with light oversight',
      ],
    },
    {
      title: 'Recommendations',
      icon: Lightbulb,
      tone: 'text-golden',
      bullets: [
        commitments >= 3 ? 'Assign one owner to each remaining follow-up' : 'Book a short review to close open questions',
        risks > 1 ? 'Schedule a governance check-in before next steps' : 'Share a concise decision summary with the team',
      ],
    },
  ]

  const health = [
    {
      label: 'Decision Quality',
      status: decisions >= 6 ? 'Excellent' : decisions >= 4 ? 'Strong' : 'Balanced',
      detail: `${decisions} decisions surfaced with clear momentum and ownership.`,
    },
    {
      label: 'Participation',
      status: owners >= 3 ? 'Strong' : 'Balanced',
      detail: `${owners} voices appear to have carried the discussion forward.`,
    },
    {
      label: 'Follow-up Readiness',
      status: commitments >= 3 ? 'Strong' : 'Needs Attention',
      detail: `${commitments} commitments are ready for handoff and tracking.`,
    },
  ]

  return { snapshot, analysis, health }
}

export default function ReportAnalyzer({ report }) {
  const a = accent(report?.color ?? 'royal')
  const data = useMemo(() => buildReportAnalyzerData(report), [report])

  return (
    <Reveal delay={0.12} className="mt-10">
      <section className="overflow-hidden rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
        <div className="flex items-center gap-2">
          <span className={cn('eyebrow', a.text)}>
            <Sparkles className="h-3.5 w-3.5" /> Report Analyzer
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-6">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-muted">Executive Snapshot</span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-ink/8 bg-white/70 p-6 shadow-[0_8px_24px_rgba(17,24,39,0.04)]">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Overall Meeting Score</p>
                <div className="mt-3 flex items-baseline gap-3">
                  <ScoreCounter value={data.snapshot.score} />
                  <span className="text-sm text-muted">/100</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  A compact read on how decisively the room moved from discussion to decisions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  { label: 'AI Confidence', value: `${data.snapshot.confidence}%` },
                  { label: 'Meeting Type', value: data.snapshot.meetingType },
                  { label: 'Meeting Status', value: data.snapshot.status },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-ink/8 bg-card p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">{item.label}</p>
                    <p className="mt-2 font-medium text-ink">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {data.analysis.map((group) => {
              const Icon = group.icon
              return (
                <div key={group.title} className="rounded-2xl border border-ink/8 bg-card p-5 shadow-soft">
                  <div className="flex items-center gap-2">
                    <span className={cn('grid h-8 w-8 place-items-center rounded-full bg-ink/[0.05] text-sm', group.tone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-medium text-ink">{group.title}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                    {group.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', group.tone, 'bg-current')} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="rounded-2xl border border-ink/8 bg-ink/[0.02] p-6">
            <div className="flex items-center gap-2">
              <span className="eyebrow text-muted">Meeting Health</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {data.health.map((item) => {
                const style = HEALTH_STATUS[item.status] || HEALTH_STATUS.Balanced
                return (
                  <div key={item.label} className="rounded-2xl border border-ink/8 bg-card p-4">
                    <p className="text-sm font-medium text-ink">{item.label}</p>
                    <div className={cn('mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium', style.bg, style.text)}>
                      {item.status}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{item.detail}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
