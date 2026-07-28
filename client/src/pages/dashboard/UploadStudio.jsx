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
import { REPORT_TYPES, DELIVERY_MODES } from '@/constants/reportRequests'
import Glyph from '@/components/ui/Glyph'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import Waveform from '@/components/landing/Waveform'
import { cn } from '@/utils/cn'

// The AI stages we surface while "processing" (transcript → delivery). These are
// the exact stages the backend emits over the socket during a real analysis, so
// the same visual reflects real server progress for signed-in users.
const STAGES = JOURNEY.slice(1)
const STAGE_INDEX = Object.fromEntries(STAGES.map((s, i) => [s.key, i]))

// Everything the backend can ingest: recordings (transcribed by Deepgram),
// transcripts, and documents (DOCX/PDF, text-extracted).
const SUPPORTED_RE = /\.(mp3|mp4|wav|m4a|txt|vtt|srt|md|docx|pdf)$/i

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

    // Best-effort real-time progress: the backend emits a `report:stage` event
    // per pipeline step. If the socket can't connect, the upload still completes
    // and we advance on the request lifecycle — no fake timers either way.
    try {
      const socket = io(config.socketUrl, {
        auth: { userId: user?.id },
        transports: ['websocket', 'polling'],
      })
      socket.on('report:stage', ({ stage: s }) => {
        const idx = STAGE_INDEX[s]
        if (idx != null) setStage((cur) => Math.max(cur, idx))
      })
      socket.on('connect_error', () => {}) // progress is optional; swallow
      socketRef.current = socket
    } catch {
      /* progress is best-effort */
    }

    try {
      const form = new FormData()
      form.append('media', f) // backend reads the transcript text server-side
      form.append('title', name.replace(/\.[^.]+$/, ''))
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

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="eyebrow text-coral">Upload Studio</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Drop a recording. Walk away.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          {isAuthed
            ? 'Upload a transcript — TXT, VTT, or SRT. ATOOPV analyzes it with its heuristic engine and saves the report to your workspace.'
            : 'Audio, video, or a raw transcript. In production, ATOOPV transcribes and analyses it; here, it composes a sample report you can explore end to end.'}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald/25 bg-emerald/[0.06] px-3 py-1 text-xs font-medium text-emerald">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />{' '}
          {isAuthed ? 'Live · saved to your workspace' : 'Demo mode · sample analysis'}
        </span>
      </Reveal>

      {isAuthed && (
        <Reveal delay={0.05} className="mt-8">
          <div className="inline-flex items-center gap-1 rounded-full border border-ink/8 bg-card p-1">
            <button
              onClick={() => setMode('instant')}
              className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors', mode === 'instant' ? 'bg-ink text-paper' : 'text-muted hover:text-ink')}
            >
              <Sparkles className="h-3.5 w-3.5" /> Instant AI Report
            </button>
            <button
              onClick={() => setMode('request')}
              className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors', mode === 'request' ? 'bg-ink text-paper' : 'text-muted hover:text-ink')}
            >
              <Inbox className="h-3.5 w-3.5" /> Request a Report
            </button>
          </div>
        </Reveal>
      )}

      {mode === 'request' && isAuthed && <RequestReportForm />}

      {mode === 'instant' && (
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
                accept="audio/*,video/*,.txt,.vtt,.srt,.docx,.pdf"
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
              <p className="mt-2 text-sm text-muted">or click to browse · audio, video, TXT, DOCX, PDF up to 100MB</p>

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

            {/* Friendly error surface (empty / unsupported / upload / network / server). */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-2xl border border-coral/30 bg-coral/[0.07] p-4 text-sm text-coral"
                >
                  <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                  <p>{error}</p>
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
              <p className="font-display text-xl font-medium">
                {isAuthed ? 'Analyzing your meeting…' : 'Composing a sample report…'}
              </p>
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
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={cn('h-2 w-2 rounded-full', a.bg)}
                      />
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
            <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">Sample report ready.</h2>
            <p className="mt-3 max-w-md text-muted">
              Here’s an example of what ATOOPV produces — decisions, commitments, and risks,
              each tied back to a moment in the meeting. Open it to explore the full experience.
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
      )}
    </div>
  )
}

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
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Meeting name</span>
          <input value={meetingName} onChange={(e) => setMeetingName(e.target.value)} className="input" placeholder="e.g. Q4 Board Sync" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Report type</span>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input">
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Delivery mode</span>
          <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} className="input">
            {DELIVERY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Meeting date</span>
          <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} className="input" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Meeting time</span>
          <input type="time" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="input" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Notes for our team</span>
          <textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} rows={3} className="input resize-none" placeholder="Anything we should know before drafting this report…" />
        </label>
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/12 p-4 transition-colors hover:border-coral/50">
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral/10 text-coral"><UploadCloud className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{file ? file.name : 'Attach a recording or document (optional)'}</span>
          <span className="block text-xs text-muted">{file ? `${(file.size / 1_000_000).toFixed(1)} MB` : 'Audio, video, or a document — up to 100MB'}</span>
        </span>
        {file && (
          <button onClick={(e) => { e.preventDefault(); setFile(null) }} className="shrink-0 text-muted hover:text-ink"><X className="h-4 w-4" /></button>
        )}
      </label>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border border-coral/30 bg-coral/[0.07] p-4 text-sm text-coral">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" /><p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="accent" onClick={submit} disabled={submitting}>
          <Inbox className="h-4 w-4" /> {submitting ? 'Submitting…' : 'Submit request'}
        </Button>
      </div>
    </motion.div>
  )
}
