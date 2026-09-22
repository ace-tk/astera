// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { AllProviders } from '@/test/providers'
import AdminCmsPageEditor from './AdminCmsPageEditor'
import { FORMATION_ECONOMIQUE_FRAGMENTS } from '@/constants/fragmentsIntros'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({
  fetchAdminPage: vi.fn(), fetchTemplates: vi.fn(), fetchAdminMenu: vi.fn(() => Promise.resolve({ draft: { items: [] }, live: { items: [] } })),
  fetchPageRevisions: vi.fn(() => Promise.resolve([])), saveAdminDraft: vi.fn(), publishAdminPage: vi.fn(), unpublishAdminPage: vi.fn(),
  discardAdminDraft: vi.fn(), duplicateAdminPage: vi.fn(), archiveAdminPage: vi.fn(), fetchPageUsages: vi.fn(),
}))

const TEMPLATE = {
  key: 'service-article', name: 'Service Article', creatable: true, pathPattern: '/services/:section/:slug', tagOptions: [],
  sections: [{ key: 'training', label: 'Formations' }],
  fields: [{ key: 'badge', type: 'text', label: 'Hero label', maxLength: 120 }, { key: 'body', type: 'richtext', label: 'Article body', maxLength: 1000 }],
}
const page = (contentOver = {}) => ({
  id: 'p1', templateKey: 'service-article', section: 'training', status: 'draft', hasUnpublishedChanges: false, rev: 1, path: '/services/training/formation-economique-elus-cse',
  draft: { title: 'Formation économique — 5 jours', slug: 'formation-economique-elus-cse', content: { badge: 'Services', body: 'Texte.', ...contentOver }, seo: {} },
  live: null, navLabel: '', showInNav: true, tags: [], menu: null,
})

const renderEditor = () =>
  render(
    <AllProviders route="/app/admin/cms/pages/p1">
      <Routes><Route path="/app/admin/cms/pages/:id" element={<AdminCmsPageEditor />} /></Routes>
    </AllProviders>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  cms.fetchTemplates.mockResolvedValue([TEMPLATE])
})

describe('Admin page editor — existing intro animation text (formation-economique-elus-cse)', () => {
  it('is pre-filled with the CURRENT hardcoded text when the page has never been edited', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    renderEditor()
    expect(await screen.findByRole('heading', { name: /Existing intro animation/ })).toBeTruthy()
    expect(screen.getByLabelText('Small heading')).toHaveValue(FORMATION_ECONOMIQUE_FRAGMENTS.eyebrow)
    expect(screen.getByLabelText('Module 2 text')).toHaveValue(FORMATION_ECONOMIQUE_FRAGMENTS.fragments[1].text)
    expect(screen.getByLabelText('Document row 3 value')).toHaveValue(FORMATION_ECONOMIQUE_FRAGMENTS.documentRows[2].text) // "NDA 84740456974"
  })

  it('does NOT expose any geometry/coordinate/rotation/animation control', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    renderEditor()
    await screen.findByRole('heading', { name: /Existing intro animation/ })
    const section = screen.getByRole('region', { name: /Existing intro animation/ }) ?? document.querySelector('[aria-label="Existing intro animation — text only"]')
    const html = section.innerHTML.toLowerCase()
    for (const term of ['stacked', 'readable', 'organized', 'converge', 'rotate', 'phases', 'x":', 'y":']) expect(html).not.toContain(term)
    expect(screen.queryByText(/geometry|coordinate|rotation|animation timing/i)).toBeNull()
  })

  it('opening the page never marks it dirty (Save draft stays disabled)', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    renderEditor()
    await screen.findByRole('heading', { name: /Existing intro animation/ })
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeDisabled()
  })

  it('editing ONE text value only changes that field when saved — everything else in the object stays exactly as the hardcoded default', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    cms.saveAdminDraft.mockResolvedValue(page())
    renderEditor()
    const field = await screen.findByLabelText('Module 2 text')
    await userEvent.clear(field)
    await userEvent.type(field, 'Nouveau texte du module 2')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(cms.saveAdminDraft).toHaveBeenCalled())

    const sentFi = cms.saveAdminDraft.mock.calls[0][1].content.fragmentsIntro
    const expected = {
      eyebrow: FORMATION_ECONOMIQUE_FRAGMENTS.eyebrow,
      titleLines: FORMATION_ECONOMIQUE_FRAGMENTS.titleLines,
      fragments: FORMATION_ECONOMIQUE_FRAGMENTS.fragments.map((f, i) => ({ role: f.role, text: i === 1 ? 'Nouveau texte du module 2' : f.text, tag: f.tag })),
      groups: FORMATION_ECONOMIQUE_FRAGMENTS.groups.map((g) => ({ label: g.label })),
      documentLabel: FORMATION_ECONOMIQUE_FRAGMENTS.documentLabel,
      documentRows: FORMATION_ECONOMIQUE_FRAGMENTS.documentRows,
      annotations: FORMATION_ECONOMIQUE_FRAGMENTS.annotations,
      documentMeta: FORMATION_ECONOMIQUE_FRAGMENTS.documentMeta,
      statement: FORMATION_ECONOMIQUE_FRAGMENTS.statement,
    }
    expect(sentFi).toEqual(expected)
    // and nothing else in the save payload changed either
    expect(cms.saveAdminDraft.mock.calls[0][1].content.badge).toBe('Services')
    expect(cms.saveAdminDraft.mock.calls[0][1].content.body).toBe('Texte.')
  })

  it('does not render this section at all for a page with no fragments intro', async () => {
    cms.fetchAdminPage.mockResolvedValue({ ...page(), draft: { ...page().draft, slug: 'formation-cse-tresorier' } })
    renderEditor()
    await screen.findByLabelText('Page title')
    expect(screen.queryByRole('heading', { name: /Existing intro animation/ })).toBeNull()
  })
})
