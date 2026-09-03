import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import ExperimentHeader from '../primitives/ExperimentHeader'
import TechnicalLabel from '../primitives/TechnicalLabel'
import CursorCoordinates from '../primitives/CursorCoordinates'
import { BLUEPRINT_NODES } from '@/constants/designTest'

const EASE = [0.16, 1, 0.3, 1]

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

/**
 * An interactive technical diagram, not a flowchart: nodes sit on a
 * blueprint grid and are connected by lines that draw themselves in on
 * entry. Hovering/focusing a node highlights its adjacent segments and
 * surfaces its annotation, standing in for the "the interface appears to
 * construct itself" beat from the brief.
 */
export default function LivingBlueprint() {
  const [hovered, setHovered] = useState(null)
  const diagramRef = useRef(null)
  const hoveredIndex = hovered ? BLUEPRINT_NODES.findIndex((n) => n.id === hovered) : -1
  const activeNode = hoveredIndex >= 0 ? BLUEPRINT_NODES[hoveredIndex] : null

  return (
    <section id="experiment-02" className="relative overflow-hidden border-t border-ink/10 bg-paper py-24 sm:py-32">
      <div className="dt-blueprint-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

      <div className="shell relative">
        <ExperimentHeader index="02" eyebrow="SYSTEM / 02" titleLines={['LIVING', 'BLUEPRINT']} className="mb-14 sm:mb-20" />

        <div ref={diagramRef} className="relative h-[26rem] sm:h-[30rem] lg:h-[34rem]">
          <CursorCoordinates containerRef={diagramRef} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {BLUEPRINT_NODES.slice(0, -1).map((node, i) => {
              const next = BLUEPRINT_NODES[i + 1]
              const emphasized = hoveredIndex === i || hoveredIndex === i + 1
              return (
                <motion.line
                  key={node.id}
                  x1={node.x * 100}
                  y1={node.y * 100}
                  x2={next.x * 100}
                  y2={next.y * 100}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE }}
                  stroke={emphasized ? 'rgb(var(--accent))' : 'rgb(var(--line) / 0.25)'}
                  strokeWidth={emphasized ? 0.35 : 0.18}
                  vectorEffect="non-scaling-stroke"
                  style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
                />
              )
            })}
          </svg>

          {BLUEPRINT_NODES.map((node, i) => (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
            >
              <motion.button
                type="button"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered((h) => (h === node.id ? null : h))}
                onFocus={() => setHovered(node.id)}
                onBlur={() => setHovered((h) => (h === node.id ? null : h))}
                initial={{ scale: 0, opacity: 0, x: NODE_JITTER[i].x, y: NODE_JITTER[i].y }}
                whileInView={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: EASE }}
                aria-label={`${node.label} — ${node.note}`}
                className={clsx(
                  'flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors duration-300',
                  hovered === node.id ? 'border-accent bg-accent' : 'border-ink/30 bg-paper hover:border-ink/60',
                )}
              >
                <span className={clsx('h-1 w-1 rounded-full', hovered === node.id ? 'bg-paper' : 'bg-ink/40')} />
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.75 + i * 0.12, ease: EASE }}
                className={clsx(
                  'absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 sm:text-[11px]',
                  hovered === node.id ? 'text-ink' : 'text-muted/60',
                )}
              >
                {node.label}
              </motion.div>
            </div>
          ))}
        </div>

        <div className="relative mt-10 flex min-h-[3rem] flex-col gap-2 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <TechnicalLabel dot={false}>ATOOPV / WORKFLOW DIAGRAM</TechnicalLabel>
          <motion.div
            key={activeNode?.id || 'idle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
          >
            {activeNode
              ? `NODE ${String(hoveredIndex + 1).padStart(2, '0')} — ${activeNode.note}`
              : 'SURVOLEZ UN NŒUD POUR EN SAVOIR PLUS'}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
