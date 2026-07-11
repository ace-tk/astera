import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportEdits } from './useReportEdits'

describe('useReportEdits', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty and reports not edited', () => {
    const { result } = renderHook(() => useReportEdits('r1'))
    expect(result.current.edits).toEqual({})
    expect(result.current.edited).toBe(false)
  })

  it('persists edits and drops empty keys', () => {
    const { result } = renderHook(() => useReportEdits('r1'))
    act(() => result.current.save({ title: 'New title', notes: '', headline: undefined }))
    expect(result.current.edits).toEqual({ title: 'New title' })
    expect(result.current.edited).toBe(true)
    expect(JSON.parse(localStorage.getItem('astera:review:r1'))).toEqual({ title: 'New title' })
  })

  it('reset clears both state and storage', () => {
    const { result } = renderHook(() => useReportEdits('r1'))
    act(() => result.current.save({ priority: 'high' }))
    act(() => result.current.reset())
    expect(result.current.edits).toEqual({})
    expect(localStorage.getItem('astera:review:r1')).toBeNull()
  })

  it('scopes edits per report id', () => {
    const a = renderHook(() => useReportEdits('a'))
    act(() => a.result.current.save({ title: 'A' }))
    const b = renderHook(() => useReportEdits('b'))
    expect(b.result.current.edits).toEqual({})
  })
})
