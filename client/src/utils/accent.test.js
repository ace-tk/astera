import { describe, it, expect } from 'vitest'
import { accent, ACCENT } from './accent'

describe('accent()', () => {
  it('returns the token set for a known feature color', () => {
    const a = accent('royal')
    expect(a).toBe(ACCENT.royal)
    expect(a.text).toBe('text-royal')
    expect(a.bg).toBe('bg-royal')
    expect(a.hex).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('falls back to royal for an unknown color', () => {
    expect(accent('not-a-color')).toBe(ACCENT.royal)
    expect(accent(undefined)).toBe(ACCENT.royal)
  })

  it('exposes only static Tailwind class strings (JIT-safe)', () => {
    for (const [, tokens] of Object.entries(ACCENT)) {
      expect(tokens.text.startsWith('text-')).toBe(true)
      expect(tokens.bg.startsWith('bg-')).toBe(true)
      expect(tokens.hex).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })
})
