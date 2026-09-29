// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import AtoopvFooter from './AtoopvFooter'
import { fetchCmsFooter } from '@/services/cms'
import { ThemeProvider } from '@/context/ThemeContext'
import { SoundProvider } from '@/context/SoundContext'
import { DEFAULT_FOOTER_CONTENT } from '@/cms/footerDefaults'

vi.mock('@/services/cms', () => ({ fetchCmsFooter: vi.fn() }))

const qc = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })
const renderFooter = () =>
  render(
    <QueryClientProvider client={qc()}>
      <ThemeProvider><SoundProvider><MemoryRouter><AtoopvFooter /></MemoryRouter></SoundProvider></ThemeProvider>
    </QueryClientProvider>,
  )

describe('Public footer — CMS-driven with a safe hardcoded fallback', () => {
  it('renders the current (pre-CMS) hardcoded content immediately, before the CMS answers', () => {
    fetchCmsFooter.mockReturnValue(new Promise(() => {})) // never resolves in this test
    renderFooter()
    expect(screen.getByText('« Retranscrire sans trahir. »')).toBeTruthy()
    expect(screen.getByText('Lyon · Annecy — ALC SAS')).toBeTruthy()
    expect(screen.getByText('Demander un devis')).toBeTruthy()
    expect(screen.getByText(/© \d{4} ALC SAS/)).toBeTruthy()
    // no social row when there are no social links
    expect(screen.queryByLabelText(/linkedin/i)).toBeNull()
  })

  it('falls back to the same hardcoded content when the CMS request fails — never a broken/empty footer', async () => {
    fetchCmsFooter.mockRejectedValue(Object.assign(new Error('network down'), { status: 0 }))
    renderFooter()
    await waitFor(() => expect(fetchCmsFooter).toHaveBeenCalled())
    expect(screen.getByText('« Retranscrire sans trahir. »')).toBeTruthy()
    expect(screen.getByText(DEFAULT_FOOTER_CONTENT.contact.email)).toBeTruthy()
  })

  it('re-renders from the CMS once it answers, with the exact published content', async () => {
    const edited = {
      ...DEFAULT_FOOTER_CONTENT,
      brand: { ...DEFAULT_FOOTER_CONTENT.brand, tagline: 'Nouvelle signature CMS' },
      social: [{ id: 's1', platform: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/atoopv', enabled: true }],
    }
    fetchCmsFooter.mockResolvedValue(edited)
    renderFooter()
    await waitFor(() => expect(screen.getByText('Nouvelle signature CMS')).toBeTruthy())
    expect(screen.queryByText('« Retranscrire sans trahir. »')).toBeNull()
    // the new social link row now appears
    expect(screen.getByLabelText('LinkedIn')).toBeTruthy()
  })

  it('a disabled social link is not rendered', async () => {
    fetchCmsFooter.mockResolvedValue({
      ...DEFAULT_FOOTER_CONTENT,
      social: [{ id: 's1', platform: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/atoopv', enabled: false }],
    })
    renderFooter()
    await waitFor(() => expect(fetchCmsFooter).toHaveBeenCalled())
    expect(screen.queryByLabelText('LinkedIn')).toBeNull()
  })

  it('legal links render with their current href (including an unset "#")', () => {
    fetchCmsFooter.mockReturnValue(new Promise(() => {}))
    renderFooter()
    const link = screen.getByText('Mentions légales')
    expect(link.getAttribute('href')).toBe('#')
  })
})
