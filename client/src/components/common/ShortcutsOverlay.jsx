import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import { useHotkeys, MOD_LABEL } from '@/hooks/useHotkeys'
import { useSound } from '@/context/SoundContext'

const GROUPS = [
  {
    title: 'General',
    items: [
      { keys: [MOD_LABEL, 'K'], label: 'Open command palette' },
      { keys: ['?'], label: 'Show this shortcut guide' },
      { keys: ['Esc'], label: 'Close any overlay' },
    ],
  },
  {
    title: 'Navigate',
    items: [
      { keys: ['G', 'W'], label: 'Go to Workspace' },
      { keys: ['G', 'R'], label: 'Go to Reports' },
      { keys: ['G', 'U'], label: 'Go to Upload Studio' },
      { keys: ['G', 'A'], label: 'Go to Analytics' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { keys: ['Click'], label: 'Inspect a node' },
      { keys: ['Space', 'Drag'], label: 'Pan the canvas' },
      { keys: ['R'], label: 'Re-run intelligence' },
    ],
  },
  {
    title: 'Reader',
    items: [
      { keys: ['←', '→'], label: 'Previous / next section' },
      { keys: ['B'], label: 'Bookmark section' },
      { keys: ['F'], label: 'Toggle focus mode' },
    ],
  },
]

function Key({ children }) {
  return (
    <kbd className="inline-grid min-w-[1.6rem] place-items-center rounded-md border border-ink/12 bg-paper px-1.5 py-0.5 text-[0.7rem] font-medium text-ink/70 shadow-[0_1px_0_rgb(17_24_39_/_0.06)]">
      {children}
    </kbd>
  )
}

export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)
  const { play } = useSound()

  useHotkeys(
    [
      { combo: 'shift+?', handler: () => setOpen((v) => !v) },
      { combo: 'escape', handler: () => setOpen(false) },
    ],
    [],
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-ink/10 bg-card shadow-float"
          >
            <div className="flex items-center justify-between border-b border-ink/8 px-7 py-5">
              <span className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-purple/10 text-purple">
                  <Keyboard className="h-4.5 w-4.5" />
                </span>
                <h2 className="font-display text-lg font-semibold tracking-tight">Keyboard shortcuts</h2>
              </span>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-x-10 gap-y-7 p-7 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="text-[0.65rem] font-medium uppercase tracking-widest text-muted">{g.title}</p>
                  <ul className="mt-3 space-y-2.5">
                    {g.items.map((it) => (
                      <li key={it.label} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-ink/80">{it.label}</span>
                        <span className="flex shrink-0 items-center gap-1">
                          {it.keys.map((k, i) => (
                            <Key key={i}>{k}</Key>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-ink/8 px-7 py-3 text-center text-[0.7rem] text-muted">
              Press <Key>?</Key> anytime to open this guide
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
