import { describe, it, expect, beforeEach } from 'vitest'
import { answer, greetWithMemory, GREETING, SUGGESTIONS } from './astra'
import { getReport } from './mockData'

const report = getReport('board-fy26')

describe('astra answer engine', () => {
  it('routes talk-time questions to a ranked speaker breakdown', () => {
    const res = answer('who spoke the most?', report)
    expect(res.list).toBeTruthy()
    expect(res.list.length).toBe(report.talkTime.length)
    // sorted descending by pct
    const pcts = res.list.map((l) => l.bar)
    expect(pcts).toEqual([...pcts].sort((a, b) => b - a))
  })

  it('explains why something is a risk, grounded in the report', () => {
    const res = answer('why is this a risk?', report)
    expect(res.text).toContain(report.risks[0].text)
    expect(res.tag.label).toMatch(/risk/i)
  })

  it('answers decisions, commitments, and summary intents', () => {
    expect(answer('show unresolved decisions', report).list.length).toBe(report.decisions.length)
    expect(answer('what did we commit to?', report).list.length).toBe(report.commitments.length)
    expect(answer('summarize this meeting', report).text).toBe(report.headline)
  })

  it('falls back gracefully to an orienting answer with stats', () => {
    const res = answer('xyzzy nonsense', report)
    expect(res.text).toContain(report.title)
    expect(res.stats).toHaveLength(4)
  })

  it('exposes a stable set of suggestion prompts', () => {
    expect(SUGGESTIONS.length).toBeGreaterThan(0)
    expect(SUGGESTIONS).toContain('Who spoke most?')
  })
})

describe('greetWithMemory', () => {
  beforeEach(() => localStorage.clear())

  it('greets normally on the first visit and records the report', () => {
    const res = greetWithMemory(report)
    expect(res.text).toBe(GREETING(report).text)
    expect(JSON.parse(localStorage.getItem('astera:lastReport')).id).toBe(report.id)
    expect(localStorage.getItem('astera:astraVisits')).toBe('1')
  })

  it('recalls a different previous report on return', () => {
    greetWithMemory(getReport('series-b')) // sets last = series-b
    const res = greetWithMemory(report) // different report
    expect(res.text).toMatch(/Welcome back/i)
    expect(res.text).toContain('Series B Investor Call')
  })

  it('never throws if localStorage is unavailable', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    expect(() => greetWithMemory(report)).not.toThrow()
    Object.defineProperty(window, 'localStorage', original)
  })
})
