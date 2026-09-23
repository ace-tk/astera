// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { AllProviders } from '@/test/providers'
import AdminCmsPageEditor from './AdminCmsPageEditor'
import * as cms from '@/services/cms'

vi.mock('@/services/cms', () => ({
  fetchAdminPage: vi.fn(), fetchTemplates: vi.fn(), fetchAdminMenu: vi.fn(() => Promise.resolve({ draft: { items: [] }, live: { items: [] } })),
  fetchPageRevisions: vi.fn(() => Promise.resolve([])), saveAdminDraft: vi.fn(), publishAdminPage: vi.fn(), unpublishAdminPage: vi.fn(),
  discardAdminDraft: vi.fn(), duplicateAdminPage: vi.fn(), archiveAdminPage: vi.fn(), fetchPageUsages: vi.fn(),
}))

const SERVICE_TEMPLATE = {
  key: 'service-article', name: 'Service Article', creatable: true, pathPattern: '/services/:section/:slug', tagOptions: [],
  sections: [{ key: 'training', label: 'Formations' }, { key: 'guides', label: 'Guides pratiques' }],
  fields: [{ key: 'badge', type: 'text', label: 'Hero label', maxLength: 120 }, { key: 'body', type: 'richtext', label: 'Article body', maxLength: 20000 }],
}

// A real body shape: intro, 4 stats, main content, 2 topics ("formation-cse-tresorier" is in
// TOPIC_LAYOUT with the "journey" layout), content after topics, 2 FAQ items, content after FAQ.
// Every literal marker (stat labels, FAQ_MARKER, emoji+heading pairs) matches the exact conventions
// `disassembleServiceArticle`/`utils/formationContent.js` already require across the real corpus.
const REAL_BODY = [
  'Voici l’intro du programme de formation.',
  '',
  '2017',
  '',
  'Année de création',
  '',
  '48 à 72h',
  '',
  'Délai moyen de livraison',
  '',
  '3',
  '',
  'Formats de PV au choix',
  '',
  '15',
  '',
  'Guides juridiques publiés',
  '',
  '## Un sous-titre',
  '',
  'Voici le contenu principal de la page.',
  '',
  '📋',
  '',
  '### Premier thème',
  '',
  '⚖️',
  '',
  '### Deuxième thème',
  '',
  'Du contenu après les thèmes.',
  '',
  'Cliquez sur une question pour afficher la réponse.',
  '',
  'Première question ?',
  '',
  'Première réponse.',
  '',
  'Deuxième question ?',
  '',
  'Deuxième réponse.',
  '',
  'Du contenu après la FAQ.',
  '',
].join('\n')

const page = (contentOver = {}, slug = 'formation-cse-tresorier') => ({
  id: 'p1', templateKey: 'service-article', section: 'training', status: 'draft', hasUnpublishedChanges: false, rev: 1, path: `/services/training/${slug}`,
  draft: { title: 'Trésorier du CSE', slug, content: { badge: 'Services', body: REAL_BODY, ...contentOver }, seo: {} },
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
  cms.fetchTemplates.mockResolvedValue([SERVICE_TEMPLATE])
})

describe('Admin page editor — container-style editing shows the actual migrated content', () => {
  it('disassembles the stored body into Intro/Stats/Main/Topics/afterTopics/FAQ/afterFAQ, pre-filled with the real content — not a single opaque body field', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    renderEditor()
    await screen.findByLabelText('Page title')

    // The generic single "Article body" field is gone for this page — replaced by containers.
    expect(screen.queryByText('Article body')).toBeNull()

    expect(screen.getByText('Intro').closest('div')).toHaveTextContent(/Voici l.intro du programme de formation\./)
    expect(screen.getByLabelText('Stat 1 value')).toHaveValue('2017')
    expect(screen.getByLabelText('Stat 1 label')).toHaveValue('Année de création')
    expect(screen.getByLabelText('Stat 4 value')).toHaveValue('15')
    expect(screen.getByLabelText('Stat 4 label')).toHaveValue('Guides juridiques publiés')
    expect(screen.getByText('Main content').closest('div')).toHaveTextContent(/Voici le contenu principal de la page\./)
    expect(screen.getByLabelText('Topic 1 icon')).toHaveValue('📋')
    expect(screen.getByLabelText('Topic 1 title')).toHaveValue('Premier thème')
    expect(screen.getByLabelText('Topic 2 title')).toHaveValue('Deuxième thème')
    expect(screen.getByText('Content after topics').closest('div')).toHaveTextContent(/Du contenu après les thèmes\./)
    expect(screen.getByLabelText('FAQ 1 question')).toHaveValue('Première question ?')
    expect(screen.getByLabelText('FAQ 1 answer')).toHaveValue('Première réponse.')
    expect(screen.getByLabelText('FAQ 2 question')).toHaveValue('Deuxième question ?')
    expect(screen.getByText('Content after FAQ').closest('div')).toHaveTextContent(/Du contenu après la FAQ\./)
  })

  it('opening the page never marks it dirty (Save draft stays disabled)', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    renderEditor()
    await screen.findByLabelText('Stat 1 value')
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeDisabled()
  })

  it('editing one Stat value reassembles the body and changes ONLY that value — everything else round-trips byte-for-byte', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    cms.saveAdminDraft.mockResolvedValue(page())
    renderEditor()
    const field = await screen.findByLabelText('Stat 1 value')
    await userEvent.clear(field)
    await userEvent.type(field, '2018')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(cms.saveAdminDraft).toHaveBeenCalled())

    const sentBody = cms.saveAdminDraft.mock.calls[0][1].content.body
    expect(sentBody).toBe(REAL_BODY.replace('2017', '2018'))
    expect(cms.saveAdminDraft.mock.calls[0][1].content.badge).toBe('Services') // untouched
  })

  it('editing a FAQ answer reassembles the body and changes only that answer', async () => {
    cms.fetchAdminPage.mockResolvedValue(page())
    cms.saveAdminDraft.mockResolvedValue(page())
    renderEditor()
    const field = await screen.findByLabelText('FAQ 1 answer')
    await userEvent.clear(field)
    await userEvent.type(field, 'Nouvelle réponse.')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(cms.saveAdminDraft).toHaveBeenCalled())

    const sentBody = cms.saveAdminDraft.mock.calls[0][1].content.body
    expect(sentBody).toBe(REAL_BODY.replace('Première réponse.', 'Nouvelle réponse.'))
  })

  it('Guides pages (no Stats/Topics/FAQ in the design) keep the existing single Article body field, unchanged', async () => {
    cms.fetchAdminPage.mockResolvedValue({ ...page({ body: 'Un simple corps de page.' }, 'approbation-pv-cse'), section: 'guides' })
    renderEditor()
    await screen.findByLabelText('Page title')
    expect(screen.getByText('Article body')).toBeTruthy()
    expect(screen.queryByLabelText('Stat 1 value')).toBeNull()
    expect(screen.queryByText('Main content')).toBeNull()
  })
})
