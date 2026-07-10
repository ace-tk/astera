import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn('relative h-7 w-12 rounded-full transition-colors', on ? 'bg-accent' : 'bg-ink/15')}
    >
      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-6' : 'left-1')} />
    </button>
  )
}

export default function Settings() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <p className="eyebrow text-purple">Settings</p>
        <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
          Make Astera feel like home.
        </h1>
      </Reveal>

      {/* Theme gallery */}
      <Reveal delay={0.05} className="mt-10">
        <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-medium tracking-tight">Appearance</h2>
          <p className="mt-1 text-sm text-muted">Six palettes. Each re-skins the entire product.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
                  theme === t.id ? 'border-accent ring-2 ring-accent/20' : 'border-ink/8 hover:border-ink/20',
                )}
              >
                <div className="flex h-16 items-end gap-1.5 rounded-xl p-2" style={{ background: t.swatch[0] }}>
                  <span className="h-8 flex-1 rounded-md" style={{ background: t.swatch[1] }} />
                  <span className="h-5 flex-1 rounded-md" style={{ background: t.swatch[2] }} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.hint}</p>
                  </div>
                  {theme === t.id && <Check className="h-4 w-4 text-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Delivery preferences */}
      <Reveal delay={0.1} className="mt-6">
        <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-medium tracking-tight">Delivery</h2>
          <div className="mt-6 divide-y divide-ink/8">
            {[
              ['Email me each report', 'The full report lands in your inbox when ready.', true],
              ['Flag compliance commitments', 'Get a separate alert for legal & obligation language.', true],
              ['Weekly analytics digest', 'A Monday summary of decisions and follow-through.', false],
            ].map(([title, desc, def]) => (
              <SettingRow key={title} title={title} desc={desc} def={def} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* Profile */}
      <Reveal delay={0.15} className="mt-6">
        <div className="rounded-3xl border border-ink/8 bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-medium tracking-tight">Profile</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Name" value="Maya Okafor" />
            <Field label="Email" value="maya@northwind.co" />
            <Field label="Workspace" value="Northwind" />
            <Field label="Role" value="VP Product" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="accent" size="sm">Save changes</Button>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function SettingRow({ title, desc, def }) {
  const [on, setOn] = useState(def)
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <Toggle on={on} onChange={setOn} />
    </div>
  )
}

function Field({ label, value }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      <input
        defaultValue={value}
        className="mt-2 w-full rounded-xl border border-ink/10 bg-paper px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
      />
    </label>
  )
}
