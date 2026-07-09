import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Palette } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/utils/cn'

/** Compact palette switcher — click to reveal all six themes with live swatches. */
export default function ThemeSwitcher({ align = 'right' }) {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const active = themes.find((t) => t.id === theme)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-3 text-sm font-medium backdrop-blur-md transition-colors hover:border-ink/20"
        aria-label="Change theme"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4 text-muted" />
        <span className="hidden sm:inline">{active?.name}</span>
        <span className="flex -space-x-1">
          {active?.swatch.map((c) => (
            <span key={c} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: c }} />
          ))}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'absolute z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-card p-1.5 shadow-float',
                align === 'right' ? 'right-0' : 'left-0',
              )}
            >
              <p className="px-3 py-2 text-[0.7rem] font-medium uppercase tracking-widest text-muted">Theme</p>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.04]',
                    t.id === theme && 'bg-ink/[0.05]',
                  )}
                >
                  <span className="flex -space-x-1.5">
                    {t.swatch.map((c) => (
                      <span key={c} className="h-4 w-4 rounded-full ring-2 ring-card" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="block text-xs text-muted">{t.hint}</span>
                  </span>
                  {t.id === theme && <Check className="h-4 w-4 text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
