import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, X, Mail, User, CalendarDays, Pencil, Ban, CheckCircle2 } from 'lucide-react'
import { MOCK_CUSTOMERS } from '@/services/mockAdminData'
import { useToast } from '@/context/ToastContext'
import StatusChip from '@/components/admin/StatusChip'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

/**
 * Admin Customers page — frontend-only placeholder data (services/mockAdminData.js).
 * Same table + row-action + modal shell as the existing AdminReports/AdminUsers
 * pages. Disable/Enable toggles local component state only (no backend, no
 * persistence) so the row visibly responds; Edit is a placeholder — the
 * editor isn't part of this phase.
 */
export default function AdminCustomers() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)
  const [open, setOpen] = useState(null)

  const toggleStatus = (c) => {
    const next = c.status === 'active' ? 'disabled' : 'active'
    setCustomers((list) => list.map((x) => (x.id === c.id ? { ...x, status: next } : x)))
    toast({
      title: next === 'disabled' ? `${c.company} disabled` : `${c.company} re-enabled`,
      variant: next === 'disabled' ? 'warn' : 'success',
      color: next === 'disabled' ? 'rose' : 'emerald',
    })
  }

  const editPlaceholder = (c) => toast({ title: 'Editing coming soon', description: `${c.company} — customer editing isn’t wired up yet.`, variant: 'info', color: 'sky' })

  return (
    <>
      <Reveal>
        <p className="eyebrow text-accent"><Building2 className="h-3.5 w-3.5" /> Admin · Customers</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Every customer account in one place.
        </h1>
      </Reveal>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="px-5 py-3.5 font-medium">Company</th>
              <th className="px-5 py-3.5 font-medium">Contact</th>
              <th className="px-5 py-3.5 font-medium">Plan</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Reports</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                <td className="px-5 py-3.5 font-medium">{c.company}</td>
                <td className="px-5 py-3.5 text-muted">{c.contact}</td>
                <td className="px-5 py-3.5">{c.plan}</td>
                <td className="px-5 py-3.5"><StatusChip status={c.status} /></td>
                <td className="px-5 py-3.5">{c.reportsCount}</td>
                <td className="px-5 py-3.5 text-muted">{fmt(c.joinedAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="soft" magnetic={false} onClick={() => setOpen(c)}>View</Button>
                    <button
                      onClick={() => editPlaceholder(c)}
                      aria-label={`Edit ${c.company}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleStatus(c)}
                      aria-label={c.status === 'active' ? `Disable ${c.company}` : `Enable ${c.company}`}
                      className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-rose/40 hover:text-rose"
                    >
                      {c.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>{open && <CustomerModal customer={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </>
  )
}

function CustomerModal({ customer, onClose }) {
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
        className="relative w-full max-w-md rounded-[1.75rem] border border-ink/10 bg-card p-7 shadow-float"
      >
        <button onClick={onClose} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-lg font-semibold text-white">
          {customer.company.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">{customer.company}</h2>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><User className="h-3.5 w-3.5" /> {customer.contact}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><Mail className="h-3.5 w-3.5" /> {customer.email}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted"><CalendarDays className="h-3.5 w-3.5" /> Joined {fmt(customer.joinedAt)}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-ink/8 bg-paper p-4">
            <p className="font-display text-xl font-semibold tracking-tight">{customer.plan}</p>
            <p className="mt-0.5 text-xs text-muted">Plan</p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-paper p-4">
            <p className="font-display text-xl font-semibold tracking-tight">{customer.reportsCount}</p>
            <p className="mt-0.5 text-xs text-muted">Reports</p>
          </div>
          <div className="rounded-2xl border border-ink/8 bg-paper p-4">
            <StatusChip status={customer.status} />
            <p className="mt-1.5 text-xs text-muted">Status</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
