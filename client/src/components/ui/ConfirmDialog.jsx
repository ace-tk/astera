import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'
import Button from './Button'

/**
 * Shared confirm-before-action dialog — the same backdrop/card/animation
 * pattern already hand-rolled in Overview.jsx and AdminReports.jsx, factored
 * out so every "are you sure?" prompt (suspend, activate, reset password,
 * send invitation, upload/publish report) looks and behaves identically.
 */
export default function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  icon: Icon = AlertTriangle,
  color = 'rose',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  danger = false,
}) {
  const a = accent(color)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center p-4"
          onMouseDown={() => !busy && onCancel?.()}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onMouseDown={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
          >
            <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', a.softBg, a.text)}>
              <Icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-2 text-sm text-muted">{description}</p>}
            <div className="mt-7 flex justify-end gap-2">
              <Button variant="ghost" size="sm" magnetic={false} onClick={onCancel} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button
                variant="accent"
                size="sm"
                magnetic={false}
                className={danger ? '!bg-rose !shadow-none' : undefined}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
