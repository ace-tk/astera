import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadCloud, FileAudio, Check, Loader2, X, Clapperboard, AlertTriangle, Inbox, Sparkles } from 'lucide-react'
import { JOURNEY } from '@/constants/content'
import { config } from '@/config'
import { accent } from '@/utils/accent'
import { api } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { submitReportRequest } from '@/services/reportRequests'
import { REPORT_TYPES, DELIVERY_MODES, REQUEST_STATUSES, estimatedDelivery } from '@/constants/reportRequests'
import Glyph from '@/components/ui/Glyph'
import Button from '@/components/ui/Button'
import Waveform from '@/components/landing/Waveform'
import StudioPanel from '@/components/studio/StudioPanel'
import { cn } from '@/utils/cn'

// The AI stages we surface while "processing" (transcript → delivery). These are
// the exact stages the backend emits over the socket during a real analysis, so
// the same visual reflects real server progress for signed-in users.
const STAGES = JOURNEY.slice(1)
const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s.key, i]))

// Everything the backend can ingest: recordings (transcribed by Deepgram),
// transcripts, and documents (DOCX/PDF, text-extracted).
const SUPPORTED_EXTS = ['mp3', 'mp4', 'wav', 'm4a', 'txt', 'vtt', 'srt', 'md', 'docx', 'pdf']
const SUPPORTED_RE = new RegExp(`\\.(${SUPPORTED_EXTS.join('|')})$`, 'i')

const PHASE_LABEL = { idle: 'Idle', ready: 'Ready', processing: 'Processing', done: 'Complete' }

/** Turn an API/network error into a friendly, honest message. */
function friendlyError(err) {
  // Prefer the backend's own message (unsupported type, too large, transcription
  // failed / not configured / timed out, no readable text, etc.).
  if (err?.data?.error) return err.data.error
  if (err?.status === 401) return 'Your session has expired. Please sign in again to generate a report.'
  if (err?.status >= 500) return 'Something went wrong on our side. Please try again.'
  if (err?.message === 'Failed to fetch' || /networkerror/i.test(err?.message || ''))
    return 'Network error — check your connection and try again.'
  return err?.message || 'Upload failed. Please try again.'
}

