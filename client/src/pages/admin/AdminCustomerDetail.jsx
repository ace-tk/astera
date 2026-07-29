import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Building2, User, Shield, FileText, ExternalLink, Check, X, Ban, Power,
  Mail, KeyRound, PencilLine, UploadCloud, Download, Eye, Clock, StickyNote, Trash2,
  UserPlus, LogIn, CheckCircle2, History, FolderOpen,
} from 'lucide-react'
import {
  fetchAdminCustomer, updateAdminCustomer, updateAdminCustomerStatus,
  resendCustomerInvitation, resendCustomerVerification, resetCustomerPassword, uploadReportToCustomer,
  fetchAdminCustomerActivity, fetchAdminCustomerNotes, createAdminCustomerNote, updateAdminCustomerNote, deleteAdminCustomerNote,
} from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import { COUNTRIES } from '@/constants/countries'
import { categoryIcon } from '@/utils/reportCategory'
import { validateProfileFields, PHONE_RE } from '@/utils/validators'
import { accent } from '@/utils/accent'
import SearchableSelect from '@/components/ui/SearchableSelect'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ReportComposer from '@/components/admin/ReportComposer'
import StatusChip from '@/components/admin/StatusChip'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')

const STAT_CARDS = [
  { key: 'totalReports', label: 'Total reports', icon: FileText, color: 'text-royal' },
  { key: 'pendingReports', label: 'Pending reports', icon: Clock, color: 'text-orange' },
  { key: 'deliveredReports', label: 'Delivered reports', icon: CheckCircle2, color: 'text-emerald' },
  { key: 'lastReportAt', label: 'Last uploaded', icon: UploadCloud, color: 'text-sky', format: fmtDate },
  { key: 'createdAt', label: 'Account created', icon: UserPlus, color: 'text-purple', format: fmtDate },
]

const ACTIVITY_META = {
  customer_created: { label: 'Account Created', icon: UserPlus, color: 'emerald' },
  customer_updated: { label: 'Profile Updated', icon: PencilLine, color: 'sky' },
  status_changed: { label: 'Status Changed', icon: Shield, color: 'orange' },
  password_reset: { label: 'Password Reset', icon: KeyRound, color: 'rose' },
  report_uploaded: { label: 'Report Uploaded', icon: UploadCloud, color: 'royal' },
  report_published: { label: 'Report Published', icon: FileText, color: 'emerald' },
  email_verified: { label: 'Email Verified', icon: Check, color: 'emerald' },
  last_login: { label: 'Last Login', icon: LogIn, color: 'sky' },
}

