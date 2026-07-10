import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, Sparkles, AlertTriangle, X } from 'lucide-react'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const ToastContext = createContext(null)

const ICONS = { success: CheckCircle2, info: Info, magic: Sparkles, warn: AlertTriangle }

/**
 * A small, characterful toast system. Toasts stack bottom-left (clear of ASTRA
 * bottom-right), spring in, and auto-dismiss. Copy is meant to have personality
 * — a nudge, not a system log.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    ({ title, description, variant = 'success', color = 'emerald', duration = 3200 }) => {
      const id = ++idRef.current
      setToasts((t) => [...t, { id, title, description, variant, color }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-6 z-[110] flex w-[min(22rem,calc(100vw-3rem))] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant] || CheckCircle2
            const a = accent(t.color)
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-2xl border border-ink/10 bg-card p-4 shadow-float"
              >
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', a.softBg, a.text)}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="text-muted transition-colors hover:text-ink" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
                <motion.span
                  className={cn('absolute bottom-0 left-0 h-0.5', a.bg)}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3.2, ease: 'linear' }}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
