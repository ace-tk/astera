import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, Sparkles, ArrowRight, AlertTriangle, Flag, CheckCircle2 } from 'lucide-react'
import { BUILD_STAGES } from '@/services/replay'
import ReportTimeline from '@/components/report/ReportTimeline'
import Waveform from '@/components/landing/Waveform'
import CountUp from '@/components/ui/CountUp'
import Button from '@/components/ui/Button'
import AstraOrb from '@/components/assistant/AstraOrb'
import { useSound } from '@/context/SoundContext'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

// One reveal per build stage index (see BUILD_STAGES).
const AT = { summary: 1, metrics: 2, timeline: 3, speakers: 4, decisions: 5, risks: 6, actions: 7 }

function Section({ show, children, delay = 0 }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StreamLine({ text, active }) {
  const [n, setN] = useState(active ? 0 : text.length)
  useEffect(() => {
    if (!active) return
    if (n >= text.length) return
    const t = setTimeout(() => setN((v) => v + 2), 18)
    return () => clearTimeout(t)
  }, [n, text, active])
  return <>{text.slice(0, n)}{active && n < text.length && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-ink align-middle" />}</>
}

export default function CinematicBuild({ report, onFinish, onSwitchInteractive }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const timers = useRef([])
  const { play } = useSound()
  const navigate = useNavigate()

  const run = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setDone(false)
    setStep(0)
    BUILD_STAGES.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i + 1)
          play('step')
        }, (i + 1) * 1150),
      )
    })
    timers.current.push(
      setTimeout(() => {
        setDone(true)
        play('chime')
        onFinish?.()
      }, (BUILD_STAGES.length + 1) * 1150),
    )
  }

  useEffect(() => {
    run()
    return () => timers.current.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id])

  const current = BUILD_STAGES[Math.min(step, BUILD_STAGES.length - 1)]
  const metrics = useMemo(
    () => [
      ['decisions', 'Decisions', 'royal'],
      ['commitments', 'Commitments', 'golden'],
      ['risks', 'Risks', 'rose'],
      ['owners', 'Owners', 'purple'],
    ],
    [],
  )

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Live status header */}
      <div className="sticky top-0 z-10 -mx-4 mb-8 border-b border-ink/8 bg-paper/80 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <AstraOrb size={34} breathing={!done} />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {done ? (
                <><CheckCircle2 className="h-4 w-4 text-emerald" /> Report composed</>
              ) : (
                <><Loader2 className="h-4 w-4 animate-spin text-purple" /> {current.label}…</>
              )}
            </div>
            {/* progress rail */}
            <div className="mt-2 flex gap-1">
              {BUILD_STAGES.map((s, i) => (
                <div key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/8">
                  <motion.span
                    className={cn('block h-full rounded-full', accent(s.color).bg)}
                    initial={{ width: 0 }}
                    animate={{ width: i < step ? '100%' : i === step ? '60%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              ))}
            </div>
          </div>
          {done && (
            <div className="flex gap-2">
              <Button size="sm" variant="soft" onClick={run}>Replay</Button>
              <Button size="sm" variant="accent" onClick={() => navigate(`/app/report/${report.id}`)}>
                Open reader <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Listening intro */}
      <Section show={step < 1}>
        <div className="flex flex-col items-center py-16 text-center">
          <span className="eyebrow text-coral"><Sparkles className="h-3.5 w-3.5" /> Replay Intelligence</span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Watch the report compose itself.</h2>
          <div className="mt-8 w-full max-w-md"><Waveform bars={52} height={64} /></div>
        </div>
      </Section>

      <div className="space-y-8">
        {/* Executive summary */}
        <Section show={step >= AT.summary}>
          <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
            <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> Executive summary</span>
            <p className="mt-4 font-display text-2xl font-medium leading-snug tracking-tight">
              <StreamLine text={report.headline} active={step === AT.summary} />
            </p>
          </div>
        </Section>

        {/* Metrics */}
        <Section show={step >= AT.metrics}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map(([k, label, color]) => (
              <div key={k} className="rounded-2xl border border-ink/8 bg-card p-5 text-center shadow-soft">
                <CountUp value={report.metrics[k]} className={cn('font-display text-3xl font-semibold', accent(color).text)} />
                <div className="mt-1 text-xs text-muted">{label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Timeline */}
        <Section show={step >= AT.timeline}>
          <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
            <ReportTimeline timeline={report.timeline} duration={report.duration} />
          </div>
        </Section>

        {/* Speakers */}
        <Section show={step >= AT.speakers}>
          <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
            <h3 className="font-display text-lg font-medium tracking-tight">Who held the room</h3>
            <div className="mt-5 space-y-3">
              {report.talkTime.map((t, i) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm">{t.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/8">
                    <motion.span className="block h-full rounded-full bg-sky" initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.8, delay: i * 0.07 }} />
                  </div>
                  <span className="w-9 text-right text-xs text-muted">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Decisions */}
        <Section show={step >= AT.decisions}>
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-medium tracking-tight"><CheckCircle2 className="h-5 w-5 text-royal" /> Decisions</h3>
            <div className="mt-4 space-y-2.5">
              {report.decisions.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between gap-4 rounded-2xl border border-ink/8 bg-card p-4 shadow-soft">
                  <span className="text-sm font-medium">{d.text}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                    <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink/8"><motion.span className="block h-full rounded-full bg-royal" initial={{ width: 0 }} animate={{ width: `${d.confidence * 100}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }} /></span>
                    {Math.round(d.confidence * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Risks */}
        <Section show={step >= AT.risks}>
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-medium tracking-tight"><AlertTriangle className="h-5 w-5 text-rose" /> Risks</h3>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {report.risks.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12 }} className="rounded-2xl border border-rose/20 bg-rose/[0.03] p-4">
                  <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-medium', r.level === 'high' ? 'bg-rose/12 text-rose' : 'bg-orange/12 text-orange')}>{r.level} risk</span>
                  <p className="mt-2 text-sm font-medium">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Action items slide up */}
        <Section show={step >= AT.actions}>
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-medium tracking-tight"><Flag className="h-5 w-5 text-golden" /> Action items</h3>
            <div className="mt-4 space-y-2.5">
              {report.commitments.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }} className="flex items-center gap-3 rounded-2xl border border-ink/8 bg-card p-4 shadow-soft">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-golden/15 text-golden"><Flag className="h-4 w-4" /></span>
                  <div className="flex-1"><p className="text-sm font-medium">{c.text}</p><p className="text-xs text-muted">{c.owner} · due {c.due}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Completion */}
        <Section show={done}>
          <div className="flex flex-col items-center rounded-3xl border border-ink/8 bg-card p-10 text-center shadow-soft">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="grid h-16 w-16 place-items-center rounded-full bg-emerald/12 text-emerald">
              <Check className="h-8 w-8" />
            </motion.span>
            <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">From conversation to clarity.</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">Your report is composed. Read it in the premium reader, or scrub the meeting moment by moment.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="accent" onClick={() => navigate(`/app/report/${report.id}`)}>Open reader <ArrowRight className="h-4 w-4" /></Button>
              <Button variant="soft" onClick={onSwitchInteractive}>Scrub the meeting</Button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
