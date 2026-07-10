import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const SPEECH_OK = typeof window !== 'undefined' && 'speechSynthesis' in window
const RATES = [0.85, 1, 1.15, 1.35]

/**
 * The executive summary, narrated. Uses the browser's Speech Synthesis to read
 * the summary aloud with play / pause / resume / restart, playback speed, and
 * mute — highlighting each word as it's spoken. If speech synthesis isn't
 * available, the controls hide and the summary reads as plain text.
 */
export default function NarratedSummary({ text, color = 'royal' }) {
  const a = accent(color)
  const [status, setStatus] = useState('idle') // idle | playing | paused
  const [rate, setRate] = useState(1)
  const [muted, setMuted] = useState(false)
  const [charIndex, setCharIndex] = useState(-1)
  const utterRef = useRef(null)

  // Word boundaries so we can highlight the word currently being spoken.
  const words = useMemo(() => {
    const out = []
    const re = /\S+/g
    let m
    while ((m = re.exec(text))) out.push({ word: m[0], start: m.index, end: m.index + m[0].length })
    return out
  }, [text])

  const activeWord = charIndex < 0 ? -1 : words.findIndex((w) => charIndex >= w.start && charIndex < w.end)

  const stop = () => {
    if (SPEECH_OK) window.speechSynthesis.cancel()
    setStatus('idle')
    setCharIndex(-1)
  }

  useEffect(() => () => { if (SPEECH_OK) window.speechSynthesis.cancel() }, [])

  const speak = () => {
    if (!SPEECH_OK) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.volume = muted ? 0 : 1
    u.pitch = 1
    u.onboundary = (e) => { if (e.name === 'word' || e.charIndex != null) setCharIndex(e.charIndex) }
    u.onend = () => { setStatus('idle'); setCharIndex(-1) }
    u.onerror = () => { setStatus('idle'); setCharIndex(-1) }
    utterRef.current = u
    window.speechSynthesis.speak(u)
    setStatus('playing')
  }

  const toggle = () => {
    if (!SPEECH_OK) return
    if (status === 'idle') speak()
    else if (status === 'playing') { window.speechSynthesis.pause(); setStatus('paused') }
    else { window.speechSynthesis.resume(); setStatus('playing') }
  }

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    if (status !== 'idle') { // re-speak from current position isn't supported; restart at new rate
      stop()
      setTimeout(() => { setRate(next); speakAt(next) }, 60)
    }
  }
  const speakAt = (r) => {
    if (!SPEECH_OK) return
    const u = new SpeechSynthesisUtterance(text)
    u.rate = r; u.volume = muted ? 0 : 1
    u.onboundary = (e) => setCharIndex(e.charIndex)
    u.onend = () => { setStatus('idle'); setCharIndex(-1) }
    window.speechSynthesis.speak(u); setStatus('playing')
  }

  return (
    <div>
      <p className="font-display text-2xl font-medium leading-snug tracking-tight text-balance">
        {SPEECH_OK && activeWord >= 0
          ? words.map((w, i) => (
              <span key={i}>
                <span className={cn('rounded transition-colors', i === activeWord ? cn(a.softBg, 'px-0.5') : '')}>{w.word}</span>{' '}
              </span>
            ))
          : text}
      </p>

      {SPEECH_OK ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={toggle}
            aria-label={status === 'playing' ? 'Pause narration' : status === 'paused' ? 'Resume narration' : 'Listen to the summary'}
            className={cn('inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5', a.bg)}
          >
            {status === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {status === 'idle' ? 'Listen' : status === 'playing' ? 'Pause' : 'Resume'}
          </button>
          {status !== 'idle' && (
            <button onClick={stop} aria-label="Restart narration" className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 bg-card text-muted transition-colors hover:text-ink">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <button onClick={cycleRate} aria-label="Playback speed" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/8 bg-card px-3 text-xs font-medium text-muted transition-colors hover:text-ink">
            <Gauge className="h-3.5 w-3.5" /> {rate}×
          </button>
          <button
            onClick={() => { setMuted((m) => { const nm = !m; if (utterRef.current) utterRef.current.volume = nm ? 0 : 1; return nm }) }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className={cn('grid h-9 w-9 place-items-center rounded-full border transition-colors', muted ? 'border-ink/8 bg-card text-muted' : cn(a.border, a.softBg, a.text))}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {status === 'playing' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className={cn('h-2 w-0.5 rounded-full', a.bg)} animate={{ scaleY: [0.4, 1, 0.4] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
              ))}
              Reading aloud
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
}
