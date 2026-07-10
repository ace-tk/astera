import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, Workflow, FileText, UploadCloud, BarChart3, Settings2, Palette,
  Volume2, CornerDownLeft, ArrowUp, ArrowDown, Command as CommandIcon, Play,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useSound } from '@/context/SoundContext'
import { useReports } from '@/hooks/useReports'
import { useHotkeys, MOD_LABEL } from '@/hooks/useHotkeys'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const GROUP_ORDER = ['Go to', 'Actions', 'Meetings', 'Themes']

// Subsequence match: query chars appear in order within the haystack.
function fuzzy(query, text) {
  if (!query) return true
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let i = 0
  for (const ch of t) if (ch === q[i]) i++
  return i === q.length
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const { themes, setTheme, theme } = useTheme()
  const { play, toggle: toggleSound, enabled: soundOn } = useSound()
  const { data: reports = [] } = useReports()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const commands = useMemo(() => {
    const go = (to) => () => navigate(to)
    const nav = [
      { id: 'nav-workspace', label: 'Workspace', hint: 'Intelligence canvas', icon: Workflow, group: 'Go to', run: go('/app') },
      { id: 'nav-reports', label: 'Reports', hint: 'All reports', icon: FileText, group: 'Go to', run: go('/app/reports') },
      { id: 'nav-upload', label: 'Upload Studio', hint: 'New recording', icon: UploadCloud, group: 'Go to', run: go('/app/upload') },
      { id: 'nav-analytics', label: 'Analytics', hint: 'Workspace signals', icon: BarChart3, group: 'Go to', run: go('/app/analytics') },
      { id: 'nav-settings', label: 'Settings', hint: 'Preferences', icon: Settings2, group: 'Go to', run: go('/app/settings') },
    ]
    const actions = [
      { id: 'act-generate', label: 'Generate a report', hint: 'Upload & compose', icon: UploadCloud, group: 'Actions', run: go('/app/upload') },
      { id: 'act-sound', label: soundOn ? 'Mute sounds' : 'Enable sounds', hint: 'Interface audio', icon: Volume2, group: 'Actions', run: () => toggleSound() },
    ]
    const meetings = reports.map((r) => ({
      id: `meet-${r.id}`,
      label: r.title,
      hint: r.subtitle,
      dot: accent(r.color).bg,
      icon: Play,
      group: 'Meetings',
      keywords: r.participants?.join(' '),
      run: () => navigate(`/app/report/${r.id}`),
    }))
    const themeCmds = themes.map((t) => ({
      id: `theme-${t.id}`,
      label: `${t.name} theme`,
      hint: t.hint,
      icon: Palette,
      group: 'Themes',
      swatch: t.swatch,
      run: () => setTheme(t.id),
      active: t.id === theme,
    }))
    return [...nav, ...actions, ...meetings, ...themeCmds]
  }, [navigate, reports, themes, setTheme, theme, soundOn, toggleSound])

  const filtered = useMemo(
    () => commands.filter((c) => fuzzy(query, `${c.label} ${c.hint || ''} ${c.keywords || ''}`)),
    [commands, query],
  )

  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((c) => (map[c.group] ||= []).push(c))
    return GROUP_ORDER.filter((g) => map[g]?.length).map((g) => ({ group: g, items: map[g] }))
  }, [filtered])

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  // Open via ⌘K or the topbar's custom event.
  useHotkeys(
    [{ combo: 'mod+k', handler: () => setOpen((v) => !v) }],
    [],
  )
  useEffect(() => {
    const onEvt = () => setOpen(true)
    window.addEventListener('astera:command', onEvt)
    return () => window.removeEventListener('astera:command', onEvt)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      play('open')
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open, play])

  useEffect(() => setActive(0), [query])

  // Keep the active row scrolled into view.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const runAt = (i) => {
    const cmd = flat[i]
    if (!cmd) return
    play('click')
    setOpen(false)
    cmd.run()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, flat.length - 1))
      play('tick')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
      play('tick')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runAt(active)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  let runningIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          onMouseDown={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="relative w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-ink/10 bg-card shadow-float"
          >
            {/* input */}
            <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-4">
              <Search className="h-5 w-5 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search meetings, jump anywhere, switch themes…"
                className="flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border border-ink/10 px-1.5 py-0.5 text-[0.65rem] text-muted">esc</kbd>
            </div>

            {/* results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {flat.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted">
                  No matches for “{query}”.
                </div>
              )}
              {grouped.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <p className="px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-widest text-muted">{group}</p>
                  {items.map((c) => {
                    runningIndex++
                    const i = runningIndex
                    const isActive = i === active
                    return (
                      <button
                        key={c.id}
                        data-active={isActive}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => runAt(i)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-ink/[0.05]' : 'hover:bg-ink/[0.03]',
                        )}
                      >
                        {c.swatch ? (
                          <span className="flex -space-x-1">
                            {c.swatch.map((s) => (
                              <span key={s} className="h-4 w-4 rounded-full ring-2 ring-card" style={{ background: s }} />
                            ))}
                          </span>
                        ) : c.dot ? (
                          <span className={cn('grid h-8 w-8 place-items-center rounded-lg', 'bg-paper')}>
                            <span className={cn('h-2 w-2 rounded-full', c.dot)} />
                          </span>
                        ) : (
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper text-ink/70">
                            <c.icon className="h-4 w-4" />
                          </span>
                        )}
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{c.label}</span>
                          {c.hint && <span className="block text-xs text-muted">{c.hint}</span>}
                        </span>
                        {c.active && <span className="text-[0.65rem] font-medium text-accent">Active</span>}
                        {isActive && <CornerDownLeft className="h-4 w-4 text-muted" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-ink/8 px-5 py-3 text-[0.7rem] text-muted">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> select</span>
              </span>
              <span className="flex items-center gap-1"><CommandIcon className="h-3 w-3" /> {MOD_LABEL} K anywhere</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
