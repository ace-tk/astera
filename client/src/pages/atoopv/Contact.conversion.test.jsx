// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Contact from './Contact'
import { api } from '@/services/api'
import { ThemeProvider } from '@/context/ThemeContext'
import { SoundProvider } from '@/context/SoundContext'

vi.mock('@/services/api', () => ({ api: { post: vi.fn() } }))
vi.mock('@/components/landing/Navbar', () => ({ default: () => null }))
vi.mock('@/components/landing/AmbientBackground', () => ({ default: () => null }))
vi.mock('@/components/atoopv/AtoopvFooter', () => ({ default: () => null }))
vi.mock('@/cms/useSitePage', async () => {
  const { SITE_PAGES } = await import('@/cms/sitePageRegistry')
  return { useSitePage: () => SITE_PAGES.contact.defaults, seoMeta: (_c, f) => f }
})

const renderContact = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider><SoundProvider><MemoryRouter><Contact /></MemoryRouter></SoundProvider></ThemeProvider>
    </QueryClientProvider>,
  )

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/Prénom/), 'Christine')
  await userEvent.type(screen.getByLabelText(/^Nom\s*\*?$/), 'Lefèvre')
  await userEvent.type(screen.getByLabelText(/Email professionnel/), 'christine@exemple.fr')
  await userEvent.type(screen.getByLabelText(/Téléphone/), '06 12 34 56 78')
  await userEvent.selectOptions(screen.getByLabelText(/Fonction au sein du CSE/), 'Secrétaire')
  await userEvent.type(screen.getByLabelText(/^Entreprise\s*\*?$/), 'Exemple SA')
}

beforeEach(() => {
  window.gtag = vi.fn()
  window.getCkyConsent = () => ({ categories: { advertisement: true } })
})
afterEach(() => { delete window.gtag; delete window.getCkyConsent; vi.clearAllMocks() })

describe('Contact form — Google Ads "quote request" conversion', () => {
  it('fires exactly once, only after the API confirmed the request (never on the button click)', async () => {
    let resolve
    api.post.mockReturnValue(new Promise((r) => { resolve = r }))
    renderContact()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /Envoyer la demande/ }))
    await waitFor(() => expect(api.post).toHaveBeenCalled())
    expect(window.gtag).not.toHaveBeenCalled() // request still pending: nothing sent yet
    resolve({ ok: true })
    await waitFor(() => expect(window.gtag).toHaveBeenCalledTimes(1))
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', { send_to: 'AW-823981254/whezCN3U9pcdEMbp84gD' })
    expect(api.post.mock.calls[0][2]).toEqual({ timeoutMs: 30000 }) // a stalled request ends in the error state
  })

  it('does not fire when the API rejects the request (4xx/5xx/timeout)', async () => {
    api.post.mockRejectedValue(Object.assign(new Error('Impossible d’envoyer'), { status: 502 }))
    renderContact()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /Envoyer la demande/ }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy())
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('a request that never answers ends in the visible error state instead of "sending" forever', async () => {
    api.post.mockRejectedValue(new DOMException('The operation was aborted due to timeout', 'TimeoutError'))
    renderContact()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /Envoyer la demande/ }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toMatch(/Impossible d’envoyer votre demande/)
    expect(screen.getByRole('button', { name: /Envoyer la demande/ })).not.toBeDisabled()
  })
})
