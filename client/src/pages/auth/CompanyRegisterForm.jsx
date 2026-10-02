import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { COUNTRIES } from '@/constants/countries'
import { validateProfileFields, EMAIL_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import { Field } from './AuthShell'
import TermsAcceptance from './TermsAcceptance'

const FIELD_INPUT_CLASS =
  'h-12 w-full rounded-2xl border border-ink/12 bg-paper px-4 text-sm text-ink outline-none transition-colors hover:border-ink/25 focus:border-accent'

const EMPTY = {
  companyName: '', vatNumber: '', country: '', firstName: '', lastName: '',
  phone: '', email: '', linkedinUrl: '', password: '', confirmPassword: '',
}

// French translations of validateProfileFields()'s field-level messages — kept
// local to this public-facing form rather than translated in validators.js
// itself, since that same shared function also drives the (English) admin
// panel's customer-creation forms, which aren't part of this fix.
const FIELD_ERROR_FR = {
  companyName: 'Le nom de l’entreprise est obligatoire.',
  vatNumber: 'Saisissez un numéro de TVA valide.',
  country: 'Sélectionnez un pays.',
  firstName: 'Le prénom est obligatoire.',
  lastName: 'Le nom est obligatoire.',
  phone: 'Saisissez un numéro de téléphone valide, avec l’indicatif pays, ex. +14155550123.',
  linkedinUrl: 'Saisissez une URL de profil LinkedIn valide.',
}
const translateFieldErrors = (errs) => Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, FIELD_ERROR_FR[k] || v]))

/** Full business registration — unchanged from the original single-form flow. */
export default function CompanyRegisterForm({ onSubmit: submit, busy, serverError }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs = translateFieldErrors(validateProfileFields(form))
    if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) errs.email = 'Saisissez une adresse e-mail valide.'
    if (!form.password || form.password.length < 8) errs.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Les mots de passe ne correspondent pas.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (!termsAccepted) return // defensive — the submit button is already disabled until this is true
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
      termsAccepted,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <span className="eyebrow text-accent">Entreprise</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nom de l’entreprise" id="companyName" required value={form.companyName} onChange={set('companyName')} placeholder="Acme Inc." error={errors.companyName} />
          </div>
          <Field label="Numéro de TVA" id="vatNumber" required value={form.vatNumber} onChange={set('vatNumber')} placeholder="VAT123456" error={errors.vatNumber} />
          <label htmlFor="country" className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Pays</span>
            <SearchableSelect
              id="country"
              value={form.country}
              onChange={(v) => setForm((f) => ({ ...f, country: v }))}
              options={COUNTRIES}
              placeholder="Sélectionner un pays"
              className={FIELD_INPUT_CLASS}
              error={errors.country}
            />
            {errors.country && <span className="mt-1 block text-xs text-coral">{errors.country}</span>}
          </label>
        </div>
      </div>

      <div>
        <span className="eyebrow text-accent">Vos informations</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" id="firstName" required value={form.firstName} onChange={set('firstName')} placeholder="Ada" error={errors.firstName} />
          <Field label="Nom" id="lastName" required value={form.lastName} onChange={set('lastName')} placeholder="Lovelace" error={errors.lastName} />
          <Field
            label="Numéro de contact"
            id="phone"
            required
            value={form.phone}
            onChange={set('phone')}
            placeholder="+14155550123"
            hint={!errors.phone ? 'Indiquez l’indicatif pays.' : undefined}
            error={errors.phone}
          />
          <Field label="E-mail professionnel" id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="vous@entreprise.com" error={errors.email} />
          <div className="sm:col-span-2">
            <Field label="URL du profil LinkedIn" id="linkedinUrl" required value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/vous" error={errors.linkedinUrl} />
          </div>
        </div>
      </div>

      <div>
        <span className="eyebrow text-accent">Sécurité</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            label="Mot de passe"
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            hint={!errors.password ? 'Au moins 8 caractères.' : undefined}
            error={errors.password}
          />
          <Field
            label="Confirmer le mot de passe"
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

      <TermsAcceptance onAccept={setTermsAccepted} />

      {serverError && (
        <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" className="w-full" magnetic={false} disabled={busy || !termsAccepted}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Création du compte…
          </>
        ) : (
          'Créer le compte'
        )}
      </Button>
    </form>
  )
}
