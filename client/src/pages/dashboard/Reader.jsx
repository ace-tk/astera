import { useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bookmark, Minus, Plus, Focus, Highlighter, StickyNote, Sparkles } from 'lucide-react'
import { useReport } from '@/hooks/useReports'
import { useReaderPrefs } from '@/hooks/useReaderPrefs'
import { useSound } from '@/context/SoundContext'
import { buildSections } from '@/services/readerContent'
import ReaderSidebar from '@/components/reader/ReaderSidebar'
import ReaderMinimap from '@/components/reader/ReaderMinimap'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const ZOOM = ['text-[0.95rem] leading-7', 'text-lg leading-[2]', 'text-xl leading-[2.1]']

// Wrap query matches in a highlight mark (case-insensitive).
function withSearch(text, query) {
  if (!query.trim()) return text
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'))
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-golden/40 px-0.5 text-ink">{p}</mark>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}

export default function Reader() {
  const { id } = useParams()
  const { data: report, isLoading } = useReport(id)
  const sections = useMemo(() => (report ? buildSections(report) : []), [report])
  const prefs = useReaderPrefs(id)
  const { play } = useSound()

  const [active, setActive] = useState('overview')
  const [query, setQuery] = useState('')
  const [progress, setProgress] = useState(0)
  const [highlights, setHighlights] = useState({})
  const scrollRef = useRef(null)
  const sectionEls = useRef({})

  // Scroll-spy: track the section nearest the top; page-flip sound on change.
  useEffect(() => {
    const root = scrollRef.current
    if (!root || !sections.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive((prev) => {
              if (prev !== e.target.dataset.id) play('paper')
              return e.target.dataset.id
            })
          }
        })
      },
      { root, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    Object.values(sectionEls.current).forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [sections, play])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setProgress(el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight))
  }

  const jump = (sid) => {
    sectionEls.current[sid]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    play('tick')
  }

  const toggleHighlight = (key) => {
    setHighlights((h) => ({ ...h, [key]: !h[key] }))
    play('tick')
  }

  if (isLoading || !report) {
    return <div className="grid h-full place-items-center"><div className="h-24 w-24 animate-pulse rounded-full bg-card" /></div>
  }

  const a = accent(report.color)

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Left sidebar */}
      <AnimatePresence initial={false}>
        {!prefs.focus && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 264, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="hidden h-full shrink-0 overflow-hidden border-r border-ink/8 bg-card/50 backdrop-blur-sm lg:block"
          >
            <div className="w-[264px]">
              <ReaderSidebar
                sections={sections}
                active={active}
                onJump={jump}
                bookmarks={prefs.bookmarks}
                notes={prefs.notes}
                query={query}
                setQuery={setQuery}
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Reading surface */}
      <main ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto">
        {/* paper texture */}
        {prefs.texture && (
          <div className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-[0.05] mix-blend-multiply" />
        )}

        {/* progress bar */}
        <div className="sticky top-0 z-20 h-0.5 w-full bg-transparent">
          <div className={cn('h-full', a.bg)} style={{ width: `${progress * 100}%` }} />
        </div>

        {/* toolbar */}
        <div className="sticky top-0.5 z-10 flex items-center justify-between gap-4 border-b border-ink/8 bg-paper/70 px-6 py-3 backdrop-blur-xl">
          <Link to={`/app/report/${report.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Exit reader
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-full border border-ink/8 bg-card">
              <button onClick={() => prefs.setZoom(Math.max(0, prefs.zoom - 1))} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink"><Minus className="h-4 w-4" /></button>
              <span className="px-1 text-xs font-medium text-muted">Aa</span>
              <button onClick={() => prefs.setZoom(Math.min(2, prefs.zoom + 1))} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink"><Plus className="h-4 w-4" /></button>
            </div>
            <ToolbarToggle on={prefs.texture} onClick={() => prefs.setTexture(!prefs.texture)} label="Paper texture"><span className="text-xs font-medium">Paper</span></ToolbarToggle>
            <ToolbarToggle on={prefs.focus} onClick={() => { prefs.setFocus(!prefs.focus); play(prefs.focus ? 'close' : 'open') }} label="Focus mode"><Focus className="h-4 w-4" /></ToolbarToggle>
            <ToolbarToggle on={prefs.bookmarks.includes(active)} onClick={() => { prefs.toggleBookmark(active); play('tick') }} label="Bookmark section"><Bookmark className={cn('h-4 w-4', prefs.bookmarks.includes(active) && 'fill-current')} /></ToolbarToggle>
          </div>
        </div>

        {/* content */}
        <div className={cn('mx-auto flex gap-8 px-6 py-14 transition-all', prefs.focus ? 'max-w-2xl' : 'max-w-5xl')}>
          <article className={cn('min-w-0 flex-1', ZOOM[prefs.zoom])}>
            {/* masthead */}
            <header className="mb-16">
              <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', a.softBg, a.text)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', a.bg)} /> {report.subtitle}
              </span>
              <h1 className="mt-6 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">{report.title}</h1>
              <p className="mt-4 text-sm text-muted">
                {new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {report.duration} · {report.participants.length} participants
              </p>
            </header>

            <div className="space-y-20">
              {sections.map((s, si) => (
                <section
                  key={s.id}
                  data-id={s.id}
                  ref={(el) => (sectionEls.current[s.id] = el)}
                  className="scroll-mt-24"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">{String(si + 1).padStart(2, '0')}</span>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">{s.title}</h2>
                    {prefs.bookmarks.includes(s.id) && <Bookmark className="h-4 w-4 fill-golden text-golden" />}
                  </div>

                  {/* paragraphs with hover-highlight */}
                  <div className="space-y-5 text-ink/85">
                    {s.paragraphs.map((p, pi) => {
                      const key = `${s.id}:${pi}`
                      return (
                        <div key={pi} className="group relative">
                          <button
                            onClick={() => toggleHighlight(key)}
                            title="Highlight"
                            className="absolute -left-8 top-1 hidden h-6 w-6 place-items-center rounded-full text-muted hover:text-golden group-hover:grid"
                          >
                            <Highlighter className="h-4 w-4" />
                          </button>
                          <p className={cn('rounded-lg text-pretty transition-colors', highlights[key] && 'bg-golden/25 px-2 py-1 -mx-2')}>
                            {withSearch(p, query)}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* structured items */}
                  {s.items && (
                    <div className="mt-6 space-y-2.5">
                      {s.items.map((it, ii) => (
                        <div key={ii} className={cn('rounded-2xl border-l-2 bg-card/60 py-3 pl-4 pr-4', accent(it.color).border)}>
                          <p className="text-[0.95rem] font-medium leading-snug">{withSearch(it.lead, query)}</p>
                          <p className="mt-1 text-xs text-muted">{it.meta}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* talk-time bars */}
                  {s.bars && (
                    <div className="mt-6 space-y-3">
                      {s.bars.map((t) => (
                        <div key={t.name} className="flex items-center gap-3 text-sm">
                          <span className="w-24 shrink-0">{t.name}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/8">
                            <motion.span className={cn('block h-full rounded-full', a.bg)} initial={{ width: 0 }} whileInView={{ width: `${t.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                          </div>
                          <span className="w-9 text-right text-xs text-muted">{t.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* sticky note */}
                  <NoteBlock value={prefs.notes[s.id] || ''} onChange={(v) => prefs.setNote(s.id, v)} />
                </section>
              ))}
            </div>

            <footer className="mt-24 flex items-center gap-3 border-t border-ink/8 pt-8 text-sm text-muted">
              <Sparkles className="h-4 w-4 text-accent" /> Composed by ATOOPV · From conversations to clarity.
            </footer>
          </article>

          {!prefs.focus && (
            <ReaderMinimap sections={sections} active={active} progress={progress} onJump={jump} />
          )}
        </div>
      </main>
    </div>
  )
}

function ToolbarToggle({ on, onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-pressed={on}
      className={cn('grid h-8 min-w-8 place-items-center rounded-full border px-2.5 transition-colors', on ? 'border-accent/30 bg-accent/10 text-accent' : 'border-ink/8 bg-card text-muted hover:text-ink')}
    >
      {children}
    </button>
  )
}

function NoteBlock({ value, onChange }) {
  const [open, setOpen] = useState(Boolean(value))
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-purple">
        <StickyNote className="h-3.5 w-3.5" /> Add a note
      </button>
    )
  }
  return (
    <div className="mt-6 rounded-2xl border border-purple/20 bg-purple/[0.04] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-purple">
        <StickyNote className="h-3.5 w-3.5" /> Your note
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot a thought — it’s saved to this section."
        rows={2}
        className="w-full resize-none rounded-lg border border-ink/8 bg-card p-3 text-sm outline-none focus:border-purple/40"
      />
    </div>
  )
}
