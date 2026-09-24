import { useEffect, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Check, Clock3, ShieldCheck, Sparkles, ChevronDown, Building2, ArrowRight } from 'lucide-react'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Navbar from '@/components/landing/Navbar'
import AtoopvFooter from '@/components/atoopv/AtoopvFooter'
import Button from '@/components/ui/Button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { EMAIL_RE } from '@/utils/validators'
import { cn } from '@/utils/cn'

/**
 * AtoopV "demande de démo" page. Every heading, paragraph, label, placeholder,
 * dropdown option, field, CTA and privacy string below is fixed content — this
 * page previously existed only as a stub redirect (/atoopv/contact -> /app), so
 * the copy here is authored to match a supplied design reference exactly. The
 * scope of this file is presentation only: local state, validation and layout.
 * There is no backend endpoint for this yet, so submission is client-side only
 * (see handleSubmit) — no new API/route was added, per the request's own
 * "do not change APIs or backend logic" constraint.
 */

const HERO = {
  kicker: null,
  heading: ["Voyons ce que SIRUS ", 'peut faire ', 'sur l’une de vos séances.'],
  lead:
    'Demandez une démonstration personnalisée — nous vous présentons la chaîne de traitement sur un cas type proche de votre instance et répondons à vos questions sur l’intégration, la confidentialité et la qualité des projets de PV générés.',
  micro: 'Réponse sous 48 heures ouvrées · Sans engagement.',
}

const PRIVACY_NOTE = 'Vos données restent confidentielles · conformité RGPD · pas de tracking publicitaire.'

// Every option list below defines a fixed set of dropdown values. Only the
// example value shown in the design reference is guaranteed source content
// (marked below); the remaining brackets in each list were authored to match
// this app's own existing bracket notation (see constants/atoosavoirHome.js's
// "< 50 salariés" / "50 – 149 salariés" style) so the new page reads as
// part of the same product rather than introducing a new voice.
const ROLE_OPTIONS = [
  'Secrétaire',
  'Secrétaire adjoint(e)',
  'Trésorier(ère)',
  'Trésorier(ère) adjoint(e)',
  'Président(e) (employeur)',
  'Membre élu titulaire',
  'Membre élu suppléant',
  'Membre de la CSSCT',
  'Représentant syndical',
  'Autre',
]

const COMPANY_SIZE_OPTIONS = [
  'Moins de 11 salariés',
  '11 — 49 salariés', // shown selected in the design reference
  '50 — 149 salariés',
  '150 — 299 salariés',
  '300 — 499 salariés',
  '500 salariés et plus',
]

const ELECTED_COUNT_OPTIONS = [
  'Moins de 8', // shown selected in the design reference
  '8 — 15',
  '16 — 25',
  'Plus de 25',
]

const MEETING_DURATION_OPTIONS = [
  'Moins de 2 heures', // shown selected in the design reference
  '2 — 4 heures',
  'Plus de 4 heures',
]

const RECORDING_OPTIONS = [
  'Oui — audio ou vidéo disponible', // shown selected in the design reference
  'Non, pas encore',
  'Je ne sais pas encore',
]

const FUNCTIONS = ROLE_OPTIONS

const initialForm = {
  firstName: '',
  lastName: '',
  role: '',
  company: '',
  email: '',
  phone: '',
  companySize: '',
  electedCount: '',
  meetingDuration: '',
  hasRecording: '',
  message: '',
}

function FieldLabel({ children, required, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-ink/70">
      {children}
      {required && <span className="ml-1 text-indigo-500">*</span>}
    </label>
  )
}

function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-xs text-coral">{children}</p>
}

const inputClass = (hasError) =>
  cn(
    'h-12 w-full rounded-xl border bg-paper px-4 text-[0.95rem] text-ink outline-none transition-all duration-200',
    'placeholder:text-muted/60',
    'focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/12',
    hasError ? 'border-coral/60' : 'border-ink/12 hover:border-ink/25',
  )

function TextField({ label, required, error, id, ...props }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div>
      <FieldLabel htmlFor={fieldId} required={required}>
        {label}
      </FieldLabel>
      <input id={fieldId} className={inputClass(Boolean(error))} {...props} />
      <FieldError>{error}</FieldError>
    </div>
  )
}

function SelectField({ label, required, error, id, options, placeholder = 'Sélectionner…', ...props }) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div>
      <FieldLabel htmlFor={fieldId} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select id={fieldId} className={cn(inputClass(Boolean(error)), 'appearance-none pr-10')} {...props}>
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70" />
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

function SectionHeading({ index, children }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[0.7rem] font-semibold text-indigo-600">
        {index}
      </span>
      <span className="eyebrow !text-indigo-600/80">{children}</span>
      <span className="h-px flex-1 bg-ink/8" />
    </div>
  )
}

