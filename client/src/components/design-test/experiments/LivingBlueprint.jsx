import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import CursorCoordinates from '../primitives/CursorCoordinates'
import { BLUEPRINT_META, BLUEPRINT_NODES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]
const STAGGER = 0.13

const ACCENT_VAR = {
  royal: 'var(--royal)',
  purple: 'var(--purple)',
  emerald: 'var(--emerald)',
  golden: 'var(--golden)',
  coral: 'var(--coral)',
  sky: 'var(--sky)',
}

// Each node arrives from a small off-grid jitter and settles exactly on its
// coordinate — "off-grid, then snapped to grid" rather than simply fading
// in already aligned. Alternating so neighbours don't arrive identically.
const NODE_JITTER = [
  { x: -16, y: 12 },
  { x: 14, y: -14 },
  { x: -12, y: -12 },
  { x: 16, y: 14 },
  { x: -14, y: 10 },
  { x: 12, y: -12 },
]

function useIsDesktop(breakpoint = 640) {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= breakpoint)
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const onChange = () => setIsDesktop(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [breakpoint])
  return isDesktop
}

// Equal-time interpolation along the 6-node polyline (5 segments), used to
// drive the traveling pulse via plain `cx`/`cy` rather than CSS `offset-path`
// — `offset-path`/`offset-distance` aren't part of Framer Motion's known SVG
// style set and it mis-applies them as lowercase DOM attributes, which is
// both a React console warning and needless browser-support risk for a
// purely decorative effect. `cx`/`cy` are standard, fully-supported targets.
function pointAlongPolyline(nodes, progress) {
  const segments = nodes.length - 1
  const segFloat = Math.min(segments, Math.max(0, (progress / 100) * segments))
  const segIndex = Math.min(segments - 1, Math.floor(segFloat))
  const t = segFloat - segIndex
  const a = nodes[segIndex]
  const b = nodes[segIndex + 1]
  return { x: (a.x + (b.x - a.x) * t) * 100, y: (a.y + (b.y - a.y) * t) * 100 }
}

/** Three large, near-invisible radial fields — ambient print texture, never
 * competing with the workflow. Static (no animation): purely decorative. */
function AmbientFields() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--purple)) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -right-16 h-[26rem] w-[26rem] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--golden)) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--sky)) 0%, transparent 70%)' }}
      />
    </div>
  )
}

/** The glow + ring + dot + label + (conditionally) annotation caption for one
 * node — shared visual core, reused by both the desktop canvas (absolutely
 * positioned) and the mobile vertical stack (normal flow). */
