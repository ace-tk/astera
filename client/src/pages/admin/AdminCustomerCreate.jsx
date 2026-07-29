import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Check } from 'lucide-react'
import { createAdminCustomer } from '@/services/admin'
import { useToast } from '@/context/ToastContext'
import { COUNTRIES } from '@/constants/countries'
import { validateProfileFields, EMAIL_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'

const EMPTY = { companyName: '', vatNumber: '', country: '', firstName: '', lastName: '', phone: '', email: '', linkedinUrl: '' }

export default function AdminCustomerCreate() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [markVerified, setMarkVerified] = useState(true)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = validateProfileFields(form)
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    try {
      const customer = await createAdminCustomer({
        companyName: form.companyName.trim(),
        vatNumber: form.vatNumber.trim(),
        country: form.country,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        markVerified,
      })
      toast({ title: 'Customer created', description: 'Login credentials were emailed to them.', variant: 'success', color: 'emerald' })
      navigate(`/app/admin/customers/${customer.id}`)
    } catch (err) {
      toast({ title: 'Couldn’t create customer', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/admin/customers" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All customers
      </Link>

      <Reveal className="mt-6">
        <p className="eyebrow text-accent"><UserPlus className="h-3.5 w-3.5" /> New customer</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Create a customer account.
        </h1>
        <p className="mt-2 text-sm text-muted">A password is generated automatically and emailed to them along with a sign-in link.</p>
      </Reveal>

      <form onSubmit={onSubmit} className="mt-8 space-y-6 rounded-3xl border border-ink/8 bg-card p-6 shadow-soft sm:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <F label="Company name" className="sm:col-span-2">
            <input value={form.companyName} onChange={set('companyName')} className="input" placeholder="Acme Inc." />
            {errors.companyName && <Err>{errors.companyName}</Err>}
          </F>
          <F label="VAT number">
            <input value={form.vatNumber} onChange={set('vatNumber')} className="input" placeholder="VAT123456" />
            {errors.vatNumber && <Err>{errors.vatNumber}</Err>}
          </F>
          <F label="Country">
            <SearchableSelect value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} options={COUNTRIES} placeholder="Select country" />
            {errors.country && <Err>{errors.country}</Err>}
          </F>
          <F label="First name">
            <input value={form.firstName} onChange={set('firstName')} className="input" placeholder="Ada" />
            {errors.firstName && <Err>{errors.firstName}</Err>}
          </F>
          <F label="Last name">
            <input value={form.lastName} onChange={set('lastName')} className="input" placeholder="Lovelace" />
            {errors.lastName && <Err>{errors.lastName}</Err>}
          </F>
          <F label="Contact number">
            <input value={form.phone} onChange={set('phone')} className="input" placeholder="+14155550123" />
            {errors.phone && <Err>{errors.phone}</Err>}
          </F>
          <F label="Business email">
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="customer@company.com" />
            {errors.email && <Err>{errors.email}</Err>}
          </F>
          <F label="LinkedIn profile URL" className="sm:col-span-2">
            <input value={form.linkedinUrl} onChange={set('linkedinUrl')} className="input" placeholder="https://linkedin.com/in/customer" />
            {errors.linkedinUrl && <Err>{errors.linkedinUrl}</Err>}
          </F>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={markVerified} onChange={(e) => setMarkVerified(e.target.checked)} className="h-4 w-4 rounded border-ink/20 accent-royal" />
          Mark email as verified (customer can sign in immediately)
        </label>

        <div className="flex justify-end gap-2 border-t border-ink/8 pt-5">
          <Button as={Link} to="/app/admin/customers" variant="ghost" size="sm" magnetic={false}>Cancel</Button>
          <Button type="submit" variant="accent" size="sm" disabled={saving}>
            <Check className="h-4 w-4" /> {saving ? 'Creating…' : 'Create customer'}
          </Button>
        </div>
      </form>
    </div>
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
