import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Workflow, Fingerprint, Clapperboard, ListVideo, BookOpen, ArrowRight, ArrowLeft, X, Sparkles,
} from 'lucide-react'
import AstraOrb from '@/components/assistant/AstraOrb'
import Waveform from '@/components/landing/Waveform'
import Button from '@/components/ui/Button'
import { useSound } from '@/context/SoundContext'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const KEY = 'astera:onboarded'

const STEPS = [
  { icon: Workflow, color: 'purple', title: 'The Workspace', body: 'Every meeting becomes a connected map — recording, transcript, decisions, risks, and report. Open any step to see what Astra found.', to: '/app', cta: 'Open the canvas' },
  { icon: Fingerprint, color: 'royal', title: 'Meeting DNA', body: 'ATOOPV reads the shape of a conversation — how decisive it was, how much the room collaborated, its energy — and draws a fingerprint unique to every meeting.', to: '/app/report/board-fy26', cta: 'See a fingerprint' },
  { icon: Clapperboard, color: 'coral', title: 'Cinematic Replay', body: 'Never watch a spinner. Watch the report compose itself — the summary writes, metrics count up, the timeline draws, and findings slide into place.', to: '/app/replay/board-fy26', cta: 'Watch it build' },
  { icon: ListVideo, color: 'emerald', title: 'Scrub the meeting', body: 'A living timeline you can move through — transcript, speaker, decisions, and running tallies update the moment you land on any point.', to: '/app/replay/board-fy26', cta: 'Try the replay' },
  { icon: Sparkles, color: 'purple', title: 'Ask ASTRA', body: 'A living assistant, grounded in the meeting. Ask who spoke most, why something is a risk, or what was decided — answers come straight from the report.', to: '/app/report/board-fy26', cta: 'Meet Astra', astra: true },
  { icon: BookOpen, color: 'golden', title: 'Read it like a magazine', body: 'A premium reader with search, bookmarks, sticky notes, a minimap, and focus mode — because a report is only useful if people actually read it.', to: '/app/read/board-fy26', cta: 'Open the reader' },
]

/** Paper sheets assembling — the welcome illustration. */
function PaperStack() {
  return (
    <div className="relative mx-auto h-40 w-52">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 + i * 6, rotate: 0 }}
          animate={{ opacity: 1, y: -i * 8, rotate: (i - 1) * 6 }}
          transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 120, damping: 14 }}
          className="absolute inset-x-6 top-6 h-32 rounded-2xl border border-ink/8 bg-card shadow-lift"
          style={{ zIndex: 3 - i }}
        >
          <div className="space-y-2 p-4">
            <div className="h-2 w-1/2 rounded-full bg-ink/10" />
            <div className="h-1.5 w-full rounded-full bg-ink/6" />
            <div className="h-1.5 w-4/5 rounded-full bg-ink/6" />
            {i === 0 && <div className="pt-2"><Waveform bars={20} height={22} /></div>}
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 14 }}
        className="absolute -right-1 -top-2 z-10"
      >
        <AstraOrb size={44} />
      </motion.div>
    </div>
  )
}

export default function Onboarding() {
  const [phase, setPhase] = useState(null) // null | 'welcome' | 'tour'
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { play } = useSound()

  // Show on first ever app visit; also re-triggerable via a global event.
  useEffect(() => {
    if (!location.pathname.startsWith('/app')) return
    if (localStorage.getItem(KEY) !== '1') setPhase('welcome')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const relaunch = () => { setStep(0); setPhase('welcome'); play('open') }
    window.addEventListener('astera:tour', relaunch)
    return () => window.removeEventListener('astera:tour', relaunch)
  }, [play])

  const finish = () => {
    localStorage.setItem(KEY, '1')
    setPhase(null)
    play('chime')
  }
  const dismiss = () => {
    localStorage.setItem(KEY, '1')
    setPhase(null)
    play('close')
  }

  const s = STEPS[step]
  const a = s ? accent(s.color) : null

  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] grid place-items-center p-4"
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={dismiss} />

          {phase === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-ink/10 bg-card p-10 text-center shadow-float"
            >
              <PaperStack />
              <span className="eyebrow mt-8 justify-center text-purple"><Sparkles className="h-3.5 w-3.5" /> Welcome to ATOOPV</span>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance">
                Let’s replay one meeting together.
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-muted">
                ATOOPV turns conversations into clarity. Take the 60-second tour, or jump
                straight into six real meetings — nothing to upload.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button variant="accent" onClick={() => { setPhase('tour'); setStep(0); play('step') }}>
                  Take the tour <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="soft" onClick={() => { finish(); navigate('/app/demos') }}>
                  Explore demos
                </Button>
              </div>
              <button onClick={dismiss} className="mt-5 text-xs text-muted underline-offset-2 hover:underline">
                Skip for now
              </button>
            </motion.div>
          )}

          {phase === 'tour' && (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-ink/10 bg-card p-8 shadow-float"
            >
              <button onClick={dismiss} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink" aria-label="Skip tour">
                <X className="h-4 w-4" />
              </button>

              <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', a.softBg, a.text)}>
                <s.icon className="h-7 w-7" />
              </span>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted">
                <span className="font-mono">{String(step + 1).padStart(2, '0')}</span> / {String(STEPS.length).padStart(2, '0')}
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>

              {/* progress dots */}
              <div className="mt-6 flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={cn('h-1.5 rounded-full transition-all', i === step ? cn('w-6', a.bg) : 'w-1.5 bg-ink/15 hover:bg-ink/30')}
                    aria-label={`Step ${i + 1}`}
                  />
                ))}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <button
                  onClick={() => (step === 0 ? setPhase('welcome') : setStep(step - 1))}
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      finish()
                      if (s.astra) setTimeout(() => window.dispatchEvent(new CustomEvent('astera:open')), 300)
                      navigate(s.to)
                    }}
                  >
                    {s.cta}
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button size="sm" onClick={() => { setStep(step + 1); play('tick') }}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="accent" size="sm" onClick={() => { finish(); navigate('/app/demos') }}>
                      Finish <Sparkles className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
