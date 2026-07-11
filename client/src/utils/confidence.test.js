import { describe, it, expect } from 'vitest'
import { deriveConfidence } from './confidence'

const report = {
  dna: { aiConfidence: 92 },
  metrics: { talkBalance: 0.6, risks: 2 },
  decisions: [{ confidence: 0.9 }, { confidence: 0.8 }],
}

describe('deriveConfidence()', () => {
  it('returns six grounded categories starting with overall', () => {
    const cats = deriveConfidence(report)
    expect(cats).toHaveLength(6)
    expect(cats[0].key).toBe('overall')
    expect(cats.map((c) => c.key)).toEqual(['overall', 'transcript', 'speaker', 'decision', 'timeline', 'risk'])
  })

  it('derives overall from Meeting DNA and decisions from decision confidence', () => {
    const cats = deriveConfidence(report)
    expect(cats.find((c) => c.key === 'overall').value).toBe(92)
    // avg(0.9, 0.8) * 100 = 85
    expect(cats.find((c) => c.key === 'decision').value).toBe(85)
  })

  it('clamps every value into the 40–99 range', () => {
    const extreme = deriveConfidence({ dna: { aiConfidence: 200 }, metrics: { talkBalance: 5, risks: 50 }, decisions: [] })
    for (const c of extreme) {
      expect(c.value).toBeGreaterThanOrEqual(40)
      expect(c.value).toBeLessThanOrEqual(99)
    }
  })

  it('is resilient to a report with no dna or decisions', () => {
    const cats = deriveConfidence({ metrics: {} })
    expect(cats).toHaveLength(6)
    expect(cats.every((c) => Number.isFinite(c.value))).toBe(true)
  })
})
