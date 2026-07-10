import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, Palette, Accessibility, Volume2, Keyboard, FlaskConical, Info,
  Sparkles, RotateCcw, ArrowRight, Activity, Cpu, Github,
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useSound } from '@/context/SoundContext'
import { useA11y } from '@/context/A11yContext'
import { useInterview } from '@/context/InterviewContext'
import { useToast } from '@/context/ToastContext'
import { MOD_LABEL } from '@/hooks/useHotkeys'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import InfoBadge from '@/components/interview/InfoBadge'
import { cn } from '@/utils/cn'

const APP_VERSION = '1.0.0'

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'audio', label: 'Audio', icon: Volume2 },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
  { id: 'experimental', label: 'Experimental', icon: FlaskConical },
  { id: 'about', label: 'About', icon: Info },
]

function Toggle({ on, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-accent' : 'bg-ink/15')}
    >
      <motion.span layout className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow', on ? 'left-6' : 'left-1')} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Card({ title, badge, children }) {
  return (
    <div className="rounded-3xl border border-ink/8 bg-card p-7 shadow-soft">
      {title && (
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
          {badge}
        </div>
      )}
      {children}
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme, themes } = useTheme()
  const { enabled: soundOn, setEnabled: setSound } = useSound()
  const a11y = useA11y()
  const interview = useInterview()
  const { toast } = useToast()
  const [tab, setTab] = useState('appearance')

  return (
    <div className="mx-auto max-w-shell">
      <Reveal>
        <p className="eyebrow text-emerald"><Sparkles className="h-3.5 w-3.5" /> Settings</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Make Astera feel like home.
        </h1>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* section rail */}
        <nav className="flex gap-1.5 overflow-x-auto lg:sticky lg:top-4 lg:flex-col lg:self-start">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={cn('relative flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-colors', tab === s.id ? 'text-ink' : 'text-muted hover:text-ink')}
            >
              {tab === s.id && <motion.span layoutId="settings-tab" className="absolute inset-0 -z-10 rounded-2xl bg-ink/[0.05]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>

        {/* content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {tab === 'appearance' && (
              <Card title="Theme" badge={<InfoBadge title="Theming architecture" points={['Every color is a CSS variable; a single data-theme on <html> re-skins the entire product.', 'Tailwind tokens read rgb(var(--x) / <alpha-value>) so opacity compositing still works.', 'No re-render on theme change — the browser repaints from the cascade.']} />}>
                <p className="mb-5 text-sm text-muted">Six palettes. Each re-skins the entire product.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {themes.map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)} className={cn('group relative overflow-hidden rounded-2xl border p-4 text-left transition-all', theme === t.id ? 'border-accent ring-2 ring-accent/20' : 'border-ink/8 hover:border-ink/20')}>
                      <div className="flex h-16 items-end gap-1.5 rounded-xl p-2" style={{ background: t.swatch[0] }}>
                        <span className="h-8 flex-1 rounded-md" style={{ background: t.swatch[1] }} />
                        <span className="h-5 flex-1 rounded-md" style={{ background: t.swatch[2] }} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted">{t.hint}</p></div>
                        {theme === t.id && <Check className="h-4 w-4 text-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {tab === 'accessibility' && (
              <Card title="Accessibility" badge={<InfoBadge title="Accessibility approach" points={['reduce-motion drives Framer’s global MotionConfig so JS animations settle instantly, not just CSS.', 'prefers-reduced-motion is always honored automatically; this is a manual override.', 'Focus rings, ARIA roles, and keyboard paths are first-class.']} />}>
                <div className="divide-y divide-ink/8">
                  <Row title="Reduce motion" desc="Calm the animations across the whole app.">
                    <Toggle on={a11y.reduceMotion} onChange={(v) => a11y.set('reduceMotion', v)} label="Reduce motion" />
                  </Row>
                  <Row title="Larger text" desc="Increase the base font size for comfort.">
                    <Toggle on={a11y.largeText} onChange={(v) => a11y.set('largeText', v)} label="Larger text" />
                  </Row>
                  <Row title="Always show focus rings" desc="Keep focus outlines visible for mouse users too.">
                    <Toggle on={a11y.alwaysFocus} onChange={(v) => a11y.set('alwaysFocus', v)} label="Always show focus rings" />
                  </Row>
                </div>
                <p className="mt-4 rounded-xl bg-paper p-3 text-xs text-muted">Astera also respects your system’s “reduce motion” setting automatically.</p>
              </Card>
            )}

            {tab === 'audio' && (
              <Card title="Audio" badge={<InfoBadge title="Sound engine" points={['All cues are synthesized at runtime with the Web Audio API — zero audio assets to download.', 'Off by default; the AudioContext is created lazily on first interaction to satisfy autoplay policy.']} />}>
                <Row title="Interface sounds" desc="Soft clicks, a completion chime, page-flip cues.">
                  <Toggle on={soundOn} onChange={setSound} label="Interface sounds" />
                </Row>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['click', 'hover', 'chime', 'paper', 'step'].map((s) => (
                    <span key={s} className="rounded-full border border-ink/8 bg-paper px-3 py-1 text-xs text-muted">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {tab === 'keyboard' && (
              <Card title="Keyboard" badge={<InfoBadge title="Keyboard-first" points={['A global useHotkeys hook normalizes ⌘/Ctrl and guards text inputs.', 'The command palette is the single source of truth for navigation and actions.']} />}>
                <div className="divide-y divide-ink/8">
                  {[
                    [`${MOD_LABEL} K`, 'Command palette'],
                    ['?', 'Shortcut guide'],
                    ['G then W / R / U / A', 'Jump to a section'],
                    ['Esc', 'Close any overlay'],
                  ].map(([k, label]) => (
                    <Row key={label} title={label}>
                      <kbd className="rounded-md border border-ink/10 bg-paper px-2 py-1 text-xs text-muted">{k}</kbd>
                    </Row>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="soft" onClick={() => window.dispatchEvent(new CustomEvent('astera:shortcuts'))}>Open shortcut guide</Button>
                  <Button size="sm" variant="ghost" magnetic={false} onClick={() => window.dispatchEvent(new CustomEvent('astera:command'))}>Open command palette</Button>
                </div>
              </Card>
            )}

            {tab === 'experimental' && (
              <>
                <Card title="Interview mode" badge={<span className="rounded-full bg-purple/12 px-2 py-0.5 text-[0.65rem] font-medium text-purple">Presenter</span>}>
                  <Row title="Show engineering notes" desc="Add ⓘ badges across the app explaining the architecture and decisions.">
                    <Toggle
                      on={interview.enabled}
                      onChange={(v) => {
                        interview.setEnabled(v)
                        toast({ title: v ? 'Interview mode on' : 'Interview mode off', description: v ? 'Look for the pulsing ⓘ across the app.' : 'Engineering notes hidden.', variant: 'magic', color: 'purple' })
                      }}
                      label="Interview mode"
                    />
                  </Row>
                  <p className="mt-2 rounded-xl bg-paper p-3 text-xs text-muted">When on, look for the pulsing ⓘ on the Workspace, Reports, and Replay — each explains why it’s built the way it is.</p>
                </Card>
                <Card title="Onboarding">
                  <Row title="Restart the product tour" desc="Replay the six-step guided walkthrough.">
                    <Button size="sm" variant="soft" onClick={() => window.dispatchEvent(new CustomEvent('astera:tour'))}><RotateCcw className="h-4 w-4" /> Restart</Button>
                  </Row>
                </Card>
              </>
            )}

            {tab === 'about' && (
              <>
                <Card title="Astera">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Version <span className="font-mono font-medium">{APP_VERSION}</span></p>
                      <p className="mt-1 text-xs text-muted">From conversations to clarity.</p>
                    </div>
                    <span className="rounded-full bg-emerald/12 px-3 py-1 text-xs font-medium text-emerald">All systems nominal</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Link to="/app/about" className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper p-4 transition-colors hover:border-ink/20">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal/10 text-royal"><Info className="h-4 w-4" /></span>
                      <span className="flex-1 text-sm font-medium">About Astera</span>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link to="/app/status" className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper p-4 transition-colors hover:border-ink/20">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald/10 text-emerald"><Activity className="h-4 w-4" /></span>
                      <span className="flex-1 text-sm font-medium">System status</span>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a href="https://github.com/techcodie/astera" target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-paper p-4 transition-colors hover:border-ink/20">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/8"><Github className="h-4 w-4" /></span>
                      <span className="flex-1 text-sm font-medium">Source</span>
                      <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </Card>
                <Card title="Built with">
                  <div className="flex flex-wrap gap-2">
                    {['React 19', 'Vite', 'Tailwind', 'Framer Motion', 'React Flow', 'React Query', 'Recharts', 'Express', 'MongoDB', 'Socket.io', 'Web Audio'].map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-ink/8 bg-paper px-3 py-1 text-xs text-ink/70"><Cpu className="h-3 w-3 text-muted" />{t}</span>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