function NodeCore({ node, index, entered, emphasized, dimmed, showCaption, verticalSide = 'bottom', horizontalAlign = 'center', reduceMotion, onHoverStart, onHoverEnd, onActivate }) {
  const colorVar = ACCENT_VAR[node.accent]
  const delay = 0.35 + index * STAGGER

  const isTop = verticalSide === 'top'
  const horizontalClass =
    horizontalAlign === 'edge-left'
      ? 'left-0 items-start text-left'
      : horizontalAlign === 'edge-right'
        ? 'right-0 items-end text-right'
        : 'left-1/2 -translate-x-1/2 items-center text-center'

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          width: !entered ? 96 : emphasized ? 152 : 120,
          height: !entered ? 96 : emphasized ? 152 : 120,
          opacity: !entered ? 0 : emphasized ? 0.9 : dimmed ? 0.4 : 0.65,
        }}
        transition={{ duration: entered ? 0.5 : 0.7, delay: entered ? 0 : delay, ease: EASE }}
        style={{ background: `radial-gradient(circle, rgb(${colorVar} / 0.2) 0%, transparent 72%)` }}
      />

      <motion.button
        type="button"
        onPointerEnter={(e) => e.pointerType === 'mouse' && onHoverStart()}
        onPointerLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        onClick={onActivate}
        aria-label={`${node.label} — ${node.note}`}
        aria-pressed={emphasized}
        initial={false}
        animate={{
          scale: !entered ? 0.85 : emphasized ? 1.22 : 1,
          opacity: !entered ? 0.3 : dimmed ? 0.55 : 1,
          x: !entered ? NODE_JITTER[index].x : 0,
          y: !entered ? NODE_JITTER[index].y : 0,
        }}
        transition={{ duration: entered ? 0.3 : 0.6, delay: entered ? 0 : delay, ease: EASE }}
        className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 bg-paper transition-colors duration-300"
        style={{ borderColor: `rgb(${colorVar} / ${emphasized ? 0.9 : 0.45})` }}
      >
        <span className="h-1.5 w-1.5 rounded-full transition-transform duration-300" style={{ backgroundColor: `rgb(${colorVar})`, transform: emphasized ? 'scale(1.2)' : 'scale(1)' }} />
      </motion.button>

      <motion.div
        initial={false}
        animate={{ opacity: !entered ? 0 : dimmed ? 0.55 : 1, y: !entered ? 6 : 0 }}
        transition={{ duration: entered ? 0.3 : 0.5, delay: entered ? 0 : delay + 0.15, ease: EASE }}
        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-center"
      >
        <span
          className={clsx('font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 sm:text-[11px]', emphasized ? 'text-ink' : 'text-muted/60')}
        >
          {node.label}
        </span>
        <span
          className="mx-auto mt-1 block h-px w-6 transition-opacity duration-300"
          style={{ backgroundColor: `rgb(${colorVar})`, opacity: emphasized ? 0.9 : 0.35 }}
          aria-hidden="true"
        />
      </motion.div>

      {showCaption && !reduceMotion && (
        <motion.div
          initial={{ opacity: 0, y: isTop ? 6 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className={clsx('pointer-events-none absolute z-20 flex w-28 flex-col gap-1', isTop ? 'bottom-full mb-3 flex-col-reverse' : 'top-full mt-8', horizontalClass)}
        >
          <span
            className="h-3 w-px"
            style={{
              backgroundImage: `repeating-linear-gradient(to bottom, rgb(${colorVar} / 0.6) 0 2px, transparent 2px 5px)`,
            }}
            aria-hidden="true"
          />
          <p className="font-mono text-[10px] uppercase leading-snug tracking-[0.06em]" style={{ color: `rgb(${colorVar})` }}>
            {node.tagline}
          </p>
        </motion.div>
      )}
    </>
  )
}

/** Desktop/tablet: the original absolutely-positioned zig-zag canvas, now
 * carrying a colored multi-stop signal line (gradient per segment) plus a
 * traveling pulse riding the same polyline via animated `cx`/`cy`. */
