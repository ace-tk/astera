// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllProviders } from '@/test/providers'
import AdminCmsSitePagesTab from './AdminCmsSitePagesTab'
import { SITE_PAGES } from '@/cms/sitePageRegistry'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({
  fetchAdminSitePage: vi.fn(), saveAdminSitePageDraft: vi.fn(), publishAdminSitePage: vi.fn(), discardAdminSitePage: vi.fn(),
  fetchMediaLibrary: vi.fn(() => Promise.resolve([])), uploadMediaImage: vi.fn(),
}))

const json = (o) => JSON.parse(JSON.stringify(o))
const adminPage = (key, over = {}) => ({ key, label: SITE_PAGES[key].label, path: SITE_PAGES[key].path, draft: { content: json(SITE_PAGES[key].defaults) }, live: { content: json(SITE_PAGES[key].defaults) }, rev: 0, hasUnpublishedChanges: false, edited: false, ...over })

beforeEach(() => {
  vi.clearAllMocks()
  cms.fetchAdminSitePage.mockImplementation((key) => Promise.resolve(adminPage(key)))
})

const open = async () => {
  render(<AllProviders><AdminCmsSitePagesTab /></AllProviders>)
  await screen.findByRole('tab', { name: 'Tarification' })
  await waitFor(() => expect(screen.getAllByText(/Edit the text, links/).length).toBeGreaterThan(0))
}

describe('Admin site pages tab', () => {
  it('lists every site page and hub page (grouped) and shows no editable design tokens', async () => {
    await open()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(Object.values(SITE_PAGES).map((p) => p.label))
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(expect.arrayContaining([
      'Tarification', 'À propos', 'Contact', 'Accueil', 'AtooSavoir', 'AtooSavoir — Exemple', 'AtooSavoir — CGV', 'Autodiagnostic', 'Boutique',
      'Veille juridique (listing)', 'Services', 'Nos services PV', 'Communication CSE', 'Formations élus CSE agréées', 'Tarif rédaction PV CSE', 'Guides & livres blancs',
    ]))
    // ids / types / colours are never inputs
    expect(document.querySelector('[aria-label$="› id"]')).toBeNull()
    expect(document.querySelector('[aria-label$="› type"]')).toBeNull()
    expect(document.querySelector('[aria-label$="› color"]')).toBeNull()
  })

  it('opening a page never marks it dirty (Save draft stays disabled)', async () => {
    await open()
    expect(screen.getAllByRole('button', { name: /Save draft/ })[0]).toBeDisabled()
  })

  it('editing a price and a title saves exactly those values (and nothing else) via the draft API', async () => {
    cms.saveAdminSitePageDraft.mockImplementation((key, content) => Promise.resolve(adminPage(key, { draft: { content }, rev: 2, hasUnpublishedChanges: true })))
    await open()
    const rate = document.querySelector('[aria-label="tiers › 0 › rate"]')
    await userEvent.clear(rate)
    await userEvent.type(rate, '95')
    const title = document.querySelector('[aria-label="hero › title"]')
    await userEvent.clear(title)
    await userEvent.type(title, 'Nouveau titre')
    await userEvent.click(screen.getAllByRole('button', { name: /Save draft/ })[0])
    await waitFor(() => expect(cms.saveAdminSitePageDraft).toHaveBeenCalled())

    const [key, sent, rev] = cms.saveAdminSitePageDraft.mock.calls[0]
    const expected = json(SITE_PAGES.tarification.defaults)
    expected.tiers[0].rate = 95
    expected.hero.title = 'Nouveau titre'
    expect(key).toBe('tarification')
    expect(rev).toBe(0)
    expect(sent).toEqual(expected)
  })

  it('Publish saves pending edits first, then publishes', async () => {
    cms.saveAdminSitePageDraft.mockResolvedValue(adminPage('tarification', { rev: 2, hasUnpublishedChanges: true }))
    cms.publishAdminSitePage.mockResolvedValue(adminPage('tarification', { rev: 2 }))
    await open()
    const title = document.querySelector('[aria-label="hero › title"]')
    await userEvent.type(title, '!')
    await userEvent.click(screen.getAllByRole('button', { name: /Publish/ })[0])
    await waitFor(() => expect(cms.publishAdminSitePage).toHaveBeenCalledWith('tarification'))
    expect(cms.saveAdminSitePageDraft).toHaveBeenCalled()
  })

  it('shows the server problem when a save is rejected', async () => {
    cms.saveAdminSitePageDraft.mockRejectedValue(Object.assign(new Error('tiers.0.rate: Must be a number'), { status: 422 }))
    await open()
    await userEvent.type(document.querySelector('[aria-label="hero › title"]'), '!')
    await userEvent.click(screen.getAllByRole('button', { name: /Save draft/ })[0])
    expect(await screen.findByRole('alert')).toBeTruthy()
  })
})
