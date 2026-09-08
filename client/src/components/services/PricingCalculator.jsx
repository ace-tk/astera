import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { accent } from '@/utils/accent'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import FicheCard from '@/components/atoopv/FicheCard'
import { INSTANCE_TYPES } from '@/constants/pricing'
import { cn } from '@/utils/cn'

/**
 * A small, honest pricing estimator: pick a format tier and a meeting
 * duration, see hours × the tier's stated hourly rate. It only computes what
 * the source material actually specifies (billing is per meeting hour) —
 * it does not invent a formula for the complexity/agenda-size dimensions
 * the original simulator mentioned but never disclosed a rule for.
 *
 * The instance selector and output preview added alongside this are driven
 * entirely by the tier's own existing `features` — no new per-tier preview
 * content was authored, so there's exactly one preview implementation
 * (via the existing FicheCard "what the output looks like" component)
 * rather than one per tier.
 */
export default function PricingCalculator({
  tiers,
  durationMin = 1,
  durationMax = 8,
  durationDefault = 2,
  disclaimer,
  cta,
  color = 'golden',
  labels = {},
  instances = INSTANCE_TYPES,
}) {
  const [tierId, setTierId] = useState(tiers[0]?.id)
  const [duration, setDuration] = useState(durationDefault)
  const [instance, setInstance] = useState(instances[0])
  const tier = tiers.find((t) => t.id === tierId) || tiers[0]
  const a = accent(color)
  const {
    format = 'Format',
    duration: durationLabel = 'Meeting duration',
    estimate: estimateLabel = 'Estimate',
    currency = 'HT',
    instance: instanceLabel = 'Instance',
    preview: previewLabel = 'Preview',
  } = labels

  const estimate = useMemo(() => Math.round(duration * tier.rate), [duration, tier.rate])

  const previewFields = useMemo(
    () => [
      { label: previewLabel, value: tier.features.join(' • ') },
    ],
    [tier, previewLabel],
  )

  return (
    <Reveal>
      <div className="rounded-[2rem] border border-ink/8 bg-card p-8 shadow-soft sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{format}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTierId(t.id)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    t.id === tierId ? cn(a.bg, 'border-transparent text-white') : 'border-ink/10 text-ink/70 hover:border-ink/20 hover:text-ink',
                  )}
                >
                  {t.name} · {t.rate}€/h
                </button>
              ))}
            </div>
            {tier.note && <p className="mt-2 text-xs text-muted">{tier.note}</p>}

            <label className="mt-7 block text-xs font-semibold uppercase tracking-[0.18em] text-muted" htmlFor="pricing-instance">
              {instanceLabel}
            </label>
            <select
              id="pricing-instance"
              value={instance}
              onChange={(e) => setInstance(e.target.value)}
              className="input mt-3 w-full sm:w-auto"
            >
              {instances.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>

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
          </div>

          <div className="flex flex-col justify-between rounded-[1.6rem] bg-paper p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{estimateLabel}</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-5xl font-semibold tracking-tight">{estimate}€</span>
                <span className="mb-1.5 text-sm text-muted">{currency}</span>
              </div>
              {disclaimer && <p className="mt-3 text-xs leading-relaxed text-muted">{disclaimer}</p>}
            </div>
            {cta && (
              <Button as={Link} to={cta.to} variant="accent" className="mt-6 w-full">
                {cta.label}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <FicheCard eyebrow={tier.name} number={instance} title={tier.tagline} fields={previewFields} color={color} />
        </div>
      </div>
    </Reveal>
  )
}
