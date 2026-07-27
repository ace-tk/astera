import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ShieldCheck, Building, Palette, Bell, UserCircle, Lock, Check, KeyRound, Smartphone, LogOut,
} from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const SECTIONS = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account', icon: UserCircle },
  { id: 'security', label: 'Security', icon: Lock },
]

const BRAND_SWATCHES = [
  { id: 'royal', name: 'Royal', hex: '#365DF5' },
  { id: 'coral', name: 'Coral', hex: '#FF6B6B' },
  { id: 'golden', name: 'Golden', hex: '#F6C453' },
  { id: 'emerald', name: 'Emerald', hex: '#16B364' },
  { id: 'purple', name: 'Purple', hex: '#7C3AED' },
]

function Toggle({ on, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn('relative h-7 w-12 shrink-0 rounded-full transition-colors', on ? 'bg-accent' : 'bg-ink/15')}
    >
      <motion.span layout className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow', on ? 'left-6' : 'left-1')} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </button>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Card({ title, badge, children }) {
  return (
    <div className="rounded-3xl border border-ink/8 bg-card p-7 shadow-soft">
      {title && (
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
          {badge}
        </div>
      )}
      {children}
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-ink/8 bg-paper px-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
      />
    </label>
  )
}

/**
 * Admin Settings — UI only, no persistence. Same tab-rail + Card/Row/Toggle
 * grammar as the customer Settings page (reproduced locally rather than
 * imported, so that page's working implementation stays untouched); every
 * control here is local component state, nothing is saved anywhere.
 */
