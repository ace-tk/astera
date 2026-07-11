import { describe, it, expect } from 'vitest'
import { generateReport } from '../src/services/intelligence.js'

const transcript = [
  'Maya: We decided to ship the billing rewrite before the pilot.',
  'Dan: My concern is this might slip — it feels like a blocker.',
  "Sam: I'll send the metrics by Fri.",
].join('\n')

describe('generateReport (heuristic analyser)', () => {
  it('extracts decisions, risks, and commitments from transcript cues', async () => {
    const report = await generateReport(transcript, { title: 'Sync', participants: ['Maya', 'Dan', 'Sam'] })
    expect(report.metrics.decisions).toBeGreaterThanOrEqual(1)
    expect(report.metrics.risks).toBeGreaterThanOrEqual(1)
    expect(report.metrics.commitments).toBeGreaterThanOrEqual(1)
  })

  it('is honestly labelled as heuristic (never claims an LLM ran)', async () => {
    const report = await generateReport(transcript, {})
    expect(report.engine).toBe('heuristic')
  })

  it('emits each pipeline stage via the progress callback', async () => {
    const stages = []
    await generateReport(transcript, {}, (s) => stages.push(s))
    expect(stages).toContain('transcript')
    expect(stages).toContain('delivery')
    expect(stages.length).toBeGreaterThan(3)
  })

  it('produces a valid report shape even for an empty transcript', async () => {
    const report = await generateReport('', { title: 'Empty' })
    expect(report).toHaveProperty('metrics')
    expect(report).toHaveProperty('timeline')
    expect(Array.isArray(report.participants)).toBe(true)
  })
})
