import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AllProviders } from '@/test/providers'
import { useReportEdits } from './useReportEdits'

// Unauthenticated → the localStorage (demo) path, which is what these cover.
const wrap = (report) => renderHook(() => useReportEdits(report), { wrapper: AllProviders })

describe('useReportEdits (demo / local path)', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty and reports not edited', () => {
    const { result } = wrap({ id: 'r1' })
    expect(result.current.edits).toEqual({})
    expect(result.current.edited).toBe(false)
  })

  it('persists edits and drops empty keys', async () => {
    const { result } = wrap({ id: 'r1' })
    await act(async () => result.current.save({ title: 'New title', notes: '', headline: undefined }))
    expect(result.current.edits).toEqual({ title: 'New title' })
    expect(result.current.edited).toBe(true)
    expect(JSON.parse(localStorage.getItem('astera:review:r1'))).toEqual({ title: 'New title' })
  })

  it('reset clears both state and storage', async () => {
    const { result } = wrap({ id: 'r1' })
    await act(async () => result.current.save({ priority: 'high' }))
    act(() => result.current.reset())
    expect(result.current.edits).toEqual({})
    expect(localStorage.getItem('astera:review:r1')).toBeNull()
  })

  it('scopes edits per report id', async () => {
    const a = wrap({ id: 'a' })
    await act(async () => a.result.current.save({ title: 'A' }))
    const b = wrap({ id: 'b' })
    expect(b.result.current.edits).toEqual({})
  })
})
