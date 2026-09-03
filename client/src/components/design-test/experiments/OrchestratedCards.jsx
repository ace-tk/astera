import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import { ORCHESTRATED_PANELS } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]
const LOOP_EASE = 'easeInOut'

const ACCENT_VAR = {
  royal: 'var(--royal)',
  coral: 'var(--coral)',
  golden: 'var(--golden)',
  emerald: 'var(--emerald)',
  sky: 'var(--sky)',
}

function AbstractVisual({ colorVar, active }) {
  return (
    <div
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        opacity: active ? 0.9 : 0.35,
        backgroundImage: `repeating-linear-gradient(115deg, rgb(${colorVar} / 0.16) 0px, rgb(${colorVar} / 0.16) 1px, transparent 1px, transparent 14px), radial-gradient(rgb(${colorVar} / 0.35) 1px, transparent 1px)`,
        backgroundSize: 'auto, 18px 18px',
      }}
      aria-hidden="true"
    />
  )
}

/** CAPTURER — a restrained live-audio waveform. */
function WaveformVisual({ colorVar, reduceMotion }) {
  const bars = [0.45, 0.75, 1, 0.55, 0.85, 0.4, 0.7, 0.95, 0.5, 0.65]
  return (
    <div className="flex h-10 items-end gap-1" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: `rgb(${colorVar} / 0.55)`, height: '100%', transformOrigin: 'bottom' }}
          initial={{ scaleY: h }}
          animate={reduceMotion ? { scaleY: h } : { scaleY: [h * 0.35, h, h * 0.3, h] }}
          transition={reduceMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: LOOP_EASE, delay: i * 0.05 }}
        />
      ))}
    </div>
  )
}

/** TRANSCRIRE — short transcript lines appearing progressively. */
function TranscriptVisual({ colorVar, reduceMotion }) {
  const lines = ['62%', '88%', '50%', '72%']
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {lines.map((w, i) => (
        <motion.span
          key={i}
          className="h-2 rounded-full"
          style={{ width: w, backgroundColor: `rgb(${colorVar} / 0.32)` }}
          initial={{ opacity: 0.25 }}
          animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.2, 0.9, 0.9, 0.2] }}
          transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.7, 1], delay: i * 0.3, ease: LOOP_EASE }}
        />
      ))}
    </div>
  )
}

