import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Play, ArrowRight, Sparkles, Info } from 'lucide-react'
import Glyph from '@/components/ui/Glyph'
import Button from '@/components/ui/Button'
import ReportTimeline from '@/components/report/ReportTimeline'
import Waveform from '@/components/landing/Waveform'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const GLYPH = {
  recording: 'mic', transcript: 'text', ai: 'brain', timeline: 'timeline',
  speaker: 'chart', decision: 'report', risk: 'alert', compliance: 'shield',
  summary: 'report', report: 'report',
}

/** A few illustrative transcript lines with the moments AI flagged. */
const TRANSCRIPT = [
  { who: 'Maya O.', at: '12:38', text: 'Let’s commit — we ship the billing rewrite before the pilot.', tag: 'decision' },
  { who: 'Sam K.', at: '12:52', text: 'Agreed. I’ll own the migration timeline.', tag: 'commitment' },
  { who: 'Daniel R.', at: '33:10', text: 'My concern is this could slip the pilot date.', tag: 'risk' },
  { who: 'Priya N.', at: '28:04', text: 'Design will take the migration UX end to end.', tag: 'decision' },
]

const TAG_STYLE = {
  decision: 'text-royal bg-royal/10',
  commitment: 'text-golden bg-golden/12',
  risk: 'text-rose bg-rose/10',
}

