import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to light and applies data-theme to <html>', () => {
    renderHook(() => useTheme(), { wrapper })
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('switches themes, persisting the choice and re-skinning the root', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => result.current.setTheme('royal'))
    expect(result.current.theme).toBe('royal')
    expect(document.documentElement.getAttribute('data-theme')).toBe('royal')
    expect(localStorage.getItem('astera:theme')).toBe('royal')
  })

  it('exposes exactly the three shipped themes', () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.themes.map((t) => t.id)).toEqual(['light', 'sunset', 'royal'])
  })

  it('ignores a retired/unknown saved theme and falls back to light', () => {
    localStorage.setItem('astera:theme', 'aurora')
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })
})
