import { useCallback, useMemo, useRef, useState } from 'react'
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { Sparkles, Play, Maximize2, ChevronDown } from 'lucide-react'
import WorkspaceNode from '@/components/workspace/WorkspaceNode'
import AnimatedEdge from '@/components/workspace/AnimatedEdge'
import NodePanel from '@/components/workspace/NodePanel'
import MeshBackground from '@/components/common/MeshBackground'
import Button from '@/components/ui/Button'
import { useReports } from '@/hooks/useReports'
import { useSound } from '@/context/SoundContext'
import { WORKSPACE_NODES, WORKSPACE_EDGES, WORKSPACE_ORDER } from '@/constants/workspace'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

// Defined once, outside the component — React Flow requires stable identities.
const nodeTypes = { astera: WorkspaceNode }
const edgeTypes = { animated: AnimatedEdge }

const LEGEND = [
  { label: 'Source', color: 'coral' },
  { label: 'Intelligence', color: 'purple' },
  { label: 'Signals', color: 'emerald' },
  { label: 'Output', color: 'royal' },
]

function Canvas() {
  const { data: reports = [] } = useReports()
  const [reportIdx, setReportIdx] = useState(0)
  const report = reports[reportIdx]
  const [selected, setSelected] = useState(null)
  const [statuses, setStatuses] = useState(() => Object.fromEntries(WORKSPACE_NODES.map((n) => [n.id, 'done'])))
  const [running, setRunning] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const { fitView } = useReactFlow()
  const { play } = useSound()
  const timers = useRef([])

  const nodes = useMemo(
    () =>
      WORKSPACE_NODES.map((n, i) => ({
        id: n.id,
        type: 'astera',
        position: { x: n.x, y: n.y },
        data: { ...n, status: statuses[n.id], order: i, dimmed: running && statuses[n.id] === 'idle' },
      })),
    [statuses, running],
  )

  const edges = useMemo(
    () =>
      WORKSPACE_EDGES.map((e) => {
        const src = WORKSPACE_NODES.find((n) => n.id === e.source)
        const bothReady = statuses[e.source] === 'done' && statuses[e.target] !== 'idle'
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'animated',
          data: { color: accent(src.color).hex, active: bothReady },
        }
      }),
    [statuses],
  )

  const onNodeClick = useCallback(
    (_, node) => {
      play('open')
      setSelected(WORKSPACE_NODES.find((n) => n.id === node.id))
    },
    [play],
  )

  // Re-run the intelligence sweep: light each stage active → done in order.
  const runSweep = useCallback(() => {
    if (running) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRunning(true)
    setSelected(null)
    setStatuses(Object.fromEntries(WORKSPACE_NODES.map((n) => [n.id, 'idle'])))

    WORKSPACE_ORDER.forEach((id, i) => {
      timers.current.push(
        setTimeout(() => {
          play('step')
          setStatuses((s) => ({ ...s, [id]: 'active' }))
          timers.current.push(
            setTimeout(() => setStatuses((s) => ({ ...s, [id]: 'done' })), 520),
          )
        }, i * 620),
      )
    })
    timers.current.push(
      setTimeout(() => {
        setRunning(false)
        play('chime')
      }, WORKSPACE_ORDER.length * 620 + 600),
    )
  }, [running, play])

  if (!report) {
    return <div className="grid h-full place-items-center text-muted">Loading workspace…</div>
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MeshBackground mood="ai" />

      <ReactFlow
        className="astera-flow"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => setSelected(null)}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={26} size={1} color="rgb(17 24 39 / 0.05)" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>

      {/* Header overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto max-w-md rounded-3xl border border-ink/8 bg-card/80 p-5 shadow-soft backdrop-blur-xl"
        >
          <span className="eyebrow text-purple"><Sparkles className="h-3.5 w-3.5" /> Intelligence Workspace</span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">Every meeting, as a living graph.</h1>
          <p className="mt-1.5 text-sm text-muted">Click any node to inspect what Astra understood.</p>

          {/* report switcher */}
          <div className="relative mt-4">
            <button
              onClick={() => setSwitcherOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-ink/8 bg-paper px-3.5 py-2.5 text-left text-sm"
            >
              <span className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', accent(report.color).bg)} />
                <span className="font-medium">{report.title}</span>
              </span>
              <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', switcherOpen && 'rotate-180')} />
            </button>
            {switcherOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-ink/8 bg-card p-1.5 shadow-float"
              >
                {reports.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setReportIdx(i)
                      setSwitcherOpen(false)
                      setSelected(null)
                      play('tick')
                    }}
                    className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-ink/[0.04]', i === reportIdx && 'bg-ink/[0.04]')}
                  >
                    <span className={cn('h-2 w-2 rounded-full', accent(r.color).bg)} />
                    {r.title}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pointer-events-auto flex items-center gap-2"
        >
          <Button size="sm" variant="soft" onClick={() => fitView({ padding: 0.18, duration: 700 })}>
            <Maximize2 className="h-4 w-4" /> Fit
          </Button>
          <Button size="sm" variant="accent" onClick={runSweep} disabled={running}>
            <Play className="h-4 w-4" /> {running ? 'Thinking…' : 'Re-run intelligence'}
          </Button>
        </motion.div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pointer-events-none absolute bottom-6 left-6 z-10 flex flex-wrap gap-3 rounded-2xl border border-ink/8 bg-card/80 px-4 py-3 shadow-soft backdrop-blur-xl"
      >
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted">
            <span className={cn('h-2 w-2 rounded-full', accent(l.color).bg)} /> {l.label}
          </span>
        ))}
      </motion.div>

      <NodePanel node={selected} report={report} onClose={() => setSelected(null)} />
    </div>
  )
}

export default function Workspace() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  )
}
