import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Check, X, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useSound } from '@/context/SoundContext'
import { cn } from '@/utils/cn'

const REASONS = ['More detail', 'Wrong summary', 'Wrong speaker', 'Wrong decision', 'Missing action item', 'Other']
const key = (id) => `astera:feedback:${id}`

/**
 * "Was this intelligence useful?" — a real feedback loop. Yes plays a small
 * celebration and stores locally; No opens a modal to capture what was missing.
 * Both persist per report and reflect prior feedback on return.
 */
export default function ReportFeedback({ reportId }) {
  const { toast } = useToast()
  const { play } = useSound()
  const [saved, setSaved] = useState(null) // { useful, reasons }
  const [modalOpen, setModalOpen] = useState(false)
  const [picked, setPicked] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key(reportId))
      setSaved(raw ? JSON.parse(raw) : null)
    } catch {
      setSaved(null)
    }
    setModalOpen(false)
    setPicked([])
  }, [reportId])

  const persist = (val) => {
    localStorage.setItem(key(reportId), JSON.stringify(val))
    setSaved(val)
  }

  const onYes = () => {
    play('chime')
    persist({ useful: true, reasons: [], ts: Date.now() })
    toast({ title: 'Thank you.', description: 'Glad the intelligence landed. Astra keeps learning from this.', variant: 'success', color: 'emerald' })
  }

  const submitNo = () => {
    persist({ useful: false, reasons: picked, ts: Date.now() })
    setModalOpen(false)
    play('step')
    toast({ title: 'Noted — thank you.', description: 'We’ll use this to sharpen the next report.', variant: 'info', color: 'royal' })
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 flex items-center gap-3 rounded-3xl border border-ink/8 bg-card p-6 shadow-soft"
      >
        <span className={cn('grid h-9 w-9 place-items-center rounded-full', saved.useful ? 'bg-emerald/12 text-emerald' : 'bg-royal/12 text-royal')}>
          {saved.useful ? <Check className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
        </span>
        <p className="text-sm text-muted">
          {saved.useful ? 'Thanks — you marked this report useful.' : `Thanks for the note${saved.reasons.length ? ` (${saved.reasons.join(', ')})` : ''}. We’ll sharpen it.`}
          {' '}
          <button onClick={() => { localStorage.removeItem(key(reportId)); setSaved(null) }} className="link-underline font-medium text-ink">Undo</button>
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-3xl border border-ink/8 bg-card p-6 shadow-soft sm:flex-row sm:items-center">
        <p className="text-sm font-medium">Was this intelligence useful?</p>
        <div className="flex gap-2">
          <Button variant="soft" size="sm" onClick={onYes}><ThumbsUp className="h-4 w-4" /> Yes</Button>
          <Button variant="ghost" size="sm" magnetic={false} onClick={() => { setModalOpen(true); play('open') }}><ThumbsDown className="h-4 w-4" /> Not quite</Button>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center p-4"
            onMouseDown={() => setModalOpen(false)}
          >
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onMouseDown={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight">What was missing?</h2>
                  <p className="mt-1 text-sm text-muted">Pick anything that felt off — it stays on your device.</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {REASONS.map((r) => {
                  const on = picked.includes(r)
                  return (
                    <button
                      key={r}
                      onClick={() => { setPicked((p) => (on ? p.filter((x) => x !== r) : [...p, r])); play('tick') }}
                      className={cn('rounded-full border px-3.5 py-2 text-sm font-medium transition-colors', on ? 'border-royal bg-royal/10 text-royal' : 'border-ink/10 text-muted hover:border-ink/25 hover:text-ink')}
                    >
                      {on && <Check className="mr-1.5 inline h-3.5 w-3.5" />}{r}
                    </button>
                  )
                })}
              </div>
              <div className="mt-7 flex justify-end gap-2">
                <Button variant="ghost" size="sm" magnetic={false} onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="accent" size="sm" onClick={submitNo} disabled={picked.length === 0}>Send feedback</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
