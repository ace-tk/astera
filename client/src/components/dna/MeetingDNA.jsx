import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { DNA_TRAITS } from '@/constants/demoMeetings'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

/**
 * Meeting DNA — Astera's signature fingerprint. Six normalized traits plotted
 * on radial axes form an organic, per-meeting "gene shape" with a soft gradient
 * fill and a glow. Deliberately artistic rather than a bar chart: every meeting
 * gets a silhouette you can recognize at a glance.
 */
export default function MeetingDNA({ dna, color = 'royal', size = 320, showLabels = true, animate = true, className }) {
  const reduce = useReducedMotion()
  const cx = size / 2
  const cy = size / 2
  const R = size * (showLabels ? 0.32 : 0.42)
  const a = accent(color)

  const traits = useMemo(
    () =>
      DNA_TRAITS.map((t, i) => {
        const angle = (-90 + i * 60) * (Math.PI / 180)
        const value = dna?.[t.key] ?? 0
        const r = (value / 100) * R
        return {
          ...t,
          value,
          display: t.labelKey ? dna?.[t.labelKey] : value,
          angle,
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r,
          ax: cx + Math.cos(angle) * R,
          ay: cy + Math.sin(angle) * R,
          lx: cx + Math.cos(angle) * (R + size * 0.11),
          ly: cy + Math.sin(angle) * (R + size * 0.11),
        }
      }),
    [dna, cx, cy, R, size],
  )

  const polygon = traits.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(' ')
  const rings = [0.33, 0.66, 1]
  const guide = (scale) =>
    traits.map((t) => `${(cx + Math.cos(t.angle) * R * scale).toFixed(1)},${(cy + Math.sin(t.angle) * R * scale).toFixed(1)}`).join(' ')

  const gid = `dna-${color}`

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <defs>
          <radialGradient id={gid} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={a.hex} stopOpacity="0.55" />
            <stop offset="70%" stopColor={a.hex} stopOpacity="0.22" />
            <stop offset="100%" stopColor={a.hex} stopOpacity="0.05" />
          </radialGradient>
          <filter id={`${gid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* guide rings */}
        {rings.map((s) => (
          <polygon key={s} points={guide(s)} fill="none" stroke="rgb(17 24 39 / 0.06)" strokeWidth="1" />
        ))}
        {/* spokes */}
        {traits.map((t) => (
          <line key={t.key} x1={cx} y1={cy} x2={t.ax} y2={t.ay} stroke="rgb(17 24 39 / 0.06)" strokeWidth="1" />
        ))}

        {/* the DNA shape */}
        <motion.polygon
          points={polygon}
          fill={`url(#${gid})`}
          stroke={a.hex}
          strokeWidth="2"
          strokeLinejoin="round"
          filter={`url(#${gid}-glow)`}
          initial={animate && !reduce ? { scale: 0.1, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.1 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* vertices */}
        {traits.map((t, i) => (
          <motion.circle
            key={t.key}
            cx={t.x}
            cy={t.y}
            r="4"
            fill={accent(t.color).hex}
            stroke="white"
            strokeWidth="1.5"
            initial={animate && !reduce ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 300, damping: 18 }}
          />
        ))}

        {/* slow shimmer sweep */}
        {!reduce && (
          <motion.circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={a.hex}
            strokeWidth="1"
            strokeDasharray="2 8"
            opacity="0.3"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
      </svg>

      {/* labels */}
      {showLabels &&
        traits.map((t) => {
          const right = t.lx > cx + 2
          const center = Math.abs(t.lx - cx) < 3
          return (
            <div
              key={t.key}
              className="absolute -translate-y-1/2"
              style={{
                left: t.lx,
                top: t.ly,
                transform: `translate(${center ? '-50%' : right ? '0' : '-100%'}, -50%)`,
                textAlign: center ? 'center' : right ? 'left' : 'right',
              }}
            >
              <div className={cn('text-[0.65rem] font-medium uppercase tracking-wider text-muted')}>{t.label}</div>
              <div className={cn('font-display text-base font-semibold', accent(t.color).text)}>
                {t.display}
                {!t.labelKey && '%'}
              </div>
            </div>
          )
        })}
    </div>
  )
}
