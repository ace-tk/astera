import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Sparkles, Check } from 'lucide-react'
import { useReports } from '@/hooks/useReports'
import { useSound } from '@/context/SoundContext'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

const READ_KEY = 'astera:notifs:read'

/**
 * A real recent-activity feed — the latest reports Astra finished, each linking
 * to its report. An unread count clears once opened (persisted). No fake data.
 */
export default function Notifications() {
  const { data: reports = [] } = useReports()
  const navigate = useNavigate()
  const { play } = useSound()
  const [open, setOpen] = useState(false)
  const [readAt, setReadAt] = useState(() => Number(localStorage.getItem(READ_KEY) || 0))

  const items = reports.slice(0, 6)
  const unread = items.filter((r) => new Date(r.date).getTime() > readAt).length

  useEffect(() => {
    if (open) {
      const now = Date.now()
      localStorage.setItem(READ_KEY, String(now))
      setReadAt(now)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((v) => !v); play(open ? 'close' : 'open') }}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative hidden h-10 w-10 place-items-center rounded-full border border-ink/8 bg-card text-muted transition-colors hover:text-ink sm:grid"
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[0.6rem] font-semibold text-white ring-2 ring-paper">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-float"
            >
              <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
                <p className="text-sm font-semibold">Recent intelligence</p>
                <span className="inline-flex items-center gap-1 text-[0.7rem] text-emerald"><Check className="h-3 w-3" /> All read</span>
              </div>
              <div className="max-h-80 overflow-y-auto p-1.5">
                {items.map((r) => {
                  const at = accent(r.color)
                  return (
                    <button
                      key={r.id}
                      onClick={() => { setOpen(false); navigate(`/app/report/${r.id}`); play('tick') }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.03]"
                    >
                      <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', at.softBg, at.text)}>
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.title}</span>
                        <span className="block text-xs text-muted">Intelligence ready · {r.metrics.decisions} decisions, {r.metrics.risks} risks</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