const humanize = (s) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export default function UploadStudio() {
  const { isAuthed, user } = useAuth()
  const [mode, setMode] = useState('instant') // instant | request
  const [phase, setPhase] = useState('idle') // idle | ready | processing | done
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState(-1)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const socketRef = useRef(null)
  const navigate = useNavigate()

  const pickFile = (f) => {
    if (!f) return
    setError('')
    setFile(f) // keep the real File so signed-in users upload its actual bytes
    setPhase('ready')
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0])
  }, [])

  // Demo pipeline (guests only) — the original simulated walk-through. Signed-in
  // users are driven by real server events instead, never a timer.
  useEffect(() => {
    if (isAuthed || phase !== 'processing') return
    if (stage >= STAGES.length) {
      const t = setTimeout(() => setPhase('done'), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStage((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [phase, stage, isAuthed])

  // Never leak the progress socket if we unmount mid-upload.
  useEffect(() => () => socketRef.current?.disconnect(), [])

  const reset = () => {
    setPhase('idle')
    setFile(null)
    setStage(-1)
    setError('')
  }

  // Guests: compose a sample report (demo mode, unchanged).
  const startDemo = () => {
    setPhase('processing')
    setStage(0)
  }

  // Signed-in users: a real upload → transcribe/extract → analysis → saved report.
  const startReal = async (f) => {
    const name = f.name || ''
    if (!SUPPORTED_RE.test(name)) {
      setError('Unsupported file type. Upload MP3, MP4, WAV, M4A, TXT, DOCX, or PDF.')
      return
    }
    if (f.size === 0) {
      setError('That file looks empty. Upload a recording, transcript, or document with content.')
      return
    }

    setError('')
    setPhase('processing')
    setStage(0)

    // Live real-time progress: the backend emits a `report:stage` event per
    // pipeline step, and also persists the current stage against `jobId` (see
    // GET /reports/progress/:jobId) so that if the socket drops and
    // reconnects mid-upload, we resync instead of losing stages. The upload
    // itself never depends on the socket either way — it's driven by the
    // request lifecycle below regardless of realtime delivery.
    const jobId = crypto.randomUUID()
    let connectedOnce = false
    try {
      const socket = io(config.socketUrl, {
        auth: { userId: user?.id },
        path: config.socketPath,
        // WebSocket stays the preferred transport (Vercel: long-polling isn't reliable across serverless
        // instances). `tryAllTransports` is what makes the second entry a real fallback: without it Socket.IO
        // never leaves the first transport, so a host that can't pass WebSocket upgrades (e.g. behind
        // Passenger/Apache on shared hosting) would get no live progress at all. Polling is safe on a single
        // Node process; if neither works the request lifecycle + /reports/progress/:jobId still finish the job.
        transports: ['websocket', 'polling'],
        tryAllTransports: true,
      })
      socket.on('connect', async () => {
        if (!connectedOnce) {
          connectedOnce = true
          return
        }
        // Reconnected mid-upload — recover whatever stage(s) we missed while disconnected.
        try {
          const { status } = await api.get(`/reports/progress/${jobId}`)
          const idx = STAGE_INDEX[status?.stage]
          if (idx != null) setStage((cur) => Math.max(cur, idx))
        } catch {
          /* recovery is best-effort — the request lifecycle still drives completion */
        }
      })
      socket.on('report:stage', ({ stage: s }) => {
        const idx = STAGE_INDEX[s]
        if (idx != null) setStage((cur) => Math.max(cur, idx))
      })
      socket.on('connect_error', () => {}) // a dropped connection still auto-reconnects; nothing to do here
      socketRef.current = socket
    } catch {
      /* progress is best-effort */
    }

    try {
      const form = new FormData()
      form.append('media', f) // backend reads the transcript text server-side
      form.append('title', name.replace(/\.[^.]+$/, ''))
      form.append('jobId', jobId)
      const { report } = await api.post('/reports', form)
      setStage(STAGES.length) // mark every stage complete
      socketRef.current?.disconnect()
      navigate(`/app/report/${report.id}`)
    } catch (err) {
      socketRef.current?.disconnect()
      setPhase('ready')
      setError(friendlyError(err))
    }
  }

  const start = () => {
    if (!file) return
    if (isAuthed) startReal(file)
    else startDemo()
  }

  const requestMode = mode === 'request' && isAuthed
  const instantMode = mode === 'instant'
  const doneCount = Math.min(Math.max(stage, 0), STAGES.length)
  const currentStage = STAGES[Math.min(Math.max(stage, 0), STAGES.length - 1)]
  const modeCopy = isAuthed
    ? 'Upload a transcript — TXT, VTT, or SRT. ATOOPV analyzes it with its heuristic engine and saves the report to your workspace.'
    : 'Audio, video, or a raw transcript. In production, ATOOPV transcribes and analyses it; here, it composes a sample report you can explore end to end.'

  return (
    <div className="flex min-h-full flex-col lg:h-full">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/10 bg-card/60 px-4 py-2.5 lg:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-coral">Upload Studio</p>
          <h1 className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight">Drop a recording. Walk away.</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald/25 bg-emerald/[0.06] px-2 py-1 text-[11px] font-medium text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            {isAuthed ? 'Live · saved to your workspace' : 'Demo mode · sample analysis'}
          </span>
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-paper px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/70"
          >
            <span className="text-ink/35">State</span>
            {requestMode ? 'Request form' : phase === 'processing' ? `Processing ${Math.min(stage + 1, STAGES.length)}/${STAGES.length}` : PHASE_LABEL[phase]}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
        {/* ── Stage ─────────────────────────────────────────── */}
        <section
          aria-label="Studio stage"
          className="flex min-h-[26rem] min-w-0 flex-col bg-grid-faint p-3 [background-size:24px_24px] sm:p-4 lg:min-h-0 lg:overflow-y-auto lg:p-6"
        >
          <StageFrame
            title={requestMode ? 'Request form' : phase === 'processing' ? 'Processing' : phase === 'done' ? 'Result' : 'Source'}
            meta={requestMode ? 'Manual report' : file ? `${(file.size / 1_000_000).toFixed(1)} MB` : 'No file selected'}
          >
            {requestMode && <RequestReportForm />}

            {instantMode && !requestMode && (
              <AnimatePresence mode="wait">
                {/* IDLE / READY — dropzone */}
                {(phase === 'idle' || phase === 'ready') && (
                  <motion.div
                    key="drop"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="flex flex-1 flex-col gap-3 p-3 sm:p-4"
                  >
                    <label
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragging(true)
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      className={cn(
                        'group relative flex min-h-[15rem] flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                        dragging ? 'border-coral bg-coral/[0.05]' : 'border-ink/15 bg-paper/60 hover:border-coral/50',
                      )}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept="audio/*,video/*,.txt,.vtt,.srt,.docx,.pdf"
                        className="hidden"
                        onChange={(e) => pickFile(e.target.files?.[0])}
                      />
                      <motion.div
                        animate={{ y: dragging ? -6 : 0 }}
                        className="grid h-16 w-16 place-items-center rounded-xl bg-coral/10 text-coral"
                      >
                        <UploadCloud className="h-8 w-8" />
                      </motion.div>
                      <p className="mt-5 font-display text-xl font-medium tracking-tight">
                        {dragging ? 'Release to upload' : 'Drag your meeting here'}
                      </p>
                      <p className="mt-1.5 text-[13px] text-muted">or click to browse · audio, video, TXT, DOCX, PDF up to 100MB</p>

                      {/* faint waveform floor */}
                      <div className="pointer-events-none absolute inset-x-8 bottom-5 opacity-[0.12]">
                        <Waveform bars={56} height={36} />
                      </div>
                    </label>

                    <AnimatePresence>
                      {file && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 rounded-lg border border-ink/10 bg-card p-3"
                        >
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-coral/10 text-coral">
                            <FileAudio className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted">{(file.size / 1_000_000).toFixed(1)} MB · ready to process</p>
                          </div>
                          <button onClick={reset} aria-label="Remove file" className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink">
                            <X className="h-4 w-4" />
                          </button>
                          <Button size="sm" variant="accent" className="shrink-0 rounded-md" onClick={start}>Generate report</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Friendly error surface (empty / unsupported / upload / network / server). */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          role="alert"
                          className="flex items-start gap-3 rounded-lg border border-coral/30 bg-coral/[0.07] p-3.5 text-sm text-coral"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                          <p>{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* PROCESSING — live status; the full stage list lives in panel 03 */}
                {phase === 'processing' && (
                  <motion.div
                    key="proc"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <p className="font-display text-xl font-medium">
                      {isAuthed ? 'Analyzing your meeting…' : 'Composing a sample report…'}
                    </p>
                    {currentStage && (
                      <div className="max-w-sm">
                        <p className="text-sm font-medium">{currentStage.title}</p>
                        <p className="mt-0.5 text-[13px] text-muted">{currentStage.body}</p>
                      </div>
                    )}
                    <div className="w-full max-w-sm">
                      <div className="h-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={STAGES.length} aria-valuenow={doneCount} aria-label="Analysis progress">
                        <motion.div
                          className="h-full rounded-full bg-accent"
                          animate={{ width: `${(doneCount / STAGES.length) * 100}%` }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                        Stage {Math.min(stage + 1, STAGES.length)} of {STAGES.length}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* DONE */}
                {phase === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-1 flex-col items-center justify-center p-8 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="grid h-16 w-16 place-items-center rounded-full bg-emerald/12 text-emerald"
                    >
                      <Check className="h-8 w-8" />
                    </motion.span>
                    <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight">Sample report ready.</h2>
                    <p className="mt-2 max-w-md text-sm text-muted">
                      Here’s an example of what ATOOPV produces — decisions, commitments, and risks,
                      each tied back to a moment in the meeting. Open it to explore the full experience.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      <Button size="sm" variant="accent" className="rounded-md" onClick={() => navigate('/app/replay/q3-roadmap')}>
                        <Clapperboard className="h-4 w-4" /> Watch it build
                      </Button>
                      <Button size="sm" variant="soft" className="rounded-md" onClick={() => navigate('/app/report/q3-roadmap')}>Open report</Button>
                      <Button size="sm" variant="ghost" magnetic={false} className="rounded-md" onClick={reset}>Upload another</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </StageFrame>
        </section>

        {/* ── Control rail ──────────────────────────────────── */}
        <aside
          aria-label="Studio controls"
          className="min-w-0 border-t border-ink/10 bg-card/40 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0"
        >
          <div className="grid items-start gap-3 p-3 pb-6 sm:p-4 md:grid-cols-2 lg:grid-cols-1 lg:pb-24">
            <StudioPanel index="01" title="Mode">
              {isAuthed && (
                <div role="group" aria-label="Studio mode" className="flex flex-col gap-1.5">
                  <ModeButton active={mode === 'instant'} onClick={() => setMode('instant')} icon={Sparkles}>Instant AI Report</ModeButton>
                  <ModeButton active={mode === 'request'} onClick={() => setMode('request')} icon={Inbox}>Request a Report</ModeButton>
                </div>
              )}
              <p className={cn('text-[12.5px] leading-relaxed text-muted', isAuthed && 'mt-3')}>
                {requestMode ? 'Our team will draft your report and publish it here once it’s ready.' : modeCopy}
              </p>
            </StudioPanel>

            {requestMode ? (
              <StudioPanel index="02" title="Request lifecycle">
                <ol className="space-y-2">
                  {REQUEST_STATUSES.map((s, i) => (
                    <li key={s} className="flex items-center gap-2.5 text-[12.5px]">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-ink/12 font-mono text-[10px] text-ink/50">{i + 1}</span>
                      <span className="text-ink/80">{humanize(s)}</span>
                    </li>
                  ))}
                </ol>
                <dl className="mt-3 space-y-1.5 border-t border-ink/8 pt-3 text-[12.5px]">
                  {DELIVERY_MODES.map((m) => (
                    <div key={m} className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted">{m}</dt>
                      <dd className="text-ink/80">{estimatedDelivery(m)}</dd>
                    </div>
                  ))}
                </dl>
              </StudioPanel>
            ) : (
              <>
                <StudioPanel index="02" title="Source">
                  <dl className="space-y-2 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-muted">File</dt>
                      <dd className="min-w-0 truncate text-ink/85" title={file?.name}>{file ? file.name : 'No file selected'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted">Size</dt>
                      <dd className="text-ink/85">{file ? `${(file.size / 1_000_000).toFixed(1)} MB` : '—'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted">Status</dt>
                      <dd className="text-ink/85">{file ? (phase === 'ready' ? 'Ready to process' : PHASE_LABEL[phase]) : 'Waiting for input'}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 border-t border-ink/8 pt-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Accepted</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {SUPPORTED_EXTS.map((ext) => (
                        <span key={ext} className="rounded border border-ink/10 bg-paper px-1.5 py-0.5 font-mono text-[10.5px] uppercase text-ink/60">{ext}</span>
                      ))}
                    </div>
                    <p className="mt-2 text-[12px] text-muted">Up to 100MB</p>
                  </div>
                </StudioPanel>

                <StudioPanel
                  index="03"
                  title="Pipeline"
                  aside={<span className="font-mono text-[10px] tabular-nums text-muted">{doneCount}/{STAGES.length}</span>}
                  className="md:col-span-2 lg:col-span-1"
                >
                  <ol className="space-y-0.5">
                    {STAGES.map((s, i) => {
                      const a = accent(s.color)
                      const done = i < stage
                      const activeNow = i === stage && phase === 'processing'
                      return (
                        <li key={s.key} className={cn('flex items-start gap-2.5 rounded-md px-1.5 py-1.5 transition-colors', activeNow && 'bg-paper')}>
                          <span
                            className={cn(
                              'mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors',
                              done || activeNow ? cn(a.softBg, a.text) : 'bg-ink/5 text-muted',
                            )}
                          >
                            {done ? <Check className="h-3.5 w-3.5" /> : <Glyph name={s.glyph} size={16} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-[12.5px] font-medium leading-6', !done && !activeNow && 'text-muted')}>{s.title}</p>
                            {activeNow && <p className="text-[11.5px] leading-snug text-muted">{s.body}</p>}
                          </div>
                          {activeNow && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', a.bg)}
                            />
                          )}
                        </li>
                      )
                    })}
                  </ol>
                </StudioPanel>

                <StudioPanel index="04" title="Output" className="md:col-span-2 lg:col-span-1">
                  <dl className="space-y-2 text-[12.5px]">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted">Destination</dt>
                      <dd className="text-ink/85">{isAuthed ? 'Your workspace' : 'Sample report'}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-muted">Mode</dt>
                      <dd className="text-ink/85">{isAuthed ? 'Live' : 'Demo · sample analysis'}</dd>
                    </div>
                  </dl>
                  {isAuthed && <p className="mt-3 border-t border-ink/8 pt-3 text-[12px] leading-relaxed text-muted">The finished report opens automatically when analysis completes.</p>}
                </StudioPanel>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

/** The stage's bordered frame: caption bar + crop marks, like a canvas artboard. */
function StageFrame({ title, meta, children }) {
  return (
    <div className="relative flex flex-1 flex-col rounded-lg border border-ink/12 bg-card shadow-[0_1px_0_rgba(17,24,39,0.03)]">
      <span className="pointer-events-none absolute -left-1.5 -top-1.5 h-3 w-3 border-l border-t border-ink/35" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-1.5 -top-1.5 h-3 w-3 border-r border-t border-ink/35" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b border-l border-ink/35" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b border-r border-ink/35" aria-hidden="true" />
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink/8 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        <span className="text-ink/70">{title}</span>
        <span className="truncate">{meta}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function ModeButton({ active, icon: Icon, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-full items-center gap-2.5 rounded-md border px-3 text-[13px] font-medium transition-colors',
        active ? 'border-ink bg-ink text-paper' : 'border-ink/10 bg-paper text-ink/70 hover:border-ink/25 hover:text-ink',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" /> {children}
    </button>
  )
}

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'

/** The "Request a Report" intake form — no AI runs here; it creates a Report
 * Request that an admin picks up and manually authors (see Admin > Report
 * Requests). Attachment is optional; the customer describes the meeting. */
function RequestReportForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [meetingName, setMeetingName] = useState('')
  const [reportType, setReportType] = useState(REPORT_TYPES[0])
  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODES[0])
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!meetingName.trim()) {
      setError('Give the meeting a name so we know what to draft.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('meetingName', meetingName)
      form.append('reportType', reportType)
      form.append('deliveryMode', deliveryMode)
      if (meetingDate) form.append('meetingDate', meetingDate)
      if (meetingTime) form.append('meetingTime', meetingTime)
      if (customerNotes) form.append('customerNotes', customerNotes)
      if (file) form.append('media', file)
      await submitReportRequest(form)
      toast({ title: 'Request submitted successfully', description: 'Our team will draft your report and publish it here once it’s ready.', variant: 'success', color: 'emerald' })
      navigate('/app/reports')
    } catch (err) {
      setError(err?.data?.error || 'Couldn’t submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col">
      <div className="grid gap-x-4 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">
        <label className="block sm:col-span-2">
          <span className={LABEL}>Meeting name</span>
          <input value={meetingName} onChange={(e) => setMeetingName(e.target.value)} className="input !rounded-md" placeholder="e.g. Q4 Board Sync" />
        </label>
        <label className="block">
          <span className={LABEL}>Report type</span>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input !rounded-md">
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Delivery mode</span>
          <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} className="input !rounded-md">
            {DELIVERY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={LABEL}>Meeting date</span>
          <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="input !rounded-md" />
        </label>
        <label className="block">
          <span className={LABEL}>Meeting time</span>
          <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="input !rounded-md" />
        </label>
        <label className="block sm:col-span-2">
          <span className={LABEL}>Notes for our team</span>
          <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={3} className="input resize-none !rounded-md" placeholder="Anything we should know before drafting this report…" />
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-ink/15 bg-paper/60 p-3 transition-colors hover:border-coral/50 sm:col-span-2">
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-coral/10 text-coral"><UploadCloud className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{file ? file.name : 'Attach a recording or document (optional)'}</span>
            <span className="block text-xs text-muted">{file ? `${(file.size / 1_000_000).toFixed(1)} MB` : 'Audio, video, or a document — up to 100MB'}</span>
          </span>
          {file && (
            <button onClick={(e) => { e.preventDefault(); setFile(null) }} aria-label="Remove attachment" className="shrink-0 text-muted hover:text-ink"><X className="h-4 w-4" /></button>
          )}
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-coral/30 bg-coral/[0.07] p-3.5 text-sm text-coral sm:col-span-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{error}</p>
          </div>
        )}
      </div>

      <div className="mt-auto flex justify-end border-t border-ink/8 px-4 py-3 sm:px-5">
        <Button size="sm" variant="accent" className="rounded-md" onClick={submit} disabled={submitting}>
          <Inbox className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit request'}
        </Button>
      </div>
    </motion.div>
  )
}
