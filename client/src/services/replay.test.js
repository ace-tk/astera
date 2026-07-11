import { describe, it, expect } from 'vitest'
import { buildMoments, BUILD_STAGES } from './replay'
import { getReport } from './mockData'

const report = getReport('board-fy26')

describe('buildMoments()', () => {
  const moments = buildMoments(report)

  it('prepends a synthetic opening moment then one per timeline entry', () => {
    expect(moments.length).toBe(report.timeline.length + 1)
    expect(moments[0].at).toBe('00:00')
    expect(moments[0].label).toBe('Meeting started')
  })

  it('attaches a speaker, a line, and stable ids to every moment', () => {
    for (const m of moments) {
      expect(report.participants).toContain(m.speaker)
      expect(typeof m.line).toBe('string')
      expect(m.line.length).toBeGreaterThan(0)
      expect(m.id).toBeTruthy()
    }
    expect(new Set(moments.map((m) => m.id)).size).toBe(moments.length)
  })

  it('links decision/risk/commitment moments to their source detail', () => {
    const decision = moments.find((m) => m.kind === 'decision')
    expect(decision.detail).toBeTruthy()
    expect(decision.detail).toHaveProperty('text')
  })
})

describe('BUILD_STAGES', () => {
  it('is a non-empty ordered list with keys, labels, and colors', () => {
    expect(BUILD_STAGES.length).toBeGreaterThan(3)
    for (const s of BUILD_STAGES) {
      expect(s).toHaveProperty('key')
      expect(s).toHaveProperty('label')
      expect(s).toHaveProperty('color')
    }
  })
})
