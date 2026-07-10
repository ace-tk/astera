import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadCloud, FileAudio, Check, Loader2, X, Clapperboard } from 'lucide-react'
import { JOURNEY } from '@/constants/content'
import { accent } from '@/utils/accent'
import Glyph from '@/components/ui/Glyph'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import Waveform from '@/components/landing/Waveform'
import { cn } from '@/utils/cn'

// The AI stages we surface while "processing" (transcript → delivery).
const STAGES = JOURNEY.slice(1)

export default function UploadStudio() {
  const [phase, setPhase] = useState('idle') // idle | ready | processing | done
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState(-1)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const pickFile = (f) => {
    if (!f) return
    setFile({ name: f.name || 'strategy-sync.mp3', size: f.size || 48_200_000 })
    setPhase('ready')
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }, [])

  // Simulated processing pipeline — advances through each stage on a timer.
  useEffect(() => {
    if (phase !== 'processing') return
    if (stage >= STAGES.length) {
      const t = setTimeout(() => setPhase('done'), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStage((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [phase, stage])

  const start = () => {
    setPhase('processing')
    setStage(0)
  }
  const reset = () => {
    setPhase('idle')
    setFile(null)
    setStage(-1)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="eyebrow text-coral">Upload Studio</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Drop a recording. Walk away.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Audio, video, or a raw transcript. Astera diarizes, understands, and
          composes — then pings you when clarity is ready.
        </p>
      </Reveal>

      <AnimatePresence mode="wait">
        {/* IDLE / READY — dropzone */}
        {(phase === 'idle' || phase === 'ready') && (
          <motion.div
            key="drop"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-10"
          >
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                'group relative flex min-h-[20rem] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed bg-card p-10 text-center transition-all',
                dragging ? 'border-coral bg-coral/[0.04] scale-[1.01]' : 'border-ink/12 hover:border-coral/50',
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*,video/*,.txt,.vtt,.srt"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              <motion.div
                animate={{ y: dragging ? -6 : 0 }}
                className="grid h-20 w-20 place-items-center rounded-3xl bg-coral/10 text-coral"
              >
                <UploadCloud className="h-10 w-10" />
              </motion.div>
              <p className="mt-6 font-display text-2xl font-medium tracking-tight">
                {dragging ? 'Release to upload' : 'Drag your meeting here'}
              </p>
              <p className="mt-2 text-sm text-muted">or click to browse · MP3, MP4, WAV, VTT up to 2GB</p>

              {/* faint waveform floor */}
              <div className="pointer-events-none absolute inset-x-8 bottom-6 opacity-[0.12]">
                <Waveform bars={56} height={40} />
              </div>
            </label>

            <AnimatePresence>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 flex items-center gap-4 rounded-2xl border border-ink/8 bg-card p-4 shadow-soft"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-coral/10 text-coral">
                    <FileAudio className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted">{(file.size / 1_000_000).toFixed(1)} MB · ready to process</p>
                  </div>
                  <button onClick={reset} className="text-muted hover:text-ink"><X className="h-4 w-4" /></button>
                  <Button size="sm" variant="accent" onClick={start}>Generate report</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PROCESSING — animated pipeline */}
        {phase === 'processing' && (
          <motion.div
            key="proc"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mt-10 rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <p className="font-display text-xl font-medium">Composing your report…</p>
            </div>
            <div className="mt-8 space-y-1">
              {STAGES.map((s, i) => {
                const a = accent(s.color)
                const done = i < stage
                const activeNow = i === stage
                return (
                  <div key={s.key} className={cn('flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors', activeNow && 'bg-paper')}>
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors',
                        done || activeNow ? cn(a.softBg, a.text) : 'bg-ink/5 text-muted',
                      )}
                    >
                      {done ? <Check className="h-5 w-5" /> : <Glyph name={s.glyph} size={24} />}
                    </span>
                    <div className="flex-1">
                      <p className={cn('text-sm font-medium', !done && !activeNow && 'text-muted')}>{s.title}</p>
                      {activeNow && <p className="text-xs text-muted">{s.body}</p>}
                    </div>
                    {activeNow && (
                      <motion.span layoutId="proc-dot" className={cn('h-2 w-2 rounded-full', a.bg)} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 flex flex-col items-center rounded-[2rem] border border-ink/8 bg-card p-12 text-center shadow-soft"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="grid h-20 w-20 place-items-center rounded-full bg-emerald/12 text-emerald"
            >
              <Check className="h-10 w-10" />
            </motion.span>
            <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">Clarity, delivered.</h2>
            <p className="mt-3 max-w-md text-muted">
              Your intelligence report is ready — 9 decisions, 3 commitments, and 2 risks, all cited back to the moment they were said.
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="accent" onClick={() => navigate('/app/replay/q3-roadmap')}>
                <Clapperboard className="h-4 w-4" /> Watch it build
              </Button>
              <Button variant="soft" onClick={() => navigate('/app/report/q3-roadmap')}>Open report</Button>
              <Button variant="ghost" magnetic={false} onClick={reset}>Upload another</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
