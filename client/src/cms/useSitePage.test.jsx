// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AllProviders } from '@/test/providers'
import { useSitePage } from './useSitePage'
import { SITE_PAGES } from './sitePageRegistry'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({ fetchCmsSitePage: vi.fn() }))

const run = (key = 'tarification') => renderHook(() => useSitePage(key), { wrapper: ({ children }) => <AllProviders>{children}</AllProviders> })
const DEF = SITE_PAGES.tarification.defaults

beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })

describe('useSitePage', () => {
  it('renders the built-in content straight away and keeps it when the page was never edited (null)', async () => {
    cms.fetchCmsSitePage.mockResolvedValue(null)
    const { result } = run()
    expect(result.current).toBe(DEF)
    await waitFor(() => expect(cms.fetchCmsSitePage).toHaveBeenCalledWith('tarification'))
    expect(result.current.hero.title).toBe(DEF.hero.title)
  })

  it('shows the published CMS text (and a changed price) once the CMS answers', async () => {
    const live = JSON.parse(JSON.stringify(DEF))
    live.hero.title = 'Titre publié dans le CMS'
    live.tiers[0].rate = 95
    cms.fetchCmsSitePage.mockResolvedValue(live)
    const { result } = run()
    await waitFor(() => expect(result.current.hero.title).toBe('Titre publié dans le CMS'))
    expect(result.current.tiers[0].rate).toBe(95)
    expect(result.current.tiers[1].rate).toBe(DEF.tiers[1].rate)
  })

  it('falls back to the built-in content when the CMS is unreachable or answers garbage', async () => {
    cms.fetchCmsSitePage.mockRejectedValue(new Error('network'))
    const { result } = run()
    await waitFor(() => expect(cms.fetchCmsSitePage).toHaveBeenCalled())
    expect(result.current.hero.title).toBe(DEF.hero.title)
    cms.fetchCmsSitePage.mockResolvedValue({ hero: 'oops', tiers: [] })
    const r2 = run()
    await waitFor(() => expect(r2.result.current.tiers).toHaveLength(DEF.tiers.length))
    expect(r2.result.current.hero).toEqual(DEF.hero)
  })

  it('À propos keeps its icons (components) while text is overridden', async () => {
    const d = SITE_PAGES['a-propos'].defaults
    const live = JSON.parse(JSON.stringify(d))
    live.values.items[0].title = 'Fidélité (CMS)'
    cms.fetchCmsSitePage.mockResolvedValue(live)
    const { result } = run('a-propos')
    await waitFor(() => expect(result.current.values.items[0].title).toBe('Fidélité (CMS)'))
    expect(result.current.values.items[0].icon).toBe(d.values.items[0].icon)
  })

  it('Accueil keeps its icons and locked tokens while text is overridden', async () => {
    const d = SITE_PAGES.accueil.defaults
    const live = JSON.parse(JSON.stringify(d))
    live.hero.title = 'Titre accueil (CMS)'
    live.expertise.items[0].title = 'Rédaction (CMS)'
    live.ticker[0].anchor = '#autre'
    cms.fetchCmsSitePage.mockResolvedValue(live)
    const { result } = run('accueil')
    await waitFor(() => expect(result.current.hero.title).toBe('Titre accueil (CMS)'))
    expect(result.current.expertise.items[0].title).toBe('Rédaction (CMS)')
    expect(result.current.expertise.items[0].icon).toBe(d.expertise.items[0].icon)
    expect(result.current.ticker[0].anchor).toBe(d.ticker[0].anchor)
  })

  it('Autodiagnostic text follows the CMS but quiz scores never do', async () => {
    const d = SITE_PAGES.autodiagnostic.defaults
    const live = JSON.parse(JSON.stringify(d))
    live.quiz.questions[0].question = 'Question (CMS) ?'
    live.quiz.questions[0].options[0].score = 0
    cms.fetchCmsSitePage.mockResolvedValue(live)
    const { result } = run('autodiagnostic')
    await waitFor(() => expect(result.current.quiz.questions[0].question).toBe('Question (CMS) ?'))
    expect(result.current.quiz.questions[0].options[0].score).toBe(d.quiz.questions[0].options[0].score)
  })

  it('a key that is not a site page just gives the defaults and never asks the CMS', () => {
    const { result } = renderHook(() => useSitePage(null, { a: 1 }), { wrapper: ({ children }) => <AllProviders>{children}</AllProviders> })
    expect(result.current).toEqual({ a: 1 })
    expect(cms.fetchCmsSitePage).not.toHaveBeenCalled()
  })
})
