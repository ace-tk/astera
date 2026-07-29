import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Search, ExternalLink, ChevronLeft, ChevronRight, UserPlus, ArrowUpDown, Power, Ban } from 'lucide-react'
import { fetchAdminCustomers, bulkUpdateAdminCustomerStatus } from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import { ACCOUNT_STATUSES, COUNTRIES } from '@/constants/countries'
import StatusChip from '@/components/admin/StatusChip'
import SearchableSelect from '@/components/ui/SearchableSelect'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { cn } from '@/utils/cn'

const fmt = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')

const COLUMNS = [
  { key: 'companyName', label: 'Company' },
  { key: 'name', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: null, label: 'Contact' },
  { key: 'country', label: 'Country' },
  { key: null, label: 'VAT' },
  { key: null, label: 'LinkedIn' },
  { key: null, label: 'Verification' },
  { key: null, label: 'Status' },
  { key: null, label: 'Reports' },
  { key: 'createdAt', label: 'Created' },
]

const BULK_META = {
  activate: { title: 'Activate the selected customers?', confirmLabel: 'Activate', icon: Power, color: 'emerald' },
  suspend: { title: 'Suspend the selected customers?', description: 'They will lose access immediately. You can reactivate anytime.', confirmLabel: 'Suspend', icon: Ban, color: 'rose', danger: true },
}

export default function AdminCustomers() {
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [verified, setVerified] = useState('')
  const [country, setCountry] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const [bulkConfirm, setBulkConfirm] = useState(null) // 'activate' | 'suspend' | null
  const pageSize = 20

  const qc = useQueryClient()
  const { toast } = useToast()

  // Debounced search — keeps the list fast/responsive while typing instead of
  // refetching on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => { setQ(qInput); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [qInput])

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'customers', { q, status, verified, country, sort, page }],
    queryFn: () => fetchAdminCustomers({ q, status, verified, country, sort, page, pageSize }),
  })

  const customers = data?.customers || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const bulkMutation = useMutation({
    mutationFn: (statusValue) => bulkUpdateAdminCustomerStatus(Array.from(selected), statusValue),
    onSuccess: (_r, statusValue) => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] })
      toast({ title: `${selected.size} customer${selected.size === 1 ? '' : 's'} ${statusValue}`, variant: 'success', color: statusValue === 'active' ? 'emerald' : 'rose' })
      setSelected(new Set())
    },
    onError: () => toast({ title: 'Couldn’t update selected customers', variant: 'warn', color: 'rose' }),
  })

  const toggleSort = (key) => {
    if (!key) return
    setPage(1)
    setSort((s) => (s === key ? `-${key}` : s === `-${key}` ? key : `-${key}`))
  }

  const toggleOne = (id) => setSelected((s) => {
    const next = new Set(s)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  const allOnPageSelected = customers.length > 0 && customers.every((c) => selected.has(c.id))
  const toggleAllOnPage = () => setSelected((s) => {
    if (allOnPageSelected) {
      const next = new Set(s)
      customers.forEach((c) => next.delete(c.id))
      return next
    }
    const next = new Set(s)
    customers.forEach((c) => next.add(c.id))
    return next
  })

  const bm = bulkConfirm ? BULK_META[bulkConfirm] : null

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Reveal>
          <p className="eyebrow text-accent"><Building2 className="h-3.5 w-3.5" /> Admin · Customers</p>
          <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
            Every customer account in one place.
          </h1>
        </Reveal>
        <Button as={Link} to="/app/admin/customers/new" variant="accent" size="sm">
          <UserPlus className="h-4 w-4" /> Create Customer
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search company, name, email, VAT, or phone…"
            aria-label="Search customers"
            className="h-11 w-full rounded-full border border-ink/8 bg-card pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </label>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          aria-label="Filter by account status"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          <option value="">All statuses</option>
          {ACCOUNT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={verified}
          onChange={(e) => { setVerified(e.target.value); setPage(1) }}
          aria-label="Filter by verification"
          className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
        >
          <option value="">Any verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
        <div className="w-44">
          <SearchableSelect
            value={country}
            onChange={(v) => { setCountry(v); setPage(1) }}
            options={COUNTRIES}
            placeholder="All countries"
            className="h-11 rounded-full border border-ink/8 bg-card px-4 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="soft" size="sm" magnetic={false} onClick={() => setBulkConfirm('activate')} disabled={bulkMutation.isPending}>
              <Power className="h-3.5 w-3.5" /> Activate
            </Button>
            <Button variant="soft" size="sm" magnetic={false} onClick={() => setBulkConfirm('suspend')} disabled={bulkMutation.isPending}>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </Button>
            <Button variant="ghost" size="sm" magnetic={false} onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
        <table className="w-full min-w-[76rem] text-left text-sm">
          <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  aria-label="Select all customers on this page"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  className="h-4 w-4 rounded border-ink/20 accent-accent"
                />
              </th>
              {COLUMNS.map((c) => (
                <th key={c.label} className="px-4 py-3.5 font-medium">
                  {c.key ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                      {c.label} <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : c.label}
                </th>
              ))}
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={13} className="px-4 py-8 text-center text-muted">Loading customers…</td></tr>}
            {!isLoading && customers.map((c) => (
              <tr key={c.id} className={cn('border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]', selected.has(c.id) && 'bg-accent/[0.04]')}>
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${c.name}`}
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="h-4 w-4 rounded border-ink/20 accent-accent"
                  />
                </td>
                <td className="px-4 py-3.5 font-medium">{c.companyName || '—'}</td>
                <td className="px-4 py-3.5">{c.name}</td>
                <td className="px-4 py-3.5 text-muted">{c.email}</td>
                <td className="px-4 py-3.5 text-muted">{c.phone || '—'}</td>
                <td className="px-4 py-3.5 text-muted">{c.country || '—'}</td>
                <td className="px-4 py-3.5 text-muted">{c.vatNumber || '—'}</td>
                <td className="px-4 py-3.5">
                  {c.linkedinUrl ? (
                    <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-royal hover:underline" onClick={(e) => e.stopPropagation()}>
                      Profile <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', c.emailVerified ? 'bg-emerald/10 text-emerald' : 'bg-orange/10 text-orange')}>
                    {c.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-4 py-3.5"><StatusChip status={c.status} /></td>
                <td className="px-4 py-3.5">{c.reportsCount ?? 0}</td>
                <td className="px-4 py-3.5 text-muted">{fmt(c.createdAt)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end">
                    <Button as={Link} to={`/app/admin/customers/${c.id}`} size="sm" variant="soft" magnetic={false}>Open</Button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && customers.length === 0 && <tr><td colSpan={13} className="px-4 py-8 text-center text-muted">No customers match.</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {totalPages} · {total} customer{total === 1 ? '' : 's'}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="grid h-9 w-9 place-items-center rounded-full border border-ink/8 text-muted transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(bulkConfirm)}
        onCancel={() => setBulkConfirm(null)}
        onConfirm={() => { bulkMutation.mutate(bulkConfirm === 'activate' ? 'active' : 'suspended'); setBulkConfirm(null) }}
        busy={bulkMutation.isPending}
        icon={bm?.icon}
        color={bm?.color}
        title={bm?.title}
        description={bm?.description}
        confirmLabel={bm?.confirmLabel}
        danger={bm?.danger}
      />
    </>
  )
}
