import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Building2, User, Shield, FileText, ExternalLink, Check, X, Ban, Power,
  Mail, KeyRound, PencilLine, UploadCloud, Download, Eye,
} from 'lucide-react'
import {
  fetchAdminCustomer, updateAdminCustomer, updateAdminCustomerStatus,
  resendCustomerInvitation, resendCustomerVerification, resetCustomerPassword, uploadReportToCustomer,
} from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import { COUNTRIES } from '@/constants/countries'
import { categoryIcon } from '@/utils/reportCategory'
import { validateProfileFields } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import ReportComposer from '@/components/admin/ReportComposer'
import StatusChip from '@/components/admin/StatusChip'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSaving, setUploadSaving] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => fetchAdminCustomer(id),
    retry: false,
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'customer', id] })
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
    onSuccess: () => toast({ title: 'Password reset — a new temporary password was emailed', variant: 'success', color: 'emerald' }),
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

  const { customer, reports } = data

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
        </div>
        <h1 className="mt-4 font-display text-display-sm font-semibold leading-[1.05] tracking-tight text-balance">
          {customer.companyName || customer.name}
        </h1>
        <p className="mt-1 text-sm text-muted">{customer.name} · {customer.email}</p>
      </Reveal>

      {/* Status / account actions */}
      <Reveal delay={0.04} className="mt-6">
        <div className="flex flex-wrap gap-2 rounded-3xl border border-ink/8 bg-card p-4 shadow-soft">
          <Button variant="soft" size="sm" magnetic={false} disabled={customer.status === 'active' || statusMutation.isPending} onClick={() => statusMutation.mutate('active')}>
            <Power className="h-4 w-4" /> Activate
          </Button>
          <Button variant="soft" size="sm" magnetic={false} disabled={customer.status === 'suspended' || statusMutation.isPending} onClick={() => statusMutation.mutate('suspended')}>
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
            <Button variant="soft" size="sm" magnetic={false} disabled={invitationMutation.isPending} onClick={() => invitationMutation.mutate()}>
              <Mail className="h-4 w-4" /> Resend invitation
            </Button>
          )}
          <Button variant="soft" size="sm" magnetic={false} disabled={resetPasswordMutation.isPending} onClick={() => resetPasswordMutation.mutate()}>
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
              <ReportComposer saving={uploadSaving} onSaveDraft={uploadReport} onPublish={uploadReport} />
            </div>
          </div>
        </Reveal>
      )}

      {/* Company / Personal / Account info */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
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

        <Reveal delay={0.1} className="sm:col-span-2">
          <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted"><Shield className="h-3.5 w-3.5" /> Account</span>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Detail label="Verification status" value={customer.emailVerified ? 'Verified' : 'Unverified'} />
              <Detail label="Created" value={fmtDate(customer.createdAt)} />
              <Detail label="Last login" value={fmtDateTime(customer.lastLoginAt)} />
            </div>
          </div>
        </Reveal>
      </div>

      {/* Reports */}
      <Reveal delay={0.12} className="mt-6">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-muted" />
          <h2 className="font-display text-lg font-medium tracking-tight">Reports</h2>
          <span className="text-sm text-muted">({reports.length})</span>
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

function EditCustomerForm({ customer, onSaved }) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    companyName: customer.companyName || '', vatNumber: customer.vatNumber || '', country: customer.country || '',
    firstName: customer.firstName || '', lastName: customer.lastName || '', phone: customer.phone || '', linkedinUrl: customer.linkedinUrl || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validateProfileFields(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await updateAdminCustomer(customer.id, form)
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
        <F label="LinkedIn profile URL">
          <input value={form.linkedinUrl} onChange={set('linkedinUrl')} className="input" />
          {errors.linkedinUrl && <Err>{errors.linkedinUrl}</Err>}
        </F>
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
