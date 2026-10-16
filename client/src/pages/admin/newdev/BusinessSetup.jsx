import { useState } from 'react'
import { Building2, Factory, MapPin, Users, KeyRound, Link2, Network, Check, Plus, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageHeader, Card, Chip, Field, inputCls } from './kit'
import { cn } from '@/utils/cn'

// Design port of SupplyBase "Business Structure". Differences asked for by the client:
// one business only (no multi-add), "Factory" instead of "Retail Store", "VAT" instead of "GST".
const STEPS = [
  { id: 'team', n: '01', label: 'Team members', icon: Users },
  { id: 'verticals', n: '02', label: 'Verticals & locations', icon: MapPin },
  { id: 'tools', n: '03', label: 'Tool access', icon: KeyRound },
  { id: 'assigned', n: '04', label: 'Assigned business', icon: Link2 },
  { id: 'overview', n: '', label: 'Structure overview', icon: Network },
]

const TEAM = [
  { name: 'Amélie Rousseau', role: 'Owner', email: 'amelie@example.com' },
  { name: 'Karim Benali', role: 'Operations manager', email: 'karim@example.com' },
  { name: 'Sofia Martins', role: 'Finance', email: 'sofia@example.com' },
]
const VERTICALS = [
  { name: 'Manufacturing', locations: [{ name: 'Lyon plant', type: 'Factory' }, { name: 'Lille plant', type: 'Factory' }] },
  { name: 'Distribution', locations: [{ name: 'Paris hub', type: 'Warehouse' }] },
]
const TOOLS = [['Team Management', true], ['Project Management', true], ['Data Management', false], ['Marketing', false], ['Commercial', true]]

export default function BusinessSetup() {
  const [registered, setRegistered] = useState(true)
  const [form, setForm] = useState(false)
  const [step, setStep] = useState('team')

  return (
    <>
      <PageHeader
        icon={Building2}
        section="Business Setup"
        title="Build your business structure"
        lead="Register your business, then add the people, verticals and locations that make it up."
        action={
          <Button
            variant="accent"
            size="sm"
            magnetic={false}
            disabled={registered}
            onClick={() => setForm(true)}
            title={registered ? 'Only one business can be registered' : undefined}
          >
            {registered ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />} Register business
          </Button>
        }
      />

      {registered && (
        <Card className="mt-6 bg-gradient-to-br from-royal/20 via-card to-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent"><Factory className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-lg font-semibold">ATOO Industries SAS</p>
                <p className="text-xs text-muted">VAT no. FR 12 345 678 901 · France</p>
              </div>
            </div>
            <div className="flex items-center gap-2"><Chip tone="green">Registered</Chip><Chip tone="grey">1 of 1 business</Chip></div>
          </div>
        </Card>
      )}

      {form && !registered && (
        <Card className="mt-6">
          <p className="font-medium">Register your business</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Business name"><input className={inputCls} placeholder="e.g. ATOO Industries SAS" /></Field>
            <Field label="VAT number"><input className={inputCls} placeholder="FR 00 000 000 000" /></Field>
            <Field label="Country"><input className={inputCls} placeholder="France" /></Field>
            <Field label="Business type">
              <select className={inputCls} defaultValue="Factory"><option>Factory</option><option>Warehouse</option><option>Office</option></select>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="accent" magnetic={false} onClick={() => { setRegistered(true); setForm(false) }}>Register</Button>
            <Button size="sm" variant="soft" magnetic={false} onClick={() => setForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
              step === s.id ? 'border-accent bg-accent/10 text-ink' : 'border-ink/10 bg-card text-muted hover:text-ink',
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.n && <span className="font-mono text-[11px] opacity-60">{s.n} ·</span>} {s.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {step === 'team' && (
            <>
              <h2 className="font-display text-xl font-semibold">Start with your people</h2>
              <p className="mt-1 text-sm text-muted">Add the team members who will work inside this business.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {TEAM.map((m) => (
                  <Card key={m.email} className="flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">{m.name[0]}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{m.name}</p><p className="truncate text-xs text-muted">{m.role} · {m.email}</p></div>
                  </Card>
                ))}
                <button className="grid min-h-[4.5rem] place-items-center rounded-2xl border border-dashed border-ink/20 text-sm text-muted hover:text-ink"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add team member</span></button>
              </div>
            </>
          )}
          {step === 'verticals' && (
            <>
              <h2 className="font-display text-xl font-semibold">Verticals &amp; locations</h2>
              <p className="mt-1 text-sm text-muted">Group your activity into verticals, then place factories, warehouses and offices under them.</p>
              <div className="mt-4 space-y-3">
                {VERTICALS.map((v) => (
                  <Card key={v.name}>
                    <p className="font-medium">{v.name}</p>
                    <ul className="mt-3 divide-y divide-ink/6">
                      {v.locations.map((l) => (
                        <li key={l.name} className="flex items-center justify-between py-2 text-sm">
                          <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted" />{l.name}</span><Chip tone="blue">{l.type}</Chip>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
                <button className="w-full rounded-2xl border border-dashed border-ink/20 py-3 text-sm text-muted hover:text-ink"><span className="inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add vertical</span></button>
              </div>
            </>
          )}
          {step === 'tools' && (
            <>
              <h2 className="font-display text-xl font-semibold">Tool access</h2>
              <p className="mt-1 text-sm text-muted">Choose which tools this business can use.</p>
              <Card className="mt-4 divide-y divide-ink/6 p-0">
                {TOOLS.map(([t, on]) => (
                  <div key={t} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>{t}</span>{on ? <Chip tone="green"><Check className="mr-1 h-3 w-3" />Enabled</Chip> : <Chip>Off</Chip>}
                  </div>
                ))}
              </Card>
            </>
          )}
          {step === 'assigned' && (
            <>
              <h2 className="font-display text-xl font-semibold">Assigned business</h2>
              <p className="mt-1 text-sm text-muted">Each team member is attached to the business below.</p>
              <Card className="mt-4"><p className="font-medium">ATOO Industries SAS</p><p className="mt-1 text-sm text-muted">{TEAM.length} members · {VERTICALS.length} verticals · 3 locations</p></Card>
            </>
          )}
          {step === 'overview' && (
            <>
              <h2 className="font-display text-xl font-semibold">Structure overview</h2>
              <Card className="mt-4">
                <p className="font-medium">ATOO Industries SAS</p>
                <ul className="mt-3 space-y-3 border-l border-ink/10 pl-4 text-sm">
                  {VERTICALS.map((v) => (
                    <li key={v.name}><p className="font-medium">{v.name}</p>
                      <ul className="mt-1 space-y-1 text-muted">{v.locations.map((l) => <li key={l.name}>{l.name} <span className="text-xs">({l.type})</span></li>)}</ul>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>

        <aside>
          <Card>
            <p className="text-[11px] uppercase tracking-widest text-muted">Live structure</p>
            <dl className="mt-3 space-y-2 text-sm">
              {[['Business', registered ? '1' : '0'], ['Team members', TEAM.length], ['Verticals', VERTICALS.length], ['Locations', 3], ['Tools enabled', TOOLS.filter((t) => t[1]).length]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </>
  )
}