const CONFIRM_META = {
  activate: { title: 'Activate this customer?', confirmLabel: 'Activate', icon: Power, color: 'emerald' },
  suspend: { title: 'Suspend this customer?', description: 'They will lose access immediately. You can reactivate anytime.', confirmLabel: 'Suspend', icon: Ban, color: 'rose', danger: true },
  'reset-password': { title: 'Reset this customer’s password?', description: 'A new temporary password will be generated and emailed to them.', confirmLabel: 'Reset password', icon: KeyRound, color: 'orange' },
  'send-invitation': { title: 'Resend the account invitation?', description: 'A new temporary password will be generated and emailed.', confirmLabel: 'Send invitation', icon: Mail, color: 'sky' },
  'upload-report': { title: 'Upload this report?', description: 'It will be saved as a draft on this customer’s account.', confirmLabel: 'Upload', icon: UploadCloud, color: 'royal' },
}

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSaving, setUploadSaving] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // { type, payload? }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => fetchAdminCustomer(id),
    retry: false,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['admin', 'customer', id, 'activity'],
    queryFn: () => fetchAdminCustomerActivity(id),
    enabled: Boolean(data?.customer),
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'customer', id] })
    qc.invalidateQueries({ queryKey: ['admin', 'customer', id, 'activity'] })
    qc.invalidateQueries({ queryKey: ['admin', 'customers'] })
  }

  const statusMutation = useMutation({
    mutationFn: (status) => updateAdminCustomerStatus(id, status),
    onSuccess: (_c, status) => { refresh(); toast({ title: `Account ${status}`, variant: 'success', color: status === 'active' ? 'emerald' : 'rose' }) },
    onError: () => toast({ title: 'Couldn’t update status', description: 'Please try again.', variant: 'warn', color: 'rose' }),
  })

  const invitationMutation = useMutation({
    mutationFn: () => resendCustomerInvitation(id),
    onSuccess: () => toast({ title: 'Invitation resent', variant: 'success', color: 'emerald' }),
    onError: () => toast({ title: 'Couldn’t resend invitation', variant: 'warn', color: 'rose' }),
  })

  const verificationMutation = useMutation({
    mutationFn: () => resendCustomerVerification(id),
    onSuccess: () => toast({ title: 'Verification email resent', variant: 'success', color: 'emerald' }),
    onError: () => toast({ title: 'Couldn’t resend verification email', variant: 'warn', color: 'rose' }),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: () => resetCustomerPassword(id),
    onSuccess: () => { refresh(); toast({ title: 'Password reset — a new temporary password was emailed', variant: 'success', color: 'emerald' }) },
    onError: () => toast({ title: 'Couldn’t reset password', variant: 'warn', color: 'rose' }),
  })

  const uploadReport = async (payload) => {
    setUploadSaving(true)
    try {
      await uploadReportToCustomer(id, payload)
      refresh()
      setUploading(false)
      toast({ title: 'Report uploaded as a draft', description: 'Open it from Reports below to publish it.', variant: 'success', color: 'emerald' })
    } catch (err) {
      toast({ title: 'Couldn’t upload report', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setUploadSaving(false)
    }
  }

  const runConfirmed = () => {
    if (!confirmAction) return
    const { type, payload } = confirmAction
    if (type === 'activate') statusMutation.mutate('active')
    else if (type === 'suspend') statusMutation.mutate('suspended')
    else if (type === 'reset-password') resetPasswordMutation.mutate()
    else if (type === 'send-invitation') invitationMutation.mutate()
    else if (type === 'upload-report') uploadReport(payload)
    setConfirmAction(null)
  }

  const confirmBusy = statusMutation.isPending || resetPasswordMutation.isPending || invitationMutation.isPending || uploadSaving

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
        <div className="h-40 animate-pulse rounded-3xl bg-card" />
      </div>
    )
  }

  if (isError || !data?.customer) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div>
          <h2 className="font-display text-xl font-semibold">Customer not found</h2>
          <Button as={Link} to="/app/admin/customers" variant="soft" size="sm" className="mt-5"><ArrowLeft className="h-4 w-4" /> Back to customers</Button>
        </div>
      </div>
    )
  }

  const { customer, reports, stats = {} } = data
  const isGuest = customer.accountType === 'guest'
  const statValues = { ...stats, createdAt: customer.createdAt }
  const cm = confirmAction ? CONFIRM_META[confirmAction.type] : null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <Link to="/app/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All customers
        </Link>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="soft" size="sm" magnetic={false} onClick={() => setEditing((v) => !v)}>
            <PencilLine className="h-4 w-4" /> {editing ? 'Close editor' : 'Edit'}
          </Button>
          <Button variant="soft" size="sm" magnetic={false} onClick={() => setUploading((v) => !v)}>
            <UploadCloud className="h-4 w-4" /> {uploading ? 'Close' : 'Upload Report'}
          </Button>
        </div>
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={customer.status} />
          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', customer.emailVerified ? 'bg-emerald/10 text-emerald' : 'bg-orange/10 text-orange')}>
            {customer.emailVerified ? 'Verified' : 'Unverified'}
          </span>
          <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-xs font-medium text-muted">
            {isGuest ? 'Guest' : 'Company'}
          </span>
        </div>
        <h1 className="mt-4 font-display text-display-sm font-semibold leading-[1.05] tracking-tight text-balance">
          {customer.companyName || customer.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{customer.name} · {customer.email}</p>
      </Reveal>

      {/* Customer statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((c, i) => (
          <Reveal key={c.key} delay={i * 0.04}>
            <div className="rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
              <c.icon className={cn('h-5 w-5', c.color)} />
              <div className="mt-3 font-display text-2xl font-semibold tracking-tight">
                {c.format ? c.format(statValues[c.key]) : (statValues[c.key] ?? 0)}
              </div>
              <p className="mt-1 text-xs text-muted">{c.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Status / account actions */}
      <Reveal delay={0.04} className="mt-6">
        <div className="flex flex-wrap gap-2 rounded-3xl border border-ink/8 bg-card p-4 shadow-soft">
          <Button variant="soft" size="sm" magnetic={false} disabled={customer.status === 'active' || statusMutation.isPending} onClick={() => setConfirmAction({ type: 'activate' })}>
            <Power className="h-4 w-4" /> Activate
          </Button>
          <Button variant="soft" size="sm" magnetic={false} disabled={customer.status === 'suspended' || statusMutation.isPending} onClick={() => setConfirmAction({ type: 'suspend' })}>
            <Ban className="h-4 w-4" /> Suspend
          </Button>
          <Button variant="soft" size="sm" magnetic={false} disabled={customer.status === 'disabled' || statusMutation.isPending} onClick={() => statusMutation.mutate('disabled')} className="!text-rose">
            <X className="h-4 w-4" /> Disable
          </Button>
          {!customer.emailVerified && (
            <Button variant="soft" size="sm" magnetic={false} disabled={verificationMutation.isPending} onClick={() => verificationMutation.mutate()}>
              <Mail className="h-4 w-4" /> Resend verification
            </Button>
          )}
          {customer.invitedByAdmin && (
            <Button variant="soft" size="sm" magnetic={false} disabled={invitationMutation.isPending} onClick={() => setConfirmAction({ type: 'send-invitation' })}>
              <Mail className="h-4 w-4" /> Resend invitation
            </Button>
          )}
          <Button variant="soft" size="sm" magnetic={false} disabled={resetPasswordMutation.isPending} onClick={() => setConfirmAction({ type: 'reset-password' })}>
            <KeyRound className="h-4 w-4" /> Reset password
          </Button>
        </div>
      </Reveal>

      {editing && (
        <Reveal delay={0.05} className="mt-6">
          <EditCustomerForm customer={customer} onSaved={() => { refresh(); setEditing(false) }} />
        </Reveal>
      )}

      {uploading && (
        <Reveal delay={0.05} className="mt-6">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-medium tracking-tight">Upload a report to {customer.name}</h2>
            <p className="mt-1 text-sm text-muted">Saved as a draft first — publish it from the report editor when ready.</p>
            <div className="mt-6">
              <ReportComposer
                saving={uploadSaving}
                onSaveDraft={(payload) => setConfirmAction({ type: 'upload-report', payload })}
                onPublish={(payload) => setConfirmAction({ type: 'upload-report', payload })}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* Company / Personal / Account info — Company section hidden entirely for guests */}
      <div className={cn('mt-6 grid gap-6', isGuest ? '' : 'sm:grid-cols-2')}>
        {!isGuest && (
          <Reveal delay={0.06}>
            <div className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted"><Building2 className="h-3.5 w-3.5" /> Company</span>
              <div className="mt-4 space-y-3">
                <Detail label="Company name" value={customer.companyName} />
                <Detail label="VAT number" value={customer.vatNumber} />
                <Detail label="Country" value={customer.country} />
                <Detail
                  label="LinkedIn"
                  value={customer.linkedinUrl ? (
                    <a href={customer.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-royal hover:underline">
                      View profile <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                />
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={0.08}>
          <div className="h-full rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted"><User className="h-3.5 w-3.5" /> Personal</span>
            <div className="mt-4 space-y-3">
              <Detail label="First name" value={customer.firstName} />
              <Detail label="Last name" value={customer.lastName} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Contact number" value={customer.phone} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className={isGuest ? '' : 'sm:col-span-2'}>
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted"><Shield className="h-3.5 w-3.5" /> Account</span>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Detail label="Account type" value={isGuest ? 'Guest' : 'Company'} />
              <Detail label="Status" value={customer.status} />
              <Detail label="Verification status" value={customer.emailVerified ? 'Verified' : 'Unverified'} />
              <Detail label="Created" value={fmtDate(customer.createdAt)} />
              <Detail label="Last login" value={fmtDateTime(customer.lastLoginAt)} />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Activity timeline / audit history — read-only, admin-only, newest first */}
      <Reveal delay={0.12} className="mt-6">
        <div className="flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-muted" />
          <h2 className="font-display text-lg font-medium tracking-tight">Activity timeline</h2>
        </div>
        <div className="mt-4 rounded-3xl border border-ink/8 bg-card p-4 shadow-soft">
          {activity.length === 0 && <p className="px-2 py-4 text-center text-sm text-muted">No activity recorded yet.</p>}
          <ul className="divide-y divide-ink/5">
            {activity.map((e) => {
              const meta = ACTIVITY_META[e.type] || { label: e.type, icon: Clock, color: 'royal' }
              const a = accent(meta.color)
              return (
                <li key={e.id} className="flex items-start gap-3 px-2 py-3">
                  <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl', a.softBg, a.text)}>
                    <meta.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted">{e.actor} · {fmtDateTime(e.at)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Reveal>

      {/* Internal admin notes — private, never visible to the customer */}
      <Reveal delay={0.14} className="mt-6">
        <NotesPanel customerId={id} />
      </Reveal>

      {/* Reports */}
      <Reveal delay={0.16} className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-muted" />
            <h2 className="font-display text-lg font-medium tracking-tight">Reports</h2>
            <span className="text-sm text-muted">({reports.length})</span>
          </div>
          <Button as={Link} to={`/app/admin/files?customer=${customer.id}`} size="sm" variant="soft" magnetic={false}>
            <FolderOpen className="h-3.5 w-3.5" /> View all files
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-ink/8 bg-card shadow-soft">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-ink/8 text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3.5 font-medium">Report</th>
                <th className="px-4 py-3.5 font-medium">Meeting date</th>
                <th className="px-4 py-3.5 font-medium">Type</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Delivered</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const cat = categoryIcon(r.reportType || r.subtitle)
                return (
                  <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-ink/[0.02]">
                    <td className="px-4 py-3.5 font-medium">{r.title}</td>
                    <td className="px-4 py-3.5 text-muted">{fmtDate(r.date)}</td>
                    <td className="px-4 py-3.5 text-muted">
                      <span className="inline-flex items-center gap-1.5">{cat && <cat.icon className="h-3.5 w-3.5" />} {r.reportType || r.subtitle || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', r.publishStatus === 'published' ? 'bg-emerald/10 text-emerald' : 'bg-ink/[0.06] text-muted')}>
                        {r.publishStatus === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{r.publishStatus === 'published' ? fmtDate(r.updatedAt) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Button as={Link} to={`/app/admin/reports/${r.id}`} size="sm" variant="soft" magnetic={false}><Eye className="h-3.5 w-3.5" /> View</Button>
                        <Button as={Link} to={`/app/admin/reports/${r.id}?download=1`} size="sm" variant="soft" magnetic={false}><Download className="h-3.5 w-3.5" /> Download</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {reports.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No reports yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Reveal>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={runConfirmed}
        busy={confirmBusy}
        icon={cm?.icon}
        color={cm?.color}
        title={cm?.title}
        description={cm?.description}
        confirmLabel={cm?.confirmLabel}
        danger={cm?.danger}
      />
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      <p className="mt-1 text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

/** Private, admin-only notes about this customer — never exposed to the customer. */
function NotesPanel({ customerId }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  const { data: notes = [] } = useQuery({
    queryKey: ['admin', 'customer', customerId, 'notes'],
    queryFn: () => fetchAdminCustomerNotes(customerId),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'customer', customerId, 'notes'] })

  const addMutation = useMutation({
    mutationFn: (t) => createAdminCustomerNote(customerId, t),
    onSuccess: () => { setText(''); invalidate() },
    onError: () => toast({ title: 'Couldn’t add note', variant: 'warn', color: 'rose' }),
  })
  const editMutation = useMutation({
    mutationFn: ({ noteId, t }) => updateAdminCustomerNote(customerId, noteId, t),
    onSuccess: () => { setEditingId(null); invalidate() },
    onError: () => toast({ title: 'Couldn’t save note', variant: 'warn', color: 'rose' }),
  })
  const deleteMutation = useMutation({
    mutationFn: (noteId) => deleteAdminCustomerNote(customerId, noteId),
    onSuccess: invalidate,
    onError: () => toast({ title: 'Couldn’t delete note', variant: 'warn', color: 'rose' }),
  })

  return (
    <div>
      <div className="flex items-center gap-2">
        <StickyNote className="h-4.5 w-4.5 text-muted" />
        <h2 className="font-display text-lg font-medium tracking-tight">Internal notes</h2>
        <span className="text-xs text-muted">(admin-only — never shown to the customer)</span>
      </div>
      <div className="mt-4 rounded-3xl border border-ink/8 bg-card p-5 shadow-soft">
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a private note…"
            rows={2}
            className="input min-h-0 flex-1 resize-none py-2.5"
          />
          <Button
            variant="soft"
            size="sm"
            magnetic={false}
            disabled={!text.trim() || addMutation.isPending}
            onClick={() => addMutation.mutate(text.trim())}
            className="self-end"
          >
            Add
          </Button>
        </div>

        <ul className="mt-4 divide-y divide-ink/5">
          {notes.map((n) => (
            <li key={n.id} className="py-3">
              {editingId === n.id ? (
                <div className="flex gap-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={2}
                    className="input min-h-0 flex-1 resize-none py-2.5"
                  />
                  <div className="flex flex-col gap-1.5 self-end">
                    <Button size="sm" variant="accent" magnetic={false} disabled={editMutation.isPending} onClick={() => editMutation.mutate({ noteId: n.id, t: editingText.trim() })}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" magnetic={false} onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                    <p className="mt-1 text-xs text-muted">{n.authorName} · {fmtDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" magnetic={false} onClick={() => { setEditingId(n.id); setEditingText(n.text) }}>
                      <PencilLine className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" magnetic={false} className="!text-rose" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(n.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {notes.length === 0 && <li className="py-4 text-center text-sm text-muted">No notes yet.</li>}
        </ul>
      </div>
    </div>
  )
}

function EditCustomerForm({ customer, onSaved }) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    companyName: customer.companyName || '', vatNumber: customer.vatNumber || '', country: customer.country || '',
    firstName: customer.firstName || '', lastName: customer.lastName || '', phone: customer.phone || '', linkedinUrl: customer.linkedinUrl || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isGuest = customer.accountType === 'guest'

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = isGuest ? {} : validateProfileFields(form)
    if (!form.firstName.trim()) errs.firstName = 'First name is required.'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.'
    if (!form.phone.trim() || !PHONE_RE.test(form.phone.trim())) errs.phone = 'Enter a valid phone number with country code.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      const payload = isGuest
        ? { firstName: form.firstName, lastName: form.lastName, phone: form.phone }
        : form
      await updateAdminCustomer(customer.id, payload)
      toast({ title: 'Customer updated', variant: 'success', color: 'emerald' })
      onSaved()
    } catch (err) {
      toast({ title: 'Couldn’t save changes', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
      <h2 className="font-display text-lg font-medium tracking-tight">Edit customer details</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {!isGuest && (
          <>
            <F label="Company name" className="sm:col-span-2">
              <input value={form.companyName} onChange={set('companyName')} className="input" />
              {errors.companyName && <Err>{errors.companyName}</Err>}
            </F>
            <F label="VAT number">
              <input value={form.vatNumber} onChange={set('vatNumber')} className="input" />
              {errors.vatNumber && <Err>{errors.vatNumber}</Err>}
            </F>
            <F label="Country">
              <SearchableSelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} options={COUNTRIES} placeholder="Select country" />
              {errors.country && <Err>{errors.country}</Err>}
            </F>
          </>
        )}
        <F label="First name">
          <input value={form.firstName} onChange={set('firstName')} className="input" />
          {errors.firstName && <Err>{errors.firstName}</Err>}
        </F>
        <F label="Last name">
          <input value={form.lastName} onChange={set('lastName')} className="input" />
          {errors.lastName && <Err>{errors.lastName}</Err>}
        </F>
        <F label="Contact number">
          <input value={form.phone} onChange={set('phone')} className="input" />
          {errors.phone && <Err>{errors.phone}</Err>}
        </F>
        {!isGuest && (
          <F label="LinkedIn profile URL">
            <input value={form.linkedinUrl} onChange={set('linkedinUrl')} className="input" />
            {errors.linkedinUrl && <Err>{errors.linkedinUrl}</Err>}
          </F>
        )}
      </div>
      <div className="mt-6 flex justify-end border-t border-ink/8 pt-5">
        <Button type="submit" variant="accent" size="sm" disabled={saving}><Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  )
}

function F({ label, children, className }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  )
}

function Err({ children }) {
  return <span className="mt-1 block text-xs text-rose">{children}</span>
}
