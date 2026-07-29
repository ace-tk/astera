import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { COUNTRIES } from '@/constants/countries'
import { validateProfileFields, EMAIL_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import AuthShell, { Field } from './AuthShell'

// Matches Field's own input treatment so SearchableSelect sits visually
// identical to every other field in this form.
const FIELD_INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-ink/12 bg-paper px-4 text-sm text-ink outline-none transition-colors hover:border-ink/25 focus:border-accent'

const EMPTY = {
  companyName: '', vatNumber: '', country: '', firstName: '', lastName: '',
  phone: '', email: '', linkedinUrl: '', password: '', confirmPassword: '',
}

export default function Register() {
  const { register } = useAuth()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = validateProfileFields(form)
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      await register({
        companyName: form.companyName.trim(),
        vatNumber: form.vatNumber.trim(),
        country: form.country,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      setDone(true)
    } catch (err) {
      setError(err.status === 409 ? 'An account with that email already exists.' : err.data?.error || err.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell eyebrow="Almost there" title="Check your email">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
            <Mail className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            We sent a verification link to <span className="font-medium text-ink">{form.email}</span>. Click it to
            activate your account, then sign in.
          </p>
          <Button as={Link} to="/login" variant="accent" size="lg" className="mt-7 w-full">
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your ATOOPV account"
      subtitle="Tell us about your business — we’ll set up your workspace and send a verification link."
      wide
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <div>
          <span className="eyebrow text-accent">Company</span>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Company name" id="companyName" required value={form.companyName} onChange={set('companyName')} placeholder="Acme Inc." error={errors.companyName} />
            </div>
            <Field label="VAT number" id="vatNumber" required value={form.vatNumber} onChange={set('vatNumber')} placeholder="VAT123456" error={errors.vatNumber} />
            <label htmlFor="country" className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink">Country</span>
              <SearchableSelect
                id="country"
                value={form.country}
                onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                options={COUNTRIES}
                placeholder="Select country"
                className={FIELD_INPUT_CLASS}
                error={errors.country}
              />
              {errors.country && <span className="mt-1 block text-xs text-coral">{errors.country}</span>}
            </label>
          </div>
        </div>

        <div>
          <span className="eyebrow text-accent">Your details</span>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="First name" id="firstName" required value={form.firstName} onChange={set('firstName')} placeholder="Ada" error={errors.firstName} />
            <Field label="Last name" id="lastName" required value={form.lastName} onChange={set('lastName')} placeholder="Lovelace" error={errors.lastName} />
            <Field
              label="Contact number"
              id="phone"
              required
              value={form.phone}
              onChange={set('phone')}
              placeholder="+14155550123"
              hint={!errors.phone ? 'Include the country code.' : undefined}
              error={errors.phone}
            />
            <Field label="Business email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="you@company.com" error={errors.email} />
            <div className="sm:col-span-2">
              <Field label="LinkedIn profile URL" id="linkedinUrl" required value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/you" error={errors.linkedinUrl} />
            </div>
          </div>
        </div>

        <div>
          <span className="eyebrow text-accent">Security</span>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              hint={!errors.password ? 'At least 8 characters.' : undefined}
              error={errors.password}
            />
            <Field
              label="Confirm password"
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full" magnetic={false} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
