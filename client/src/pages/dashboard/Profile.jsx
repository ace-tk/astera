import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Mail, UserRound, CalendarDays, FileText, Clock, ThumbsUp, Lock, Building2, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useReports } from '@/hooks/useReports'
import { useToast } from '@/context/ToastContext'
import { updateProfileRequest } from '@/services/auth'
import { COUNTRIES } from '@/constants/countries'
import { VAT_RE, PHONE_RE, LINKEDIN_RE } from '@/utils/validators'
import SearchableSelect from '@/components/ui/SearchableSelect'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const COMPANY_FIELDS = ['companyName', 'vatNumber', 'country', 'firstName', 'lastName', 'phone', 'linkedinUrl']
const companyOf = (u) => Object.fromEntries(COMPANY_FIELDS.map((k) => [k, u?.[k] || '']))

/** These are optional profile fields (unlike signup) — only validate format
 * on whatever the customer has actually filled in, never require presence. */
function validateCompanyPartial(f) {
  const errs = {}
  if (f.vatNumber && !VAT_RE.test(f.vatNumber)) errs.vatNumber = 'Enter a valid VAT number.'
  if (f.phone && !PHONE_RE.test(f.phone)) errs.phone = 'Enter a valid phone number with country code.'
  if (f.linkedinUrl && !LINKEDIN_RE.test(f.linkedinUrl)) errs.linkedinUrl = 'Enter a valid LinkedIn profile URL.'
  return errs
}

const initialsOf = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || 'U'

