/**
 * The intelligence graph that powers the Workspace canvas. Each stage is a
 * node with its own personality (kind), semantic color, and organic position —
 * deliberately not a rigid grid. Edges wire the pipeline together with a couple
 * of branches (AI fans out to timeline + speakers; decision/risk converge on
 * compliance). Panels render live from the report, so nodes stay data-driven.
 */

export const WORKSPACE_NODES = [
  { id: 'recording', kind: 'recording', title: 'Meeting Recording', subtitle: 'Source audio', color: 'coral', x: 0, y: 120 },
  { id: 'transcript', kind: 'transcript', title: 'Transcript', subtitle: 'Diarized · timestamped', color: 'orange', x: 320, y: 40 },
  { id: 'ai', kind: 'ai', title: 'AI Understanding', subtitle: 'Intent & meaning', color: 'purple', x: 660, y: 150 },
  { id: 'timeline', kind: 'timeline', title: 'Timeline', subtitle: 'Minute by minute', color: 'emerald', x: 1020, y: 20 },
  { id: 'speaker', kind: 'speaker', title: 'Speaker Analysis', subtitle: 'Who held the room', color: 'sky', x: 1020, y: 270 },
  { id: 'decision', kind: 'decision', title: 'Decision Engine', subtitle: 'What was decided', color: 'royal', x: 1380, y: 120 },
  { id: 'risk', kind: 'risk', title: 'Risk Detection', subtitle: 'Quiet red flags', color: 'rose', x: 1380, y: 330 },
  { id: 'compliance', kind: 'compliance', title: 'Compliance', subtitle: 'Promises on the record', color: 'golden', x: 1720, y: 240 },
  { id: 'summary', kind: 'summary', title: 'Executive Summary', subtitle: 'The story, distilled', color: 'purple', x: 1720, y: 20 },
  { id: 'report', kind: 'report', title: 'Report', subtitle: 'Ready to read', color: 'royal', x: 2060, y: 130 },
]

export const WORKSPACE_EDGES = [
  { id: 'e1', source: 'recording', target: 'transcript' },
  { id: 'e2', source: 'transcript', target: 'ai' },
  { id: 'e3', source: 'ai', target: 'timeline' },
  { id: 'e4', source: 'ai', target: 'speaker' },
  { id: 'e5', source: 'timeline', target: 'decision' },
  { id: 'e6', source: 'speaker', target: 'decision' },
  { id: 'e7', source: 'decision', target: 'risk' },
  { id: 'e8', source: 'decision', target: 'summary' },
  { id: 'e9', source: 'risk', target: 'compliance' },
  { id: 'e10', source: 'summary', target: 'report' },
  { id: 'e11', source: 'compliance', target: 'report' },
]

// Ordered ids for the "activate the graph" intro sweep.
export const WORKSPACE_ORDER = [
  'recording', 'transcript', 'ai', 'timeline', 'speaker', 'decision', 'risk', 'summary', 'compliance', 'report',
]
