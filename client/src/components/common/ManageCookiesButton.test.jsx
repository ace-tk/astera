// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ManageCookiesButton from './ManageCookiesButton'

afterEach(() => { delete window.revisitCkyConsent })

describe('ManageCookiesButton', () => {
  it('is labelled "Gérer les cookies" and reopens the CookieYes preference centre', async () => {
    window.revisitCkyConsent = vi.fn()
    render(<ManageCookiesButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Gérer les cookies' }))
    expect(window.revisitCkyConsent).toHaveBeenCalledOnce()
  })
})