const fmtDate = (d) => {
  if (!d) return null
  const date = new Date(d)
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Profile() {
  const { isAuthed, isLoading, user, setUser, logout } = useAuth()
  const { data: reports = [] } = useReports()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState(companyOf(user))
  const [companyErrors, setCompanyErrors] = useState({})
  const [companySaving, setCompanySaving] = useState(false)

  // Seed the name once the session (re)loads — state init runs before user is ready.
  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user) setCompany(companyOf(user))
  }, [user])

  // Demo / guest — no profile to edit.
  if (!isLoading && !isAuthed) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-6 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">Profiles are available after creating an account.</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            You’re exploring the demo. Create a free account to upload real meetings and manage your own profile.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button as={Link} to="/register" variant="accent" magnetic={false}>Create account</Button>
            <Button as={Link} to="/login" variant="soft" magnetic={false}>Sign in</Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-full bg-card" />
        <div className="h-40 animate-pulse rounded-3xl bg-card" />
      </div>
    )
  }

  const created = fmtDate(user.createdAt)
  const lastReport = reports.length ? [...reports].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null
  const feedbackCount = reports.filter((r) => r.feedback && r.feedback.useful != null).length
  const dirty = name.trim() && name.trim() !== user.name

  const save = async () => {
    setSaving(true)
    try {
      const { user: updated } = await updateProfileRequest({ name: name.trim() })
      setUser(updated)
      toast({ title: 'Profile updated', description: 'Your name is saved.', variant: 'success', color: 'emerald' })
    } catch (err) {
      toast({ title: 'Couldn’t save', description: err?.message || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setSaving(false)
    }
  }

  const onLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const companyDirty = COMPANY_FIELDS.some((k) => company[k] !== (user[k] || ''))
  const saveCompany = async () => {
    const errs = validateCompanyPartial(company)
    setCompanyErrors(errs)
    if (Object.keys(errs).length) return
    setCompanySaving(true)
    try {
      // Only send fields that actually have a value — empty optional fields
      // stay unset rather than failing format validation server-side.
      const payload = Object.fromEntries(Object.entries(company).filter(([, v]) => v.trim()))
      const { user: updated } = await updateProfileRequest(payload)
      setUser(updated)
      toast({ title: 'Company details saved', variant: 'success', color: 'emerald' })
    } catch (err) {
      toast({ title: 'Couldn’t save', description: err?.data?.error || 'Please try again.', variant: 'warn', color: 'rose' })
    } finally {
      setCompanySaving(false)
    }
  }

  const STATS = [
    { icon: FileText, label: 'Reports created', value: reports.length, color: 'text-royal' },
    { icon: Clock, label: 'Last generated', value: lastReport ? new Date(lastReport.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—', color: 'text-purple' },
    { icon: ThumbsUp, label: 'Feedback given', value: feedbackCount, color: 'text-emerald' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <p className="eyebrow text-accent">Profile</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          {user.name}
        </h1>
        {created && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="h-4 w-4" /> Member since {created}
          </p>
        )}
      </Reveal>

      {/* Identity */}
      <Reveal delay={0.05} className="mt-10">
        <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-semibold text-white">
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-medium">{user.name}</p>
              <p className="inline-flex items-center gap-1.5 text-sm text-muted"><Mail className="h-3.5 w-3.5" /> {user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Name</span>
              <div className="flex gap-2">
                <span className="pointer-events-none grid w-11 shrink-0 place-items-center rounded-xl bg-paper text-muted"><UserRound className="h-4 w-4" /></span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input flex-1" aria-label="Name" />
                <Button size="sm" variant="accent" onClick={save} disabled={!dirty || saving} magnetic={false}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Email</span>
              <div className="flex items-center gap-2">
                <span className="pointer-events-none grid w-11 shrink-0 place-items-center rounded-xl bg-paper text-muted"><Mail className="h-4 w-4" /></span>
                <input value={user.email} readOnly disabled className="input flex-1 cursor-not-allowed opacity-70" aria-label="Email (read-only)" />
              </div>
              <span className="mt-1.5 block text-xs text-muted">Email can’t be changed in this version.</span>
            </label>

            <div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">Theme preference</span>
              <ThemeSwitcher align="left" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Company details — guest accounts never had a company profile to fill in */}
      {user.accountType !== 'guest' && (
      <Reveal delay={0.08} className="mt-6">
        <div className="rounded-3xl border border-ink/8 bg-card p-6 shadow-soft sm:p-8">
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted">
            <Building2 className="h-3.5 w-3.5" /> Company details
          </span>
          <p className="mt-1.5 text-xs text-muted">Optional — fill in whenever you like.</p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <CF label="Company name" className="sm:col-span-2">
              <input value={company.companyName} onChange={(e) => setCompany((c) => ({ ...c, companyName: e.target.value }))} className="input" placeholder="Acme Inc." />
            </CF>
            <CF label="VAT number" error={companyErrors.vatNumber}>
              <input value={company.vatNumber} onChange={(e) => setCompany((c) => ({ ...c, vatNumber: e.target.value }))} className="input" placeholder="VAT123456" />
            </CF>
            <CF label="Country">
              <SearchableSelect value={company.country} onChange={(v) => setCompany((c) => ({ ...c, country: v }))} options={COUNTRIES} placeholder="Select country" />
            </CF>
            <CF label="First name">
              <input value={company.firstName} onChange={(e) => setCompany((c) => ({ ...c, firstName: e.target.value }))} className="input" placeholder="Ada" />
            </CF>
            <CF label="Last name">
              <input value={company.lastName} onChange={(e) => setCompany((c) => ({ ...c, lastName: e.target.value }))} className="input" placeholder="Lovelace" />
            </CF>
            <CF label="Contact number" error={companyErrors.phone}>
              <input value={company.phone} onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))} className="input" placeholder="+14155550123" />
            </CF>
            <CF label="LinkedIn profile URL" error={companyErrors.linkedinUrl}>
              <input value={company.linkedinUrl} onChange={(e) => setCompany((c) => ({ ...c, linkedinUrl: e.target.value }))} className="input" placeholder="https://linkedin.com/in/you" />
            </CF>
          </div>

          <div className="mt-6 flex justify-end border-t border-ink/8 pt-5">
            <Button size="sm" variant="accent" onClick={saveCompany} disabled={!companyDirty || companySaving} magnetic={false}>
              <Check className="h-4 w-4" /> {companySaving ? 'Saving…' : 'Save company details'}
            </Button>
          </div>
        </div>
      </Reveal>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={0.1 + i * 0.05}>
            <div className="rounded-2xl border border-ink/8 bg-card p-5 text-center shadow-soft">
              <s.icon className={cn('mx-auto h-5 w-5', s.color)} />
              <div className="mt-2 font-display text-2xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-muted">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Logout */}
      <Reveal delay={0.15} className="mt-6">
        <div className="flex items-center justify-between rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-muted">End your session on this device.</p>
          </div>
          <Button variant="soft" size="sm" onClick={onLogout} magnetic={false}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </Reveal>
    </div>
  )
}

function CF({ label, children, className, error }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose">{error}</span>}
    </label>
  )
}
