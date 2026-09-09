import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import PVPreviewDocument from '@/components/atoopv/PVPreviewDocument'
import { INSTANCE_TYPES } from '@/constants/pricing'

const STYLE_OPTIONS = [
  { id: 'indirect', label: 'Indirect' },
  { id: 'direct', label: 'Direct' },
]

// Only Premium's own existing feature list claims full verbatim restitution
// ("Restitution intégrale de chaque intervention") -- Essentiel and Scope
// describe third-person / attributed summaries instead, so the Direct
// (verbatim) style is offered only once Premium is selected; this mirrors
// what each tier's own copy already promises rather than adding a new rule.
function stylesAllowedFor(tierId) {
  return tierId === 'premium' ? ['indirect', 'direct'] : ['indirect']
}

/**
 * The Tarification page's interactive PV configuration simulator: pick an
 * output level, instance and style, see the estimate and a live document
 * preview update immediately -- one shared state, no page reload, no
 * separate "generate" step. Replaces PricingCalculator on this page only;
 * PricingCalculator itself is untouched since Atoosavoir and the English
 * PricingPage still use it as-is.
 */
export default function PVSimulator({
  tiers,
  badge,
  intro,
  durationMin = 1,
  durationMax = 8,
  durationDefault = 2,
  disclaimer,
  cta,
  color = 'royal',
  labels = {},
  instances = INSTANCE_TYPES,
}) {
  const [tierId, setTierId] = useState(tiers[0]?.id)
  const [duration, setDuration] = useState(durationDefault)
  const [instance, setInstance] = useState(instances[0])
  const [style, setStyle] = useState('indirect')

  const a = accent(color)
  const tier = tiers.find((t) => t.id === tierId) || tiers[0]
  const allowedStyles = stylesAllowedFor(tierId)

  const selectTier = (id) => {
    setTierId(id)
    if (!stylesAllowedFor(id).includes(style)) setStyle('indirect')
  }

  const {
    format = 'Format',
    duration: durationLabel = 'Durée de la réunion',
    estimate: estimateLabel = 'Estimation',
    currency = 'HT',
    instance: instanceLabel = 'Instance',
    preview: previewLabel = 'Aperçu',
  } = labels

  const estimate = useMemo(() => Math.round(duration * tier.rate), [duration, tier.rate])

  return (
    <Reveal>
      <div className="overflow-hidden rounded-[2rem] border border-ink/8 bg-card shadow-soft">
        <div className="grid lg:grid-cols-[0.9fr_2fr_1.15fr]">
          {/* LEFT — compact context panel */}
          <div className="flex flex-col gap-6 border-b border-ink/8 p-7 lg:border-b-0 lg:border-r lg:border-ink/8 sm:p-8">
            <div>
              {badge && (
                <span className="chip w-fit gap-2 text-ink/70">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  {badge}
                </span>
              )}
              {intro && <p className="mt-5 text-sm leading-relaxed text-muted text-pretty">{intro}</p>}
            </div>
            <div className="mt-auto space-y-2.5 border-t border-ink/8 pt-5">
              {tier.note && <p className="text-xs font-medium text-ink/60">{tier.note}</p>}
              {disclaimer && <p className="text-xs leading-relaxed text-muted">{disclaimer}</p>}
            </div>
          </div>

          {/* CENTER — configuration console */}
          <div className="border-b border-ink/8 p-7 lg:border-b-0 lg:border-r lg:border-ink/8 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{format}</p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {tiers.map((t) => {
                const selected = t.id === tierId
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTier(t.id)}
                    className={cn(
                      'relative rounded-2xl border px-4 py-3.5 text-left transition-colors',
                      selected ? cn(a.border, a.softBg) : 'border-ink/10 hover:border-ink/20 hover:bg-ink/[0.02]',
                    )}
                  >
                    {t.badge && (
                      <span className={cn('absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold text-white', a.bg)}>
                        {t.badge}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <span className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-full border-2', selected ? cn(a.bg, 'border-transparent') : 'border-ink/20')}>
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="font-display text-sm font-medium tracking-tight text-ink">{t.name}</span>
                    </span>
                    <span className="mt-1.5 block text-xs text-muted">{t.tagline}</span>
                    <span className="mt-1.5 block text-xs font-medium text-ink/70">{t.rate}€/h</span>
                  </button>
                )
              })}
            </div>

            <label className="mt-7 block text-xs font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="pv-sim-instance">
              {instanceLabel}
            </label>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={instanceLabel} id="pv-sim-instance">
              {instances.map((i) => (
                <button
                  key={i}
                  onClick={() => setInstance(i)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    i === instance ? cn(a.bg, 'border-transparent text-white') : 'border-ink/10 text-ink/70 hover:border-ink/20 hover:text-ink',
                  )}
                >
                  {i}
                </button>
              ))}
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Style</p>
            <div className="mt-3 inline-flex rounded-full border border-ink/10 p-1">
              {STYLE_OPTIONS.map((opt) => {
                const disabled = !allowedStyles.includes(opt.id)
                const selected = style === opt.id
                return (
                  <button
                    key={opt.id}
                    disabled={disabled}
                    onClick={() => setStyle(opt.id)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                      disabled
                        ? 'cursor-not-allowed text-ink/25'
                        : selected
                          ? cn(a.bg, 'text-white')
                          : 'text-ink/70 hover:text-ink',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {allowedStyles.length === 1 && <p className="mt-1.5 text-xs text-muted">Le style direct est disponible avec Premium.</p>}

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              {durationLabel} — {duration}h
            </p>
            <input
              type="range"
              min={durationMin}
              max={durationMax}
              step={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={cn('mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/8', a.text)}
              style={{ accentColor: 'currentColor' }}
              aria-label={durationLabel}
            />
            <div className="mt-1.5 flex justify-between text-xs text-muted">
              <span>{durationMin}h</span>
              <span>{durationMax}h</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{estimateLabel}</p>
                <div className="mt-1 flex items-end gap-1.5">
                  <span className="font-display text-3xl font-semibold tracking-tight">{estimate}€</span>
                  <span className="mb-1 text-sm text-muted">{currency}</span>
                </div>
              </div>
              {cta && (
                <Button as={Link} to={cta.to} variant="accent">
                  {cta.label}
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT — live PV preview, sticky on desktop */}
          <div className="bg-paper p-7 sm:p-8">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{previewLabel}</p>
              <div className="mt-3 max-h-[36rem] overflow-y-auto pr-0.5">
                <PVPreviewDocument tier={tier} instance={instance} style={style} duration={duration} color={color} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
