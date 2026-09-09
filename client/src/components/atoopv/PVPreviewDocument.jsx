import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

// The four sections every ATOOPV-drafted PV follows — reused verbatim from
// the section headings already used on the "Modèle PV CSE gratuit" guide
// page (content/guides/modele-pv-cse-gratuit.md), not invented here.
const SECTIONS = [
  'En-tête réglementaire du PV CSE',
  'Approbation du PV CSE précédent',
  'Délibérations et votes du CSE',
  'Questions diverses du CSE',
]

// Which of the selected tier's own four existing `features` illustrates each
// section above — chosen for fit (e.g. "Décisions, votes et résultats" /
// "Restitution intégrale de chaque intervention" both land under
// "Délibérations et votes"), not new copy: every string shown still comes
// straight from TARIFICATION_TIERS.
const FEATURE_FOR_SECTION = [0, 3, 1, 2]

const VOTE_LABELS = ['Pour', 'Contre', 'Abstention']

/**
 * The live, structured PV preview for the Tarification page's simulator —
 * a real component (not a screenshot) that re-renders from `tier` / `instance`
 * / `style` / `duration` alone, so selecting a different output level,
 * instance or style changes exactly what's shown here. Content is limited to
 * what already exists in the project (tier names/rates/features, the
 * instance list, the section labels above) plus generic, universal PV
 * vocabulary ("Procès-verbal", "Pour/Contre/Abstention") — nothing about a
 * fictional meeting is invented; only density and styling communicate the
 * difference between Essentiel/Scope/Premium and Indirect/Direct.
 */
export default function PVPreviewDocument({ tier, instance, style, duration, color = 'royal' }) {
  const a = accent(color)
  const isPremium = tier.id === 'premium'
  const isEssentiel = tier.id === 'essentiel'
  const isDirect = style === 'direct'

  return (
    <div data-testid="pv-preview" className="rounded-[1.6rem] border border-ink/8 bg-white p-6 shadow-soft sm:p-7">
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
        <div>
          <p className="font-display text-base font-semibold tracking-tight text-ink">Procès-verbal</p>
          <p className="mt-1 text-xs text-muted">
            {instance} · {duration}h · {isDirect ? 'Style direct' : 'Style indirect'}
          </p>
        </div>
        <span className={cn('shrink-0 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide', a.softBg, a.text)}>{tier.name}</span>
      </div>

      <div className={cn('mt-5 space-y-5', isEssentiel && 'space-y-4')}>
        {SECTIONS.map((label, i) => {
          const text = tier.features[FEATURE_FOR_SECTION[i]]
          const showVotes = i === 2 && !isEssentiel
          const body = (
            <>
              <p className={cn('leading-relaxed text-ink/75', isPremium ? 'text-sm' : 'text-xs', isDirect && isPremium && 'italic text-ink/80')}>
                {isDirect && isPremium ? `« ${text} »` : text}
              </p>
              {showVotes && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {VOTE_LABELS.map((v) => (
                    <span key={v} className="rounded-full border border-ink/10 px-2 py-0.5 text-[0.62rem] font-medium text-ink/45">
                      {v}
                    </span>
                  ))}
                  {isPremium && (
                    <span className={cn('rounded-full px-2 py-0.5 text-[0.62rem] font-medium', a.softBg, a.text)}>Détail nominatif</span>
                  )}
                </div>
              )}
            </>
          )

          return (
            <div key={label}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink/45">
                {String(i + 1).padStart(2, '0')} · {label}
              </p>
              {isEssentiel ? (
                <div className="mt-1.5">{body}</div>
              ) : (
                <div className={cn('mt-2 rounded-xl border border-ink/8 bg-card/50 p-3', isDirect && isPremium && cn('border-l-2', a.border))}>{body}</div>
              )}
            </div>
          )
        })}
      </div>

      {isPremium && (
        <p className="mt-5 border-t border-ink/10 pt-4 text-[0.65rem] leading-relaxed text-ink/40">
          Restitution intégrale — {tier.features[3]} · ALC SAS
        </p>
      )}
    </div>
  )
}
