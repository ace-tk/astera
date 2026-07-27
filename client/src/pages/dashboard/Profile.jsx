import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Mail, UserRound, CalendarDays, FileText, Clock, ThumbsUp, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useReports } from '@/hooks/useReports'
import { useToast } from '@/context/ToastContext'
import { updateProfileRequest } from '@/services/auth'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

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

  // Seed the name once the session (re)loads — state init runs before user is ready.
  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

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