function BlueprintCanvas({ reduceMotion }) {
  const [hovered, setHovered] = useState(null)
  const [active, setActive] = useState(null)
  const [entered, setEntered] = useState(reduceMotion)
  const diagramRef = useRef(null)
  const pulseProgress = useMotionValue(0)
  const pulseCx = useTransform(pulseProgress, (v) => pointAlongPolyline(BLUEPRINT_NODES, v).x)
  const pulseCy = useTransform(pulseProgress, (v) => pointAlongPolyline(BLUEPRINT_NODES, v).y)

  const displayId = hovered || active
  const displayIndex = displayId ? BLUEPRINT_NODES.findIndex((n) => n.id === displayId) : -1
  const displayNode = displayIndex >= 0 ? BLUEPRINT_NODES[displayIndex] : null

  useEffect(() => {
    if (reduceMotion || !entered) return undefined
    const controls = animate(pulseProgress, 100, {
      duration: 3.2,
      ease: 'linear',
      delay: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 1.3,
    })
    return () => controls.stop()
  }, [entered, reduceMotion, pulseProgress])

  return (
    <>
      <motion.div
        ref={diagramRef}
        onClick={() => setActive(null)}
        onViewportEnter={() => setEntered(true)}
        viewport={{ once: true, amount: 0.3 }}
        className="relative h-[26rem] sm:h-[30rem] lg:h-[34rem]"
      >
        <CursorCoordinates containerRef={diagramRef} />

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            {BLUEPRINT_NODES.slice(0, -1).map((node, i) => {
              const next = BLUEPRINT_NODES[i + 1]
              return (
                <linearGradient key={node.id} id={`bp-seg-${node.id}`} gradientUnits="userSpaceOnUse" x1={node.x * 100} y1={node.y * 100} x2={next.x * 100} y2={next.y * 100}>
                  <stop offset="0%" stopColor={`rgb(${ACCENT_VAR[node.accent]})`} />
                  <stop offset="100%" stopColor={`rgb(${ACCENT_VAR[next.accent]})`} />
                </linearGradient>
              )
            })}
            <radialGradient id="bp-pulse-fill">
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {BLUEPRINT_NODES.slice(0, -1).map((node, i) => {
            const next = BLUEPRINT_NODES[i + 1]
            const adjacent = displayIndex === i || displayIndex === i + 1
            const dim = displayIndex >= 0 && !adjacent
            return (
              <motion.line
                key={node.id}
                x1={node.x * 100}
                y1={node.y * 100}
                x2={next.x * 100}
                y2={next.y * 100}
                stroke={`url(#bp-seg-${node.id})`}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{
                  pathLength: entered ? 1 : 0,
                  opacity: entered ? (dim ? 0.32 : 0.78) : 0,
                  strokeWidth: adjacent ? 0.55 : 0.24,
                }}
                transition={{
                  pathLength: { duration: 0.6, delay: 0.1 + i * STAGGER, ease: EASE },
                  opacity: { duration: entered ? 0.3 : 0.6, delay: entered ? 0 : 0.1 + i * STAGGER, ease: EASE },
                  strokeWidth: { duration: 0.3, ease: 'easeOut' },
                }}
              />
            )
          })}

          {!reduceMotion && entered && (
            <motion.circle
              r={1.05}
              fill="url(#bp-pulse-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              style={{ cx: pulseCx, cy: pulseCy }}
            />
          )}
        </svg>

        {BLUEPRINT_NODES.map((node, i) => {
          const emphasized = displayId === node.id
          const dimmed = displayIndex >= 0 && !emphasized
          const horizontalAlign = node.x < 0.22 ? 'edge-left' : node.x > 0.78 ? 'edge-right' : 'center'
          const verticalSide = node.y > 0.55 ? 'top' : 'bottom'
          return (
            <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}>
              <NodeCore
                node={node}
                index={i}
                entered={entered}
                emphasized={emphasized}
                dimmed={dimmed}
                showCaption={emphasized}
                verticalSide={verticalSide}
                horizontalAlign={horizontalAlign}
                reduceMotion={reduceMotion}
                onHoverStart={() => setHovered(node.id)}
                onHoverEnd={() => setHovered((h) => (h === node.id ? null : h))}
                onActivate={(e) => {
                  e.stopPropagation()
                  setActive((a) => (a === node.id ? null : node.id))
                }}
              />
            </div>
          )
        })}
      </motion.div>

      <BlueprintMeta displayNode={displayNode} displayIndex={displayIndex} />
    </>
  )
}

/** Mobile: a straight vertical recomposition — same colors, same signal
 * concept, same tap-to-lock interaction — rather than squeezing the desktop
 * zig-zag horizontally. */
