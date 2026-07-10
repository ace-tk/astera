import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ArrowUp, Sparkles } from 'lucide-react'
import AstraOrb from './AstraOrb'
import { useReports } from '@/hooks/useReports'
import { useSound } from '@/context/SoundContext'
import { answer, SUGGESTIONS, GREETING } from '@/services/astra'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

let idSeq = 0
const nextId = () => ++idSeq

/** Reveals text word-by-word for the "Astra is writing" feel. */
function StreamingText({ text, onTick }) {
  const [n, setN] = useState(0)
  const words = useMemo(() => text.split(' '), [text])
  useEffect(() => {
    if (n >= words.length) return
    const t = setTimeout(() => {
      setN((v) => v + 1)
      onTick?.()
    }, 26)
    return () => clearTimeout(t)
  }, [n, words.length, onTick])
  return <span>{words.slice(0, n).join(' ')}</span>
}

function Blocks({ msg }) {
  return (
    <>
      {msg.tag && (
        <span className={cn('mt-2 inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium', accent(msg.tag.color).softBg, accent(msg.tag.color).text)}>
          {msg.tag.label}
        </span>
      )}
      {msg.stats && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {msg.stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-paper px-3 py-2">
              <div className={cn('font-display text-lg font-semibold', accent(s.color).text)}>{s.value}</div>
              <div className="text-[0.65rem] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {msg.list && (
        <div className="mt-3 space-y-2">
          {msg.list.map((it, i) => (
            <div key={i} className="rounded-xl bg-paper px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.8rem] font-medium leading-snug">{it.label}</span>
                {it.meta && <span className="shrink-0 text-[0.7rem] text-muted">{it.meta}</span>}
              </div>
              {typeof it.bar === 'number' && (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/8">
                  <motion.span className={cn('block h-full rounded-full', accent(it.color).bg)} initial={{ width: 0 }} animate={{ width: `${it.bar}%` }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function Astra() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [input, setInput] = useState('')
  const scroller = useRef(null)
  const { play } = useSound()
  const { data: reports = [] } = useReports()
  const location = useLocation()

  const match = location.pathname.match(/\/app\/report\/([^/]+)/)
  const report = useMemo(
    () => (match && reports.find((r) => r.id === match[1])) || reports[0],
    [match, reports],
  )

  const scrollDown = () => {
    requestAnimationFrame(() => {
      if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
    })
  }

  // Let the onboarding tour (or command palette) open Astra programmatically.
  useEffect(() => {
    const openIt = () => { setOpen(true); play('open') }
    window.addEventListener('astera:open', openIt)
    return () => window.removeEventListener('astera:open', openIt)
  }, [play])

  // Greet once when first opened with a report loaded.
  useEffect(() => {
    if (open && report && messages.length === 0) {
      setMessages([{ id: nextId(), role: 'astra', ...GREETING(report), stream: true }])
    }
  }, [open, report, messages.length])

  const ask = (question) => {
    if (!question.trim() || !report) return
    play('click')
    setInput('')
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: question }])
    setThinking(true)
    scrollDown()
    setTimeout(() => {
      const res = answer(question, report)
      setThinking(false)
      setMessages((m) => [...m, { id: nextId(), role: 'astra', stream: true, ...res }])
      play('step')
      scrollDown()
    }, 750)
  }

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => {
              setOpen(true)
              play('open')
            }}
            className="group fixed bottom-6 right-6 z-[90] flex items-center gap-3"
            aria-label="Open Astra assistant"
          >
            <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full border border-ink/8 bg-card px-3 py-1.5 text-sm font-medium shadow-lift group-hover:block">
              Ask Astra
            </span>
            <AstraOrb size={60} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{ transformOrigin: 'bottom right' }}
            className="fixed bottom-6 right-6 z-[95] flex h-[min(34rem,calc(100vh-3rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card shadow-float"
          >
            {/* header */}
            <div className="flex items-center justify-between gap-3 border-b border-ink/8 p-4">
              <div className="flex items-center gap-3">
                <AstraOrb size={38} />
                <div>
                  <h3 className="font-display text-base font-semibold leading-tight tracking-tight">Astra</h3>
                  <p className="flex items-center gap-1 text-[0.7rem] text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                    {report ? `Reading “${report.title}”` : 'Warming up…'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setOpen(false); play('close') }} className="grid h-8 w-8 place-items-center rounded-full border border-ink/8 text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* conversation */}
            <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) =>
                m.role === 'astra' ? (
                  <div key={m.id} className="flex gap-2.5">
                    <AstraOrb size={26} breathing={false} className="mt-0.5" />
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-ink/8 bg-paper px-3.5 py-2.5 text-sm leading-relaxed">
                      {m.stream ? <StreamingText text={m.text} onTick={scrollDown} /> : m.text}
                      <Blocks msg={m} />
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-ink px-3.5 py-2.5 text-sm text-paper">{m.text}</div>
                  </div>
                ),
              )}
              {thinking && (
                <div className="flex gap-2.5">
                  <AstraOrb size={26} breathing={false} className="mt-0.5" />
                  <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-ink/8 bg-paper px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.16 }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* suggestions */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="shrink-0 rounded-full border border-ink/10 bg-card px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:border-purple/40 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); ask(input) }}
              className="flex items-center gap-2 border-t border-ink/8 p-3"
            >
              <div className="flex flex-1 items-center gap-2 rounded-full border border-ink/10 bg-paper px-3.5 py-2">
                <Sparkles className="h-4 w-4 text-purple" />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Astra about this meeting…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper transition-opacity disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
