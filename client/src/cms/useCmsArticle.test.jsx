// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AllProviders } from '@/test/providers'
import { useCmsArticle } from './useCmsArticle'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({
  fetchCmsPage: vi.fn(),
  fetchPagePreview: vi.fn(),
  fetchNavigation: vi.fn(),
}))

const BUNDLED = { slug: 'x', title: 'Bundled title', body: 'bundled body' }
const cmsPage = (over = {}) => ({ slug: 'x', title: 'CMS title', section: 'ressources', content: { badge: 'B', body: 'cms body' }, ...over })

const run = (args) =>
  renderHook(() => useCmsArticle({ section: 'ressources', slug: 'x', path: '/ressources/x', bundled: BUNDLED, hub: false, drivenSlugs: new Set(), templateKey: 'ressources-article', ...args }), {
    wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
  })

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
})

// Regression tests for the two client-reported bugs (2026-10-02, 2026-10-06): a page was published in
// the CMS but its edits never showed, because it wasn't on a hand-maintained "CMS-driven" list.
describe('useCmsArticle — published CMS pages are used without being on any list', () => {
  it('a page that is NOT in drivenSlugs but IS published in the CMS index renders the CMS version', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [{ templateKey: 'ressources-article', section: 'ressources', slug: 'x', path: '/ressources/x' }] })
    cms.fetchCmsPage.mockResolvedValue({ page: cmsPage() })
    const { result } = run()
    await waitFor(() => expect(result.current.status).toBe('ready'))
    await waitFor(() => expect(result.current.page.title).toBe('CMS title'))
    expect(result.current.page.fromCms).toBe(true)
  })

  it('asks the CMS for the address the page is actually STORED under (legacy /atoopv/ressources/…), not the current route', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [{ templateKey: 'ressources-article', section: 'ressources', slug: 'x', path: '/atoopv/ressources/x' }] })
    cms.fetchCmsPage.mockResolvedValue({ page: cmsPage() })
    run()
    await waitFor(() => expect(cms.fetchCmsPage).toHaveBeenCalled())
    expect(cms.fetchCmsPage).toHaveBeenCalledWith('/atoopv/ressources/x')
  })

  it('a page the CMS does not have (and not on the list) stays on its bundled copy, with no page request at all', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [{ templateKey: 'ressources-article', section: 'ressources', slug: 'other', path: '/ressources/other' }] })
    const { result } = run()
    await waitFor(() => expect(cms.fetchNavigation).toHaveBeenCalled())
    expect(result.current).toEqual({ status: 'ready', page: BUNDLED })
    expect(cms.fetchCmsPage).not.toHaveBeenCalled()
  })

  it('does not mix up templates: a same-slug page of another template does not switch this one to the CMS', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [{ templateKey: 'service-article', section: 'ressources', slug: 'x', path: '/services/ressources/x' }] })
    const { result } = run()
    await waitFor(() => expect(cms.fetchNavigation).toHaveBeenCalled())
    expect(result.current.status).toBe('ready')
    expect(cms.fetchCmsPage).not.toHaveBeenCalled()
  })

  it('a slug on the drivenSlugs list still reads the CMS before the index answers, and still 404s when the CMS says unpublished', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [] })
    cms.fetchCmsPage.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    const { result } = run({ drivenSlugs: new Set(['x']) })
    await waitFor(() => expect(result.current.status).toBe('missing'))
  })

  it('falls back to the bundled copy when the CMS cannot be reached (network error)', async () => {
    cms.fetchNavigation.mockResolvedValue({ pages: [{ templateKey: 'ressources-article', section: 'ressources', slug: 'x', path: '/ressources/x' }] })
    cms.fetchCmsPage.mockRejectedValue(new Error('network'))
    const { result } = run()
    await waitFor(() => expect(cms.fetchCmsPage).toHaveBeenCalled())
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', page: BUNDLED }))
  })
})
