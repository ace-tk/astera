// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllProviders } from '@/test/providers'
import { SITE_PAGES } from '@/cms/sitePageRegistry'
import { useSitePage } from '@/cms/useSitePage'
import Boutique from '@/pages/atoopv/Boutique'

vi.mock('@/cms/useSitePage', () => ({ useSitePage: vi.fn() }))
vi.mock('@/components/landing/Navbar', () => ({ default: () => null }))
vi.mock('@/components/landing/AmbientBackground', () => ({ default: () => null }))
vi.mock('@/components/atoopv/AtoopvFooter', () => ({ default: () => null }))

const DEF = SITE_PAGES.boutique.defaults
const clone = () => JSON.parse(JSON.stringify(DEF))
const renderPage = () => render(<Boutique />, { wrapper: ({ children }) => <AllProviders>{children}</AllProviders> })

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }))
})

describe('Boutique CMS wiring', () => {
  it('renders the built-in book and report titles with no CMS data', () => {
    useSitePage.mockReturnValue(DEF)
    renderPage()
    expect(screen.getAllByText(DEF.books[0].title).length).toBeGreaterThan(0)
    expect(screen.getAllByText(DEF.reportMeta.title).length).toBeGreaterThan(0)
  })

  it('shows CMS overrides for a book title and the report org', () => {
    const live = clone()
    live.books[0].title = 'Titre livre CMS'
    live.reportMeta.org = 'Organisation CMS'
    useSitePage.mockReturnValue(live)
    renderPage()
    expect(screen.getAllByText('Titre livre CMS').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Organisation CMS').length).toBeGreaterThan(0)
  })
})