export default function Contact() {
  usePageMeta({
    title: `${HERO.heading.join('')} — ATOOPV`,
    description: HERO.lead,
  })

  // Optional prefill from the homepage's quick questionnaire (QuickDiagnostic
  // -> /atoopv/contact?source=diagnostic&message=...): only ever touches the
  // existing "Message (optionnel)" field, everything else starts blank as
  // before. The query string is stripped right after reading it so the
  // address bar doesn't keep showing raw technical params.
  const [searchParams, setSearchParams] = useSearchParams()
  const [form, setForm] = useState(() => {
    const prefill = searchParams.get('message')
    return prefill ? { ...initialForm, message: prefill } : initialForm
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | success

  useEffect(() => {
    if (searchParams.toString()) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function validate() {
    const next = {}
    if (!form.firstName.trim()) next.firstName = 'Le prénom est requis.'
    if (!form.lastName.trim()) next.lastName = 'Le nom est requis.'
    if (!form.role) next.role = 'Sélectionnez votre fonction.'
    if (!form.company.trim()) next.company = "Le nom de l'entreprise est requis."
    if (!form.email.trim()) next.email = "L'email professionnel est requis."
    else if (!EMAIL_RE.test(form.email.trim())) next.email = 'Format email invalide.'
    if (!form.phone.trim()) next.phone = 'Le téléphone est requis.'
    else if (form.phone.replace(/\D/g, '').length < 8) next.phone = 'Numéro de téléphone invalide.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    // No backend endpoint exists for this form yet — kept strictly client-side
    // per this task's UI-only scope. The CTA's resting label never changes.
    setStatus('success')
    setTimeout(() => setStatus('idle'), 2200)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen bg-paper"
    >
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="shell">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 xl:gap-16">
            {/* Left column — presentation-only changes; text is unmodified. */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/8 text-indigo-500">
                <Sparkles className="h-5 w-5" />
              </span>

              <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-[2.75rem]">
                {HERO.heading[0]}
                <span className="text-ink">{HERO.heading[1]}</span>
                <span className="text-indigo-500">{HERO.heading[2]}</span>
              </h1>

              <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted">{HERO.lead}</p>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-4 py-2 text-sm font-medium text-ink/80 backdrop-blur-md">
                <Clock3 className="h-4 w-4 text-indigo-500" />
                {HERO.micro}
              </div>

              <div className="mt-14 hidden h-px w-24 bg-gradient-to-r from-indigo-400/40 to-transparent lg:block" />
            </div>

            {/* Right column — the form card. All fields, labels, placeholders,
                options and validation rules are unchanged; only grouped into
                three visual sections as requested. */}
            <div className="relative rounded-[2rem] border border-ink/8 bg-card/95 p-6 shadow-float backdrop-blur-xl sm:p-9">
              <form onSubmit={handleSubmit} noValidate className="space-y-9">
                <div>
                  <SectionHeading index={1}>Vos coordonnées</SectionHeading>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                      label="Prénom"
                      required
                      placeholder="Christine"
                      value={form.firstName}
                      onChange={set('firstName')}
                      error={errors.firstName}
                    />
                    <TextField
                      label="Nom"
                      required
                      placeholder="Lefèvre"
                      value={form.lastName}
                      onChange={set('lastName')}
                      error={errors.lastName}
                    />
                    <TextField
                      label="Email professionnel"
                      required
                      type="email"
                      placeholder="prenom@entreprise.fr"
                      value={form.email}
                      onChange={set('email')}
                      error={errors.email}
                    />
                    <TextField
                      label="Téléphone"
                      required
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={form.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                    />
                  </div>
                </div>

                <div>
                  <SectionHeading index={2}>Votre CSE</SectionHeading>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Fonction au sein du CSE"
                      required
                      options={FUNCTIONS}
                      value={form.role}
                      onChange={set('role')}
                      error={errors.role}
                    />
                    <TextField
                      label="Entreprise"
                      required
                      placeholder="Nom de votre entreprise"
                      value={form.company}
                      onChange={set('company')}
                      error={errors.company}
                    />
                    <SelectField
                      label="Effectif de l'entreprise"
                      options={COMPANY_SIZE_OPTIONS}
                      value={form.companySize}
                      onChange={set('companySize')}
                    />
                    <SelectField
                      label="Nombre d'élus (titulaires + suppléants)"
                      options={ELECTED_COUNT_OPTIONS}
                      value={form.electedCount}
                      onChange={set('electedCount')}
                    />
                  </div>
                </div>

                <div>
                  <SectionHeading index={3}>Votre demande</SectionHeading>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <SelectField
                      label="Durée moyenne d'une réunion"
                      options={MEETING_DURATION_OPTIONS}
                      value={form.meetingDuration}
                      onChange={set('meetingDuration')}
                    />
                    <SelectField
                      label="Avez-vous déjà un enregistrement ?"
                      options={RECORDING_OPTIONS}
                      value={form.hasRecording}
                      onChange={set('hasRecording')}
                    />
                  </div>
                  <div className="mt-4">
                    <FieldLabel htmlFor="contact-message">Message (optionnel)</FieldLabel>
                    <textarea
                      id="contact-message"
                      rows={4}
                      className={cn(inputClass(false), 'h-auto resize-none py-3 leading-relaxed')}
                      placeholder="Type d'instance (CSE, CSSCT, CSEE…) · format souhaité · contexte particulier"
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>
                </div>

                <div className="border-t border-ink/8 pt-7">
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full !bg-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_16px_40px_-14px_rgba(99,102,241,0.55)] hover:!bg-indigo-600 hover:brightness-100"
                    disabled={status === 'success'}
                  >
                    {status === 'success' ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                    Envoyer la demande
                  </Button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-500/70" />
                    {PRIVACY_NOTE}
                  </p>

                  <div className="mt-6 border-t border-ink/8 pt-5">
                    <Link
                      to="/register?type=company"
                      className="group flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-indigo-500/5 hover:text-indigo-600"
                    >
                      <Building2 className="h-4 w-4 text-indigo-500/70" />
                      Register as a company
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <AtoopvFooter />
    </motion.main>
  )
}