function PanelBody({ node, report }) {
  const a = accent(node.color)

  switch (node.kind) {
    case 'recording':
      return (
        <div className="space-y-5">
          <div className="rounded-2xl bg-paper p-5">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{report.title}.mp3</span>
              <span>{report.duration}</span>
            </div>
            <div className="mt-4"><Waveform bars={44} height={56} /></div>
            <div className="mt-4 flex items-center gap-3">
              <button className={cn('grid h-10 w-10 place-items-center rounded-full text-white', a.bg)}>
                <Play className="h-4 w-4" />
              </button>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                <div className={cn('h-full w-1/3 rounded-full', a.bg)} />
              </div>
            </div>
          </div>
          <Meta rows={[['Participants', report.participants.length], ['Format', 'Stereo · 48kHz'], ['Language', 'English']]} />
        </div>
      )
    case 'transcript':
      return (
        <div className="space-y-2.5">
          <p className="text-xs text-muted">Highlighted where the AI found meaning.</p>
          {TRANSCRIPT.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-ink/8 bg-card p-3"
            >
              <div className="flex items-center justify-between text-[0.7rem] text-muted">
                <span className="font-medium text-ink">{l.who}</span>
                <span>{l.at}</span>
              </div>
              <p className="mt-1 text-sm leading-snug">{l.text}</p>
              <span className={cn('mt-2 inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-medium', TAG_STYLE[l.tag])}>
                {l.tag}
              </span>
            </motion.div>
          ))}
        </div>
      )
    case 'ai':
      return (
        <div className="space-y-4">
          <div className={cn('rounded-2xl p-5', a.softBg)}>
            <span className={cn('eyebrow', a.text)}><Sparkles className="h-3.5 w-3.5" /> What Astra understood</span>
            <p className="mt-3 text-sm leading-relaxed">{report.headline}</p>
          </div>
          <Meta
            rows={[
              ['Overall sentiment', report.sentiment],
              ['Talk balance', `${Math.round(report.metrics.talkBalance * 100)}%`],
              ['Entities found', `${report.participants.length} people · 3 systems`],
            ]}
          />
        </div>
      )
    case 'timeline':
      return (
        <div className="rounded-2xl bg-paper p-5">
          <ReportTimeline timeline={report.timeline} duration={report.duration} />
        </div>
      )
    case 'speaker':
      return (
        <div className="space-y-3">
          {report.talkTime.map((t, i) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm">{t.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                <motion.span
                  className={cn('block h-full rounded-full', a.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${t.pct}%` }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-9 text-right text-xs text-muted">{t.pct}%</span>
            </div>
          ))}
        </div>
      )
    case 'decision':
      return (
        <div className="space-y-3">
          {report.decisions.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-ink/8 bg-card p-3.5">
              <p className="text-sm font-medium leading-snug">{d.text}</p>
              <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-muted">
                <span className="chip !py-0.5 text-[0.65rem]">{d.owner}</span>
                <span>{d.at}</span>
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-12 overflow-hidden rounded-full bg-ink/8">
                    <span className={cn('block h-full rounded-full', a.bg)} style={{ width: `${d.confidence * 100}%` }} />
                  </span>
                  {Math.round(d.confidence * 100)}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )
    case 'risk':
      return (
        <div className="space-y-3">
          {report.risks.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-rose/20 bg-rose/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-medium', r.level === 'high' ? 'bg-rose/12 text-rose' : 'bg-orange/12 text-orange')}>
                  {r.level} risk
                </span>
                <span className="text-[0.7rem] text-muted">{r.at}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{r.text}</p>
              <p className="mt-2 flex items-start gap-1.5 text-[0.72rem] leading-relaxed text-muted">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Flagged on risk language and an unresolved owner near this timestamp.
              </p>
            </motion.div>
          ))}
        </div>
      )
    case 'compliance':
      return (
        <div className="space-y-3">
          {report.commitments.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-ink/8 bg-card p-3.5">
              <span className={cn('grid h-8 w-8 place-items-center rounded-lg', a.softBg, a.text)}>
                <Glyph name="shield" size={18} />
              </span>
              <div>
                <p className="text-sm font-medium leading-snug">{c.text}</p>
                <p className="text-[0.7rem] text-muted">{c.owner} · due {c.due}</p>
              </div>
            </div>
          ))}
        </div>
      )
    case 'summary':
      return (
        <div className="space-y-4">
          <p className="font-display text-lg leading-snug tracking-tight text-balance">{report.headline}</p>
          <div className="grid grid-cols-2 gap-2">
            {[['decisions', 'Decisions', 'text-royal'], ['commitments', 'Commitments', 'text-golden'], ['risks', 'Risks', 'text-rose'], ['owners', 'Owners', 'text-purple']].map(([k, l, c]) => (
              <div key={k} className="rounded-xl bg-paper p-3">
                <div className={cn('font-display text-2xl font-semibold', c)}>{report.metrics[k]}</div>
                <div className="text-[0.65rem] text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'report':
      return (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted">
            The full intelligence report is composed and ready — open it in the premium reader, or watch it build itself in Replay.
          </p>
        </div>
      )
    default:
      return null
  }
}

function Meta({ rows }) {
  return (
    <div className="divide-y divide-ink/6 rounded-2xl border border-ink/8">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
          <span className="text-muted">{k}</span>
          <span className="font-medium capitalize">{v}</span>
        </div>
      ))}
    </div>
  )
}

export default function NodePanel({ node, report, onClose }) {
  const navigate = useNavigate()
  const a = node ? accent(node.color) : null

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-20 bg-ink/5 backdrop-blur-[2px]"
          />
          <motion.aside
            key={node.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute right-4 top-4 bottom-4 z-30 flex w-[min(26rem,calc(100%-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-card shadow-float"
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink/8 p-6">
              <div className="flex items-center gap-3">
                <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', a.softBg, a.text)}>
                  <Glyph name={GLYPH[node.kind]} size={28} />
                </span>
                <div>
                  <span className={cn('eyebrow', a.text)}>{node.subtitle}</span>
                  <h2 className="font-display text-xl font-semibold tracking-tight">{node.title}</h2>
                </div>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <PanelBody node={node} report={report} />
            </div>

            <div className="flex gap-2 border-t border-ink/8 p-4">
              <Button variant="accent" size="sm" className="flex-1" onClick={() => navigate(`/app/report/${report.id}`)}>
                Open report <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="soft" size="sm" onClick={() => navigate(`/app/replay/${report.id}`)}>
                Replay
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
