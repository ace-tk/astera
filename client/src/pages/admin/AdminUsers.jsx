import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Mail, CalendarDays, ShieldCheck } from 'lucide-react'
import { fetchAdminUsers, fetchAdminReports } from '@/services/admin'
import StatusChip from '@/components/admin/StatusChip'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin', 'users'], queryFn: fetchAdminUsers })
  const [open, setOpen] = useState(null) // selected user

  return (
    <>
      <Reveal>
        <p className="eyebrow text-accent"><ShieldCheck className="h-3.5 w-3.5" /> Admin · Users</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every account, at a glance.
        </h1>
      </Reveal>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 font-medium">Name</th>
              <th className="px-5 py-3.5 font-medium">Email</th>
              <th className="px-5 py-3.5 font-medium">Reports</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading users…</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 font-medium">
                    {u.name}
                    {u.isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-label="Admin" />}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted">{u.email}</td>
                <td className="px-5 py-3.5">{u.reportsCount}</td>
                <td className="px-5 py-3.5 text-muted">{fmt(u.createdAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <Button size="sm" variant="soft" magnetic={false} onClick={() => setOpen(u)}>Open</Button>
                </td>
              </tr>
            ))}
            {!isLoading && users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>{open && <UserModal user={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  )
}

/** Read-only user profile — details + their reports. No editing. */
function UserModal({ user, onClose }) {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports', 'owner', user.id],
    queryFn: () => fetchAdminReports(user.id),
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center p-4"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
      >
        <button onClick={onClose} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-lg font-semibold text-white">
          {user.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{user.name}</h2>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><CalendarDays className="h-3.5 w-3.5" /> Joined {fmt(user.createdAt)}</p>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">Reports ({user.reportsCount})</p>
          <div className="mt-3 space-y-2">
            {isLoading && <p className="text-sm text-muted">Loading…</p>}
            {reports.map((r) => (
              <Link
                key={r.id}
                to={`/app/admin/reports/${r.id}`}
                onClick={onClose}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3 transition-colors hover:border-ink/20"
              >
                <span className="min-w-0 truncate text-sm font-medium">{r.title}</span>
                <StatusChip status={r.reviewStatus} />
              </Link>
            ))}
            {!isLoading && reports.length === 0 && <p className="text-sm text-muted">No reports.</p>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
