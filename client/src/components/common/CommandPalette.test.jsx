import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllProviders } from '@/test/providers'
import CommandPalette from './CommandPalette'

const open = () => act(() => window.dispatchEvent(new CustomEvent('astera:command')))

describe('CommandPalette', () => {
  it('is closed until summoned, then reveals the search input', async () => {
    render(<CommandPalette />, { wrapper: AllProviders })
    expect(screen.queryByPlaceholderText(/search meetings/i)).toBeNull()
    open()
    expect(await screen.findByPlaceholderText(/search meetings/i)).toBeInTheDocument()
  })

  it('lists navigation commands and filters them as you type', async () => {
    render(<CommandPalette />, { wrapper: AllProviders })
    open()
    const input = await screen.findByPlaceholderText(/search meetings/i)
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()

    await userEvent.type(input, 'analyt')
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.queryByText('Workspace')).toBeNull()
  })

  it('shows an empty state for a query with no matches', async () => {
    render(<CommandPalette />, { wrapper: AllProviders })
    open()
    const input = await screen.findByPlaceholderText(/search meetings/i)
    await userEvent.type(input, 'zzxqzz')
    expect(screen.getByText(/no matches/i)).toBeInTheDocument()
  })
})
