// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AllProviders } from '@/test/providers'
import { useHubPage } from './useHubPage'
import { COMMUNICATION_FRAGMENTS } from '@/constants/fragmentsIntros'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({ fetchCmsSitePage: vi.fn() }))

// Bundled-page stand-ins (same shape the markdown loaders produce) — the real loaders glob the repo's content/ folder.
const page = (slug, category) => ({ slug, title: `T ${slug}`, breadcrumb: `B ${slug}`, body: `Texte ${slug}`, category })
const getServicePage = (slug) => page(slug, 'drafting')
const getResource = (slug) => page(slug, 'resources')

const run = (slug, bundled) => renderHook(() => useHubPage(slug, bundled), { wrapper: ({ children }) => <AllProviders>{children}</AllProviders> })

beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })

describe('useHubPage', () => {
  it('returns the bundled page itself when the hub was never edited', async () => {
    cms.fetchCmsSitePage.mockResolvedValue(null)
    const bundled = getServicePage('nos-services-pv')
    const { result } = run('nos-services-pv', bundled)
    expect(result.current).toEqual(bundled)
    await waitFor(() => expect(cms.fetchCmsSitePage).toHaveBeenCalledWith('hub-nos-services-pv'))
    expect(result.current.body).toBe(bundled.body)
  })

  it('shows the published title, badge and text over the bundled page (every other field kept)', async () => {
    const bundled = getServicePage('formations-elus-cse-agree')
    cms.fetchCmsSitePage.mockResolvedValue({ title: 'Titre CMS', badge: 'Badge CMS', markdown: `${bundled.body}\n\nAjout CMS` })
    const { result } = run('formations-elus-cse-agree', bundled)
    await waitFor(() => expect(result.current.title).toBe('Titre CMS'))
    expect(result.current.breadcrumb).toBe('Badge CMS')
    expect(result.current.body).toMatch(/Ajout CMS$/)
    expect(result.current.slug).toBe(bundled.slug)
    expect(result.current.category).toBe(bundled.category)
  })

  it('works for the Ressources hub and the Services landing page too', async () => {
    cms.fetchCmsSitePage.mockResolvedValue({ title: 'Guides CMS' })
    const r = run('guides-livres-blancs-cse', getResource('guides-livres-blancs-cse'))
    await waitFor(() => expect(r.result.current.title).toBe('Guides CMS'))
    cms.fetchCmsSitePage.mockResolvedValue({ title: 'Services CMS' })
    const s = run('services', getServicePage('services'))
    await waitFor(() => expect(s.result.current.title).toBe('Services CMS'))
  })

  it('communication hub: edited intro text is passed through, geometry is not part of it', async () => {
    const bundled = getServicePage('communication-cse')
    const fragmentsIntro = { fragments: COMMUNICATION_FRAGMENTS.fragments.map((f, i) => ({ role: f.role, text: i === 0 ? 'Texte CMS' : f.text, tag: f.tag })) }
    cms.fetchCmsSitePage.mockResolvedValue({ fragmentsIntro })
    const { result } = run('communication-cse', bundled)
    await waitFor(() => expect(result.current.fragmentsIntro?.fragments?.[0].text).toBe('Texte CMS'))
  })

  it('a slug that is not a hub, or no slug (leaf pages), returns the bundled page and never asks the CMS', () => {
    const leaf = getServicePage('redaction-pv-cse')
    expect(run(null, leaf).result.current).toBe(leaf)
    expect(run('redaction-pv-cse', leaf).result.current).toBe(leaf)
    expect(cms.fetchCmsSitePage).not.toHaveBeenCalled()
  })
})