/** COMPRENDRE — labels being identified and connected. */
function ConnectVisual({ colorVar, reduceMotion }) {
  const labels = ['DÉCISION', 'ACTION', 'OWNER']
  return (
    <div className="relative flex h-10 items-center justify-between" aria-hidden="true">
      <svg className="absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2" viewBox="0 0 100 8" preserveAspectRatio="none">
        {[
          [16, 48],
          [52, 84],
        ].map(([x1, x2], i) => (
          <motion.line
            key={i}
            x1={x1}
            y1={4}
            x2={x2}
            y2={4}
            stroke={`rgb(${colorVar} / 0.45)`}
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }}
            transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity, times: [0, 0.4, 0.8, 1], delay: i * 0.25, ease: LOOP_EASE }}
          />
        ))}
      </svg>
      {labels.map((label) => (
        <span
          key={label}
          className="relative rounded-full border bg-paper px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em]"
          style={{ borderColor: `rgb(${colorVar} / 0.4)`, color: `rgb(${colorVar})` }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

/** VALIDER — a restrained check being drawn. */
function CheckVisual({ colorVar, reduceMotion }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border" style={{ borderColor: `rgb(${colorVar} / 0.4)` }}>
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7"
            fill="none"
            stroke={`rgb(${colorVar})`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={reduceMotion ? { pathLength: 1 } : { pathLength: [0, 1, 1, 0] }}
            transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, times: [0, 0.4, 0.8, 1], ease: LOOP_EASE }}
          />
        </svg>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Conforme</span>
    </div>
  )
}

/** LIVRER — document lines assembling, then sent. */
function DeliverVisual({ colorVar, reduceMotion }) {
  const lines = [0.9, 0.65, 1, 0.5]
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <div className="flex flex-1 flex-col gap-1.5">
        {lines.map((w, i) => (
          <motion.span
            key={i}
            className="h-2 rounded-full"
            style={{ backgroundColor: `rgb(${colorVar} / 0.35)`, transformOrigin: 'left', width: '100%' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={reduceMotion ? { scaleX: w, opacity: 1 } : { scaleX: [0, w, w, 0], opacity: [0, 1, 1, 0] }}
            transition={reduceMotion ? undefined : { duration: 2.6, repeat: Infinity, times: [0, 0.3, 0.75, 1], delay: i * 0.15, ease: EASE }}
          />
        ))}
      </div>
      <motion.span
        className="font-mono text-lg"
        style={{ color: `rgb(${colorVar})` }}
        animate={reduceMotion ? { x: 0, opacity: 1 } : { x: [0, 4, 0], opacity: [0.4, 1, 0.4] }}
        transition={reduceMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: LOOP_EASE }}
      >
        →
      </motion.span>
    </div>
  )
}

const VISUALS = { waveform: WaveformVisual, transcript: TranscriptVisual, connect: ConnectVisual, check: CheckVisual, deliver: DeliverVisual }

/**
 * Tall numbered panels where exactly one is dominant at a time.
 *
 * Desktop: a fine pointer (mouse/trackpad) hovering a panel previews it live
 * — no click needed — while click/keyboard activation still works as an
 * explicit pin. `onPointerEnter` checks `pointerType` so a tap on a touch
 * screen never fires the hover-preview path (which would fight the tap
 * activation and risk a stuck "hover" state); touch keeps tap-to-expand only.
 * Leaving the component preserves the most recently active panel.
 */
export default function OrchestratedCards() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()

  return (
    <section id="experiment-05" className="relative border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="shell">
        <ExperimentHeader index="05" eyebrow="EXPERIMENT / 05" titleLines={['ORCHESTRATED', 'INTELLIGENCE']} className="mb-14 sm:mb-20" />

        <div className="flex flex-col gap-3 lg:h-[32rem] lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-2xl lg:border lg:border-ink/10">
          {ORCHESTRATED_PANELS.map((panel, i) => {
            const isActive = active === i
            const colorVar = ACCENT_VAR[panel.accent]
            const Visual = VISUALS[panel.visual]
            const activate = () => setActive(i)
            return (
              <div
                key={panel.number}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onClick={activate}
                onFocus={activate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    activate()
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') activate()
                }}
                className={clsx(
                  'group relative cursor-pointer overflow-hidden border border-ink/10 bg-card transition-[flex-basis] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:border-y-0 lg:border-l lg:border-r-0 lg:first:border-l-0',
                  isActive ? 'lg:basis-[32%]' : 'lg:basis-[17%]',
                )}
              >
                <AbstractVisual colorVar={colorVar} active={isActive} />

                <div
                  className={clsx(
                    'relative flex h-full flex-col justify-between gap-6 p-6 transition-[padding] duration-500 sm:p-7',
                    isActive && 'lg:p-9',
                  )}
                >
                  <div className="flex items-center justify-between lg:block">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted/60">{panel.number}</span>
                    <span
                      className={clsx(
                        'font-display leading-none text-ink transition-all duration-500',
                        isActive
                          ? 'mt-0 text-3xl sm:text-4xl'
                          : 'mt-0 text-xl sm:text-2xl lg:mt-4 lg:origin-left lg:-rotate-90 lg:whitespace-nowrap lg:text-lg',
                      )}
                    >
                      {panel.title}
                    </span>
                  </div>

                  <p
                    className={clsx(
                      'max-w-[22rem] text-sm leading-relaxed text-muted transition-opacity duration-300',
                      isActive ? 'opacity-100 delay-100' : 'opacity-0 lg:hidden',
                    )}
                  >
                    {panel.description}
                  </p>

                  <div
                    className={clsx('transition-opacity duration-300', isActive ? 'opacity-100 delay-150' : 'opacity-0 lg:hidden')}
                    aria-hidden={!isActive}
                  >
                    {isActive && <Visual colorVar={colorVar} reduceMotion={reduceMotion} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
          {String(active + 1).padStart(2, '0')} / {String(ORCHESTRATED_PANELS.length).padStart(2, '0')} — {ORCHESTRATED_PANELS[active].title}
        </p>
      </div>
    </section>
  )
}
