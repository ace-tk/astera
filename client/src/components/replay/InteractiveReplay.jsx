import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, Quote, ChevronRight } from 'lucide-react'
import { buildMoments } from '@/services/replay'
import { useSound } from '@/context/SoundContext'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const KIND_LABEL = { decision: 'Decision', risk: 'Risk', commitment: 'Commitment', topic: 'Discussion' }

/** Interactive Meeting Replay — a vertical timeline that drives every panel. */
export default function InteractiveReplay({ report }) {
  const moments = useMemo(() => buildMoments(report), [report])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)
  const railRef = useRef(null)
  const { play } = useSound()
  const m = moments[i]
  const a = accent(m.color)
  const speaker = report.talkTime.find((t) => t.name === m.speaker) || { name: m.speaker, pct: 0 }

  const select = (idx) => {
    setI(idx)
    play('tick')
  }

  // Auto-advance when playing.
  useEffect(() => {
    if (!playing) return
    if (i >= moments.length - 1) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setI((v) => v + 1), 2200)
    return () => clearTimeout(t)
  }, [playing, i, moments.length])

  // Keep the active row in view.
  useEffect(() => {
    railRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [i])

  return (
    <div className="mx-auto grid max-w-5xl gap-6 pb-24 lg:grid-cols-[300px_1fr]">
      {/* Left: vertical timeline */}
      <div className="rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-medium tracking-tight">Timeline</h3>
          <button
            onClick={() => { setPlaying((v) => !v); play(playing ? 'close' : 'open') }}
            className={cn('grid h-9 w-9 place-items-center rounded-full text-white transition-transform hover:scale-105', a.bg)}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
        <div ref={railRef} className="relative max-h-[60vh] overflow-y-auto pl-1">
          <div className="absolute bottom-2 left-[9px] top-2 w-px bg-ink/10" />
          {moments.map((mm, idx) => {
            const ma = accent(mm.color)
            const active = idx === i
            return (
              <button
                key={mm.id}
                data-active={active}
                onClick={() => select(idx)}
                className="relative flex w-full items-start gap-3 py-2.5 text-left"
              >
                <span className="relative z-10 mt-0.5">
                  <motion.span
                    className={cn('block h-3.5 w-3.5 rounded-full ring-4 ring-card', active ? ma.bg : 'bg-ink/20')}
                    animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 1.2, repeat: active ? Infinity : 0 }}
                  />
                </span>
                <span className="flex-1">
                  <span className={cn('block font-mono text-[0.7rem]', active ? ma.text : 'text-muted')}>{mm.at}</span>
                  <span className={cn('block text-sm leading-snug', active ? 'font-medium text-ink' : 'text-ink/70')}>{mm.label}</span>
                </span>
                {active && <ChevronRight className={cn('mt-1 h-4 w-4', ma.text)} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: synced detail */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* context bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium', a.softBg, a.text)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} /> {KIND_LABEL[m.kind]}
              </span>
              <span className="font-mono text-sm text-muted">{m.at}</span>
              <span className="text-sm text-muted">·</span>
              <span className="text-sm text-muted">of {report.duration}</span>
            </div>

            {/* transcript excerpt */}
            <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
              <div className="flex items-start gap-4">
                <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-white', a.bg)}>
                  {m.speaker.split(' ').map((w) => w[0]).join('')}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.speaker}</span>
                    <span className="text-xs text-muted">{speaker.pct}% of airtime</span>
                  </div>
                  <Quote className="mt-3 h-5 w-5 text-ink/15" />
                  <p className="mt-1 font-display text-xl leading-snug tracking-tight text-balance">{m.line}</p>
                </div>
              </div>
            </div>

            {/* synced detail card */}
            {m.detail && (
              <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
                <span className={cn('eyebrow', a.text)}>What Astra logged here</span>
                <p className="mt-3 text-base font-medium leading-snug">{m.detail.text}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                  {m.detail.owner && <span className="chip text-xs">Owner · {m.detail.owner}</span>}
                  {m.detail.due && <span>due {m.detail.due}</span>}
                  {m.detail.level && (
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', m.detail.level === 'high' ? 'bg-rose/12 text-rose' : 'bg-orange/12 text-orange')}>
                      {m.detail.level} risk
                    </span>
                  )}
                  {typeof m.detail.confidence === 'number' && (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-ink/8">
                        <span className={cn('block h-full rounded-full', a.bg)} style={{ width: `${m.detail.confidence * 100}%` }} />
                      </span>
                      {Math.round(m.detail.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* mini running tallies up to this point */}
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Decisions so far', report.decisions.filter((d) => d.at <= m.at).length, 'royal'],
                ['Risks so far', report.risks.filter((r) => r.at <= m.at).length, 'rose'],
                ['Commitments', report.commitments.filter((c) => c.at <= m.at).length, 'golden'],
              ].map(([label, val, color]) => (
                <div key={label} className="rounded-2xl border border-ink/8 bg-card p-4 shadow-soft">
                  <div className={cn('font-display text-2xl font-semibold', accent(color).text)}>{val}</div>
                  <div className="text-[0.7rem] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
