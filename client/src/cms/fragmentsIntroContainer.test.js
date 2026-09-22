import { describe, it, expect } from 'vitest'
import { FORMATION_ECONOMIQUE_FRAGMENTS } from '@/constants/fragmentsIntros'
import { FRAGMENTS_INTRO_BASE, editorialTextOf, mergeFragmentsIntro } from './fragmentsIntroContainer'

const base = FORMATION_ECONOMIQUE_FRAGMENTS

describe('fragmentsIntroContainer', () => {
  it('registers exactly the two existing pages that have this intro', () => {
    expect(Object.keys(FRAGMENTS_INTRO_BASE).sort()).toEqual(['communication-cse', 'formation-economique-elus-cse'])
  })

  it('with no CMS override, merge returns the hardcoded base UNCHANGED — including geometry', () => {
    expect(mergeFragmentsIntro(base, undefined)).toBe(base) // same reference: nothing is even copied
    expect(mergeFragmentsIntro(base, null)).toBe(base)
  })

  it('editorialTextOf exposes only text, never geometry/ids/kind/group', () => {
    const text = editorialTextOf(base)
    expect(text.fragments[0]).toEqual({ role: 'MODULE 01', text: base.fragments[0].text, tag: 'RÉFORME' })
    expect(text.fragments[0].stacked).toBeUndefined()
    expect(text.fragments[0].id).toBeUndefined()
    expect(text.fragments[0].group).toBeUndefined()
    expect(text.groups[0]).toEqual({ label: 'CADRE JURIDIQUE' })
    expect(text.groups[0].id).toBeUndefined()
  })

  it('editing ONE fragment’s text changes only that text — everything else, including geometry, is untouched', () => {
    const override = editorialTextOf(base)
    override.fragments[1].text = 'Nouveau texte du module 2'
    const merged = mergeFragmentsIntro(base, override)

    expect(merged.fragments[1].text).toBe('Nouveau texte du module 2')
    // untouched fragments, byte for byte
    expect(merged.fragments[0]).toEqual(base.fragments[0])
    expect(merged.fragments[2]).toEqual(base.fragments[2])
    expect(merged.fragments[3]).toEqual(base.fragments[3])
    // geometry of the EDITED fragment itself is also untouched
    expect(merged.fragments[1].stacked).toEqual(base.fragments[1].stacked)
    expect(merged.fragments[1].readable).toEqual(base.fragments[1].readable)
    expect(merged.fragments[1].readableMobile).toEqual(base.fragments[1].readableMobile)
    expect(merged.fragments[1].organized).toEqual(base.fragments[1].organized)
    expect(merged.fragments[1].converge).toEqual(base.fragments[1].converge)
    expect(merged.fragments[1].id).toBe(base.fragments[1].id)
    expect(merged.fragments[1].group).toBe(base.fragments[1].group)
    // everything else on the object is untouched too
    expect(merged.eyebrow).toBe(base.eyebrow)
    expect(merged.phases).toEqual(base.phases)
    expect(merged.groups).toEqual(base.groups)
    expect(merged.documentRows).toEqual(base.documentRows)
    expect(merged.statement).toEqual(base.statement)
  })

  it('a partial override (some fields never touched by the admin) still falls back to base for those fields', () => {
    const merged = mergeFragmentsIntro(base, { eyebrow: 'Nouvelle accroche' })
    expect(merged.eyebrow).toBe('Nouvelle accroche')
    expect(merged.titleLines).toEqual(base.titleLines)
    expect(merged.fragments).toEqual(base.fragments)
    expect(merged.documentMeta).toBe(base.documentMeta)
    expect(merged.statement).toEqual(base.statement)
  })

  it('editing every field produces exactly the requested text, with geometry/phases always from base', () => {
    const override = {
      eyebrow: 'E', titleLines: ['A', 'B'],
      fragments: [{ role: 'r0', text: 't0', tag: 'g0' }, { role: 'r1', text: 't1', tag: 'g1' }, { role: 'r2', text: 't2', tag: 'g2' }, { role: 'r3', text: 't3', tag: 'g3' }],
      groups: [{ label: 'G1' }, { label: 'G2' }],
      documentLabel: 'DL', documentRows: [{ label: 'l0', text: 'v0' }, { label: 'l1', text: 'v1' }, { label: 'l2', text: 'v2' }, { label: 'l3', text: 'v3' }],
      annotations: ['a0', 'a1', 'a2', 'a3'], documentMeta: 'DM', statement: ['s0', 's1'],
    }
    const merged = mergeFragmentsIntro(base, override)
    expect(merged.eyebrow).toBe('E')
    expect(merged.fragments.map((f) => [f.role, f.text, f.tag])).toEqual([['r0', 't0', 'g0'], ['r1', 't1', 'g1'], ['r2', 't2', 'g2'], ['r3', 't3', 'g3']])
    expect(merged.fragments.map((f) => f.stacked)).toEqual(base.fragments.map((f) => f.stacked)) // geometry always from base
    expect(merged.groups.map((g) => g.label)).toEqual(['G1', 'G2'])
    expect(merged.phases).toEqual(base.phases) // never overridable at all — not even present in the override shape
  })
})