export default function AdminSettings() {
  const { toast } = useToast()
  const [tab, setTab] = useState('general')
  const [brand, setBrand] = useState('royal')
  const [notifs, setNotifs] = useState({ signup: true, reportSubmitted: true, weeklySummary: false, billing: true })
  const [twoFactor, setTwoFactor] = useState(true)

  const save = (section) => toast({ title: `${section} saved`, description: 'This is a UI-only preview — nothing was persisted.', variant: 'success', color: 'emerald' })

  return (
    <div>
      <Reveal>
        <p className="eyebrow text-accent">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin · Settings
        </p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Configure how the Admin Portal runs.
        </h1>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1.5 overflow-x-auto lg:sticky lg:top-4 lg:flex-col lg:self-start">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-colors',
                tab === s.id ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {tab === s.id && (
                <motion.span layoutId="admin-settings-tab" className="absolute inset-0 -z-10 rounded-2xl bg-ink/[0.05]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {tab === 'general' && (
              <Card title="Platform details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Platform name" defaultValue="ATOOPV" />
                  <Field label="Support email" type="email" defaultValue="support@atoopv.com" />
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Default timezone</span>
                    <select defaultValue="Europe/Paris" className="mt-1.5 h-11 w-full rounded-xl border border-ink/8 bg-paper px-4 text-sm outline-none transition-colors focus:border-accent">
                      <option>Europe/Paris</option>
                      <option>America/New_York</option>
                      <option>UTC</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Default language</span>
                    <select defaultValue="fr" className="mt-1.5 h-11 w-full rounded-xl border border-ink/8 bg-paper px-4 text-sm outline-none transition-colors focus:border-accent">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                </div>
                <div className="mt-5">
                  <Button size="sm" variant="soft" onClick={() => save('General')}>Save changes</Button>
                </div>
              </Card>
            )}

            {tab === 'branding' && (
              <Card title="Brand color">
                <p className="mb-5 text-sm text-muted">Pick the accent used across admin emails and exports.</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {BRAND_SWATCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBrand(b.id)}
                      className={cn('group relative overflow-hidden rounded-2xl border p-3 text-left transition-all', brand === b.id ? 'border-accent ring-2 ring-accent/20' : 'border-ink/8 hover:border-ink/20')}
                    >
                      <div className="h-12 rounded-lg" style={{ background: b.hex }} />
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs font-medium">{b.name}</p>
                        {brand === b.id && <Check className="h-3.5 w-3.5 text-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Company name shown in reports" defaultValue="ATOOPV" />
                  <Field label="Support link" defaultValue="https://atoopv.com/contact" />
                </div>
                <div className="mt-5">
                  <Button size="sm" variant="soft" onClick={() => save('Branding')}>Save changes</Button>
                </div>
              </Card>
            )}

            {tab === 'notifications' && (
              <Card title="Email notifications">
                <div className="divide-y divide-ink/8">
                  <Row title="New customer signup" desc="Get notified when a new company joins the platform.">
                    <Toggle on={notifs.signup} onChange={(v) => setNotifs((n) => ({ ...n, signup: v }))} label="New customer signup" />
                  </Row>
                  <Row title="Report submitted for review" desc="Get notified whenever a draft is ready for approval.">
                    <Toggle on={notifs.reportSubmitted} onChange={(v) => setNotifs((n) => ({ ...n, reportSubmitted: v }))} label="Report submitted for review" />
                  </Row>
                  <Row title="Weekly summary" desc="A digest of customers, reports, and activity every Monday.">
                    <Toggle on={notifs.weeklySummary} onChange={(v) => setNotifs((n) => ({ ...n, weeklySummary: v }))} label="Weekly summary" />
                  </Row>
                  <Row title="Billing alerts" desc="Failed payments and upcoming renewals.">
                    <Toggle on={notifs.billing} onChange={(v) => setNotifs((n) => ({ ...n, billing: v }))} label="Billing alerts" />
                  </Row>
                </div>
              </Card>
            )}

            {tab === 'account' && (
              <>
                <Card title="Your account">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-semibold text-white">PS</span>
                    <div>
                      <p className="font-medium">Priya Sharma</p>
                      <p className="text-sm text-muted">priya.sharma@astera.app</p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-royal/10 px-2.5 py-0.5 text-xs font-medium text-royal">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" defaultValue="Priya Sharma" />
                    <Field label="Email" type="email" defaultValue="priya.sharma@astera.app" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button size="sm" variant="soft" onClick={() => save('Account')}>Save changes</Button>
                    <Button size="sm" variant="ghost" magnetic={false} onClick={() => toast({ title: 'Password reset link sent', variant: 'info', color: 'sky' })}>
                      <KeyRound className="h-4 w-4" /> Change password
                    </Button>
                  </div>
                </Card>
                <Card title="Danger zone" badge={<span className="rounded-full bg-rose/12 px-2 py-0.5 text-[0.65rem] font-medium text-rose">Careful</span>}>
                  <Row title="Sign out everywhere" desc="End every active admin session on every device.">
                    <Button size="sm" variant="ghost" magnetic={false} onClick={() => toast({ title: 'Signed out of all sessions', variant: 'warn', color: 'rose' })}>
                      <LogOut className="h-4 w-4" /> Sign out
                    </Button>
                  </Row>
                </Card>
              </>
            )}

            {tab === 'security' && (
              <>
                <Card title="Two-factor authentication">
                  <Row title="Require 2FA for admin accounts" desc="All admin sign-ins will require an authenticator code.">
                    <Toggle on={twoFactor} onChange={setTwoFactor} label="Require 2FA for admin accounts" />
                  </Row>
                  <p className="mt-2 rounded-xl bg-paper p-3 text-xs text-muted">Preview only — enforcement isn’t wired up in this phase.</p>
                </Card>
                <Card title="Active sessions">
                  <div className="divide-y divide-ink/8">
                    {[
                      { device: 'MacBook Pro · Chrome', location: 'Lyon, FR', current: true },
                      { device: 'iPhone 15 · Safari', location: 'Lyon, FR', current: false },
                    ].map((s) => (
                      <div key={s.device} className="flex items-center justify-between gap-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/[0.04] text-muted"><Smartphone className="h-4 w-4" /></span>
                          <div>
                            <p className="text-sm font-medium">{s.device} {s.current && <span className="ml-1 text-xs text-emerald">· This device</span>}</p>
                            <p className="text-xs text-muted">{s.location}</p>
                          </div>
                        </div>
                        {!s.current && (
                          <button onClick={() => toast({ title: 'Session revoked', variant: 'warn', color: 'rose' })} className="text-xs font-medium text-rose hover:underline">
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card title="API keys">
                  <Row title="Admin API key" desc="Used for server-to-server integrations.">
                    <span className="rounded-lg bg-paper px-3 py-1.5 font-mono text-xs text-muted">sk_admin_••••••••3f2a</span>
                  </Row>
                  <div className="mt-2">
                    <Button size="sm" variant="soft" onClick={() => toast({ title: 'New key generated', description: 'Preview only — no key was actually rotated.', variant: 'info', color: 'sky' })}>
                      Rotate key
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
