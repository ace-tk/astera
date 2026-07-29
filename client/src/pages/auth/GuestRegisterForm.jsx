import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { CALLING_CODES, callingCodeLabel, dialFromLabel } from '@/constants/callingCodes'
import { PHONE_RE, EMAIL_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import { Field } from './AuthShell'

const FIELD_INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-ink/12 bg-paper px-4 text-sm text-ink outline-none transition-colors hover:border-ink/25 focus:border-accent'

const CODE_LABELS = CALLING_CODES.map(callingCodeLabel)
const DEFAULT_CODE = CALLING_CODES.find((c) => c.iso2 === 'IN') || CALLING_CODES[0]

const EMPTY = {
  firstName: '', lastName: '', email: '', callingCode: callingCodeLabel(DEFAULT_CODE), phoneNumber: '',
  password: '', confirmPassword: '',
}

/** Simplified registration for individuals — no company/VAT/LinkedIn fields. */
export default function GuestRegisterForm({ onSubmit: submit, busy, serverError }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required.'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.'
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address.'
    const dial = dialFromLabel(form.callingCode)
    const phone = `${dial}${form.phoneNumber.trim()}`
    if (!form.phoneNumber.trim() || !PHONE_RE.test(phone)) errs.phoneNumber = 'Enter a valid contact number.'
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    const dial = dialFromLabel(form.callingCode)
    submit({
      accountType: 'guest',
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: `${dial}${form.phoneNumber.trim()}`,
      password: form.password,
      confirmPassword: form.confirmPassword,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <span className="eyebrow text-accent">Your details</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="First name" id="firstName" required value={form.firstName} onChange={set('firstName')} placeholder="Ada" error={errors.firstName} />
          <Field label="Last name" id="lastName" required value={form.lastName} onChange={set('lastName')} placeholder="Lovelace" error={errors.lastName} />
          <div className="sm:col-span-2">
            <Field label="Email" id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
          </div>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-ink">Contact number</span>
            <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-2">
              <SearchableSelect
                id="callingCode"
                value={form.callingCode}
                onChange={(v) => setForm((f) => ({ ...f, callingCode: v }))}
                options={CODE_LABELS}
                placeholder="Code"
                className={FIELD_INPUT_CLASS}
              />
              <input
                id="phoneNumber"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                placeholder="9876543210"
                className={
                  'h-12 w-full rounded-2xl border bg-paper px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent ' +
                  (errors.phoneNumber ? 'border-coral' : 'border-ink/12 hover:border-ink/25')
                }
              />
            </div>
            {errors.phoneNumber && <span className="mt-1 block text-xs text-coral">{errors.phoneNumber}</span>}
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
