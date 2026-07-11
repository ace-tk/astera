import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Trash2, PencilLine, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useSound } from '@/context/SoundContext'
import { cn } from '@/utils/cn'

const PRIORITIES = [
  { id: 'high', label: 'High', color: 'rose' },
  { id: 'medium', label: 'Medium', color: 'amber' },
  { id: 'low', label: 'Low', color: 'emerald' },
]
const PRI_CLASS = {
  rose: 'border-rose bg-rose/10 text-rose',
  amber: 'border-orange bg-orange/10 text-orange',
  emerald: 'border-emerald bg-emerald/10 text-emerald',
}

/**
 * Review Mode — a real editing surface for a report. Correct the title, sharpen
 * the summary, set a priority, add notes, and edit action items. Saves locally
 * and the report reflects it immediately. No placeholder.
 */
export default function ReviewMode({ open, onClose, report, edits, onSave }) {
  const { toast } = useToast()
  const { play } = useSound()
  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [priority, setPriority] = useState('')
  const [notes, setNotes] = useState('')
  const [actions, setActions] = useState([])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Seed the form from current (edited-or-original) values each time it opens.
  useEffect(() => {
    if (!open) return
    setTitle(edits.title ?? report.title)
    setHeadline(edits.headline ?? report.headline)
    setPriority(edits.priority ?? '')
    setNotes(edits.notes ?? '')
    setActions(edits.commitments ?? report.commitments.map((c) => ({ ...c })))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateAction = (i, patch) => setActions((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const removeAction = (i) => { setActions((a) => a.filter((_, j) => j !== i)); play('tick') }
  const addAction = () => { setActions((a) => [...a, { text: '', owner: 'Unassigned', due: 'TBD', at: '—' }]); play('tick') }

  const commit = () => {
    onSave({
      ...edits,
      title: title !== report.title ? title : undefined,
      headline: headline !== report.headline ? headline : undefined,
      priority: priority || undefined,
      notes: notes || undefined,
      commitments: actions.filter((a) => a.text.trim()),
    })
    play('chime')
    toast({ title: 'Report updated', description: 'Your review is saved to this device.', variant: 'success', color: 'emerald' })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[95] bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Review report"
            className="fixed right-0 top-0 z-[96] flex h-full w-[min(30rem,100vw)] flex-col border-l border-ink/10 bg-card shadow-float"
          >
            <div className="flex items-center justify-between border-b border-ink/8 p-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal/10 text-royal"><PencilLine className="h-4.5 w-4.5" /></span>
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">Review mode</h2>
                  <p className="text-xs text-muted">Refine what Astra captured</p>
                </div>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <Field label="Title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
              </Field>

              <Field label="Priority">
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriority(priority === p.id ? '' : p.id)}
                      className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors', priority === p.id ? PRI_CLASS[p.color] : 'border-ink/10 text-muted hover:border-ink/25 hover:text-ink')}
                    >
                      {priority === p.id && <Check className="mr-1 inline h-3.5 w-3.5" />}{p.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Executive summary">
                <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={4} className="input resize-none leading-relaxed" />
              </Field>

              <Field label="Action items">
                <div className="space-y-2.5">
                  {actions.map((act, i) => (
                    <div key={i} className="rounded-2xl border border-ink/8 bg-paper p-3">
                      <div className="flex items-start gap-2">
                        <input value={act.text} onChange={(e) => updateAction(i, { text: e.target.value })} placeholder="What needs to happen?" className="input-bare flex-1 font-medium" />
                        <button onClick={() => removeAction(i)} className="mt-1 text-muted hover:text-rose" aria-label="Remove action"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input value={act.owner} onChange={(e) => updateAction(i, { owner: e.target.value })} placeholder="Owner" className="input-bare w-1/2 text-xs text-muted" />
                        <input value={act.due} onChange={(e) => updateAction(i, { due: e.target.value })} placeholder="Due" className="input-bare w-1/2 text-xs text-muted" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addAction} className="inline-flex items-center gap-1.5 text-sm font-medium text-royal hover:underline">
                    <Plus className="h-4 w-4" /> Add action item
                  </button>
                </div>
              </Field>

              <Field label="Notes">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Private notes for this report…" className="input resize-none" />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-ink/8 p-4">
              <button onClick={() => { setTitle(report.title); setHeadline(report.headline); setPriority(''); setNotes(''); setActions(report.commitments.map((c) => ({ ...c }))); play('tick') }} className="text-sm text-muted hover:text-ink">
                Reset to original
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" magnetic={false} onClick={onClose}>Cancel</Button>
                <Button variant="accent" size="sm" onClick={commit}><Check className="h-4 w-4" /> Save review</Button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  )
}
