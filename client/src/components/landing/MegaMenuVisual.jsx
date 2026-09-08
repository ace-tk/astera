import { CheckCircle2, Download, GraduationCap, MapPin } from 'lucide-react'

const ACCENT_VAR = {
  royal: 'var(--royal)',
  mint: 'var(--mint)',
  sky: 'var(--sky)',
  purple: 'var(--purple)',
}

/** A small "paper" card with a few text-line strokes and a badge icon in
 * its corner — the document motif used for Procès-verbal and Ressources.
 * `dark` switches the card's own surface/lines from light-on-dark to a
 * plain white card, so it reads correctly against either background. */
function DocumentCard({ colorVar, dark, badge: Badge }) {
  return (
    <div
      className="absolute bottom-0 right-2 w-28 -rotate-3 rounded-xl p-3 shadow-lg"
      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'white', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.06)'}` }}
    >
      <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: `rgb(${colorVar} / 0.7)` }} />
      <div className="mt-2 h-1 w-full rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.1)' }} />
      <div className="mt-1.5 h-1 w-full rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.1)' }} />
      <div className="mt-1.5 h-1 w-2/3 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.1)' }} />
      <div
        className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
        style={{ backgroundColor: `rgb(${colorVar})` }}
      >
        <Badge className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </div>
    </div>
  )
}

/** A soft glow + centered icon badge — used for Formations (a calmer,
 * non-document motif fitting "training/coaching" better than a paper card). */
function GlowBadge({ colorVar, icon: Icon }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute bottom-0 right-0 h-28 w-28 rounded-full"
        style={{ background: `radial-gradient(circle, rgb(${colorVar} / 0.35) 0%, transparent 72%)` }}
      />
      <div
        className="absolute bottom-3 right-3 flex h-14 w-14 items-center justify-center rounded-full border"
        style={{ borderColor: `rgb(${colorVar} / 0.4)`, backgroundColor: `rgb(${colorVar} / 0.12)` }}
      >
        <Icon className="h-6 w-6" style={{ color: `rgb(${colorVar})` }} strokeWidth={1.75} />
      </div>
    </div>
  )
}

/** A small scattered cluster of map pins — Blog's "PV par ville" column
 * already lists city names in text; this echoes the same idea visually. */
function CityPins({ colorVar }) {
  const pins = [
    { top: '10%', left: '55%', size: 22, opacity: 0.35 },
    { top: '38%', left: '15%', size: 16, opacity: 0.5 },
    { top: '5%', left: '10%', size: 14, opacity: 0.3 },
  ]
  return (
    <div className="absolute inset-0">
      {pins.map((p, i) => (
        <MapPin
          key={i}
          className="absolute"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size, color: `rgb(${colorVar})`, opacity: p.opacity }}
          strokeWidth={2}
        />
      ))}
    </div>
  )
}

/**
 * The small editorial visual filling the mega-menu's trailing colored
 * column (see MegaMenuPanel.jsx) — an original icon/CSS composition, not an
 * external photo, so there's no asset licensing question and nothing to
 * optimize/host. `aria-hidden` throughout: purely decorative, the column's
 * real text/CTA carry all the actual information and tab order.
 */
export default function MegaMenuVisual({ variant, color }) {
  const colorVar = ACCENT_VAR[color] || ACCENT_VAR.royal

  return (
    <div className="relative h-full min-h-[3.5rem] w-full overflow-hidden" aria-hidden="true">
      {variant === 'formations' && <GlowBadge colorVar={colorVar} icon={GraduationCap} />}
      {variant === 'pv' && <DocumentCard colorVar={colorVar} dark badge={CheckCircle2} />}
      {variant === 'ressources' && <DocumentCard colorVar={colorVar} badge={Download} />}
      {variant === 'blog' && <CityPins colorVar={colorVar} />}
    </div>
  )
}