function BlueprintVertical({ reduceMotion }) {
  const [hovered, setHovered] = useState(null)
  const [active, setActive] = useState(null)
  const [entered, setEntered] = useState(reduceMotion)
  const listRef = useRef(null)
  const pulseProgress = useMotionValue(0)
  const pulseTop = useTransform(pulseProgress, (v) => `${v}%`)

  const displayId = hovered || active
  const displayIndex = displayId ? BLUEPRINT_NODES.findIndex((n) => n.id === displayId) : -1
  const displayNode = displayIndex >= 0 ? BLUEPRINT_NODES[displayIndex] : null

  useEffect(() => {
    if (reduceMotion || !entered) return undefined
    const controls = animate(pulseProgress, 100, {
      duration: 2.6,
      ease: 'linear',
      delay: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
      repeatDelay: 1.3,
    })
    return () => controls.stop()
  }, [entered, reduceMotion, pulseProgress])

  return (
    <>
      <motion.div
        ref={listRef}
        onClick={() => setActive(null)}
        onViewportEnter={() => setEntered(true)}
        viewport={{ once: true, amount: 0.3 }}
        className="relative flex flex-col items-center py-2"
      >
        {!reduceMotion && entered && (
          <motion.span
            className="pointer-events-none absolute left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            style={{ top: pulseTop, boxShadow: '0 0 10px 3px rgba(17,24,39,0.18)' }}
            aria-hidden="true"
          />
        )}

        {BLUEPRINT_NODES.map((node, i) => {
          const next = BLUEPRINT_NODES[i + 1]
          const emphasized = displayId === node.id
          const dimmed = displayIndex >= 0 && !emphasized
          const adjacent = displayIndex === i || displayIndex === i + 1 || displayIndex === i - 1
          return (
            <div key={node.id} className="relative flex flex-col items-center">
              <div className="relative h-14 w-14">
                <NodeCore
                  node={node}
                  index={i}
                  entered={entered}
                  emphasized={emphasized}
                  dimmed={dimmed}
                  showCaption={false}
                  reduceMotion={reduceMotion}
                  onHoverStart={() => setHovered(node.id)}
                  onHoverEnd={() => setHovered((h) => (h === node.id ? null : h))}
                  onActivate={(e) => {
                    e.stopPropagation()
                    setActive((a) => (a === node.id ? null : node.id))
                  }}
                />
              </div>
              {emphasized && !reduceMotion && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-1 max-w-[10rem] text-center font-mono text-[10px] uppercase leading-snug tracking-[0.06em]"
                  style={{ color: `rgb(${ACCENT_VAR[node.accent]})` }}
                >
                  {node.tagline}
                </motion.p>
              )}
              {next && (
                <motion.div
                  className="my-3 w-px"
                  initial={false}
                  animate={{ height: entered ? 24 : 0, opacity: entered ? (displayIndex >= 0 && !adjacent ? 0.35 : 0.85) : 0 }}
                  transition={{ duration: 0.5, delay: entered ? 0 : 0.3 + i * STAGGER, ease: EASE }}
                  style={{ backgroundImage: `linear-gradient(to bottom, rgb(${ACCENT_VAR[node.accent]}), rgb(${ACCENT_VAR[next.accent]}))` }}
                />
              )}
            </div>
          )
        })}
      </motion.div>

      <BlueprintMeta displayNode={displayNode} displayIndex={displayIndex} />
    </>
  )
}

function BlueprintMeta({ displayNode, displayIndex }) {
  return (
    <div className="relative mt-10 flex min-h-[3rem] flex-col gap-2 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <TechnicalLabel dot={false}>ATOOPV / WORKFLOW DIAGRAM</TechnicalLabel>
      <motion.div
        key={displayNode?.id || 'idle'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
      >
        {displayNode ? (
          `NODE ${String(displayIndex + 1).padStart(2, '0')} — ${displayNode.note}`
        ) : (
          <>
            <span className="hidden sm:inline">SURVOLEZ UN NŒUD POUR EN SAVOIR PLUS</span>
            <span className="sm:hidden">TOUCHEZ UN NŒUD POUR EN SAVOIR PLUS</span>
          </>
        )}
      </motion.div>
    </div>
  )
}

/**
 * LIVING BLUEPRINT (Experiment 02) — the same technical/editorial diagram
 * as before, now carrying a restrained colored signal: each stage owns an
 * accent, the connecting line is a real multi-stop gradient that draws in
 * on entry and carries a slow traveling pulse, and hovering/clicking a node
 * surfaces a short architectural-annotation caption. Desktop keeps the
 * absolutely-positioned zig-zag canvas (`BlueprintCanvas`); below `sm` the
 * same six nodes recompose into a straight vertical list (`BlueprintVertical`)
 * rather than squeezing the zig-zag horizontally.
 */
export default function LivingBlueprint() {
  const isDesktop = useIsDesktop(640)
  const reduceMotion = useReducedMotion()

  return (
    <section id="experiment-02" className="relative overflow-hidden border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="dt-blueprint-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <AmbientFields />

      <div className="shell relative">
        <ExperimentHeader index="02" eyebrow="SYSTEM / 02" titleLines={['LIVING', 'BLUEPRINT']} className="mb-6" />
        <TechnicalLabel dot={false} className="mb-3 text-ink/45">
          {BLUEPRINT_META.tagline}
        </TechnicalLabel>
        <p className="mb-14 max-w-lg text-sm leading-relaxed text-muted sm:mb-20 sm:text-base">{BLUEPRINT_META.description}</p>

        {isDesktop ? <BlueprintCanvas reduceMotion={reduceMotion} /> : <BlueprintVertical reduceMotion={reduceMotion} />}
      </div>
    </section>
  )
}
