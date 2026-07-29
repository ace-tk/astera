import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/constants/countries'
import { validateProfileFields, EMAIL_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import { Field } from './AuthShell'

const FIELD_INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-ink/12 bg-paper px-4 text-sm text-ink outline-none transition-colors hover:border-ink/25 focus:border-accent'

const EMPTY = {
  companyName: '', vatNumber: '', country: '', firstName: '', lastName: '',
  phone: '', email: '', linkedinUrl: '', password: '', confirmPassword: '',
}

/** Full business registration — unchanged from the original single-form flow. */
export default function CompanyRegisterForm({ onSubmit: submit, busy, serverError }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = validateProfileFields(form)
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    submit({
      accountType: 'company',
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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

      {serverError && (
        <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
          {serverError}
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
  )
}
