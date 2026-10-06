import { describe, it, expect } from 'vitest'
import { mergeContent } from './mergeContent'
import { SITE_PAGES } from './sitePageRegistry'
import { setIn, humanize, itemTitle } from './siteContentTree'

const Icon = () => null
const defaults = { title: 'T', n: 90, flag: true, list: ['a', 'b'], items: [{ id: 'x', icon: Icon, name: 'N', color: 'sky' }], nothing: null }

describe('mergeContent', () => {
  it('returns the defaults for a missing / null / garbage override', () => {
    for (const o of [undefined, null, 'x', 5, [], { }]) expect(mergeContent(defaults, o)).toEqual(defaults)
  })

  it('takes same-typed values from the override and nothing else', () => {
    const m = mergeContent(defaults, { title: 'New', n: 95, flag: false, list: ['c', 'd'], extra: 'ignored', items: [{ name: 'M' }] })
    expect(m.title).toBe('New')
    expect(m.n).toBe(95)
    expect(m.flag).toBe(false)
    expect(m.list).toEqual(['c', 'd'])
    expect(m.items[0].name).toBe('M')
    expect(m).not.toHaveProperty('extra')
  })

  it('wrong types and an emptied text fall back to the default', () => {
    const m = mergeContent(defaults, { title: '', n: '95', flag: 'no', list: 'zz' })
    expect(m).toEqual(defaults)
  })

  it('arrays of a different length are ignored (no add/remove from the CMS)', () => {
    expect(mergeContent(defaults, { list: ['only'] }).list).toEqual(['a', 'b'])
    expect(mergeContent(defaults, { list: ['a', 'b', 'c'] }).list).toEqual(['a', 'b'])
  })

  it('design tokens and components always come from the code, never the CMS', () => {
    const m = mergeContent(defaults, { items: [{ id: 'hacked', color: 'rose', icon: 'str', name: 'M' }] })
    expect(m.items[0]).toMatchObject({ id: 'x', color: 'sky', icon: Icon, name: 'M' })
  })

  it('React element-type objects (lucide forwardRef icons) are kept by reference, not copied', () => {
    const forwardRefIcon = { $$typeof: Symbol.for('react.forward_ref'), render: () => null }
    const d = { items: [{ icon: forwardRefIcon, title: 'T' }] }
    const m = mergeContent(d, { items: [{ icon: { hacked: true }, title: 'U' }] })
    expect(m.items[0].icon).toBe(forwardRefIcon)
    expect(m.items[0].title).toBe('U')
  })

  it('does not mutate the defaults', () => {
    const before = JSON.stringify(defaults)
    mergeContent(defaults, { title: 'New', list: ['c', 'd'] })
    expect(JSON.stringify(defaults)).toBe(before)
  })

  it('every registered site page merges its own JSON round-trip back to exactly itself', () => {
    for (const { defaults: d } of Object.values(SITE_PAGES)) {
      expect(mergeContent(d, JSON.parse(JSON.stringify(d)))).toEqual(d)
    }
  })
})

describe('siteContentTree helpers', () => {
  it('setIn is immutable and path-exact', () => {
    const t = { a: { b: [1, { c: 'x' }] } }
    const n = setIn(t, ['a', 'b', 1, 'c'], 'y')
    expect(n.a.b[1].c).toBe('y')
    expect(t.a.b[1].c).toBe('x')
    expect(n.a.b[0]).toBe(1)
  })

  it('humanize / itemTitle give readable labels', () => {
    expect(humanize('primaryCta')).toBe('Main button')
    expect(humanize('companySize')).toBe('Company size')
    expect(humanize(0)).toBe('1')
    expect(itemTitle({ question: 'Pourquoi ?' }, 2)).toBe('3. Pourquoi ?')
    expect(itemTitle({ answer: 'x' }, 0)).toBe('Item 1')
  })
})
