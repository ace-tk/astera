import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useCanonical } from './useCanonical'
import { usePageMeta } from './usePageMeta'
import { normalizeCanonicalPath, setCanonicalOverride } from './canonicalStore'

const canonical = () => document.querySelector('link[rel="canonical"]')?.getAttribute('href')
const robots = () => document.querySelector('meta[name="robots"]')?.getAttribute('content')

describe('normalizeCanonicalPath', () => {
  it('keeps real paths, trims trailing slashes and query strings', () => {
    expect(normalizeCanonicalPath('/services/guides/x/')).toBe('/services/guides/x')
    expect(normalizeCanonicalPath('  /a?b=1#c ')).toBe('/a')
    expect(normalizeCanonicalPath('/')).toBe('/')
  })
  it('rejects anything that is not a site path', () => {
    for (const bad of ['', null, undefined, 'https://evil.example/x', '//evil.example/x', 'services/x']) expect(normalizeCanonicalPath(bad)).toBeNull()
  })
})

describe('CMS canonical + noindex reach the document head', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    setCanonicalOverride(null)
  })

  function mount(path, meta) {
    const wrapper = ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
    return renderHook(
      () => {
        useCanonical()
        usePageMeta(meta)
      },
      { wrapper },
    )
  }

  it('a page without a canonical field is its own canonical', () => {
    mount('/services/guides/a', { title: 'A' })
    expect(canonical()).toBe('https://atoopv.com/services/guides/a')
    expect(robots()).toBeUndefined()
  })

  it('a canonical path replaces the self-reference, and noindex adds the robots meta', () => {
    const { unmount } = mount('/services/guides/old', { title: 'Old', noindex: true, canonicalPath: '/services/guides/new/' })
    expect(canonical()).toBe('https://atoopv.com/services/guides/new')
    expect(robots()).toBe('noindex, nofollow')
    act(() => unmount())
    expect(robots()).toBeUndefined()
  })

  it('leaving the page restores the self-referencing canonical for the next page', () => {
    const first = mount('/services/guides/old', { title: 'Old', canonicalPath: '/services/guides/new' })
    expect(canonical()).toBe('https://atoopv.com/services/guides/new')
    act(() => first.unmount())
    mount('/ressources/b', { title: 'B' })
    expect(canonical()).toBe('https://atoopv.com/ressources/b')
  })
})
