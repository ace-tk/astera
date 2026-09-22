// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminCmsPageNew from './AdminCmsPageNew'
import { createAdminPage } from '@/services/cms'
import { SoundProvider } from '@/context/SoundContext'

// What the server's /templates endpoint returns (shape of describeTemplate): two approved templates, seven sections.
const fields = [
  { key: 'badge', type: 'text', label: 'Hero label', maxLength: 120 },
  { key: 'body', type: 'richtext', label: 'Article body', maxLength: 1000 },
]
const TEMPLATES = [
  {
    key: 'service-article', name: 'Service Article', description: 'technical description', creatable: true, fields,
    defaults: { badge: 'Services', body: '' }, tagOptions: [], pathPattern: '/services/:section/:slug',
    sections: [
      { key: 'drafting', label: 'Rédaction PV', menu: 'Procès-verbal' }, { key: 'by-city', label: 'Par ville', menu: 'Procès-verbal' },
      { key: 'tarifs-infos', label: 'Tarifs & Infos', menu: 'Procès-verbal' }, { key: 'training', label: 'Formations', menu: 'Formations' },
      { key: 'communication', label: 'Communication', menu: 'Formations' }, { key: 'guides', label: 'Guides pratiques', menu: 'Ressources' },
    ],
  },
  {
    key: 'ressources-article', name: 'Ressources Article', description: 'technical description', creatable: true, fields,
    defaults: { badge: 'Ressources', body: '' }, tagOptions: [], pathPattern: '/atoopv/ressources/:slug',
    sections: [{ key: 'ressources', label: 'Ressources', menu: 'Ressources' }],
  },
]
const grp = (id, heading) => ({ id, heading, entries: [] })
const MENU = {
  draft: { items: [
    { id: 'pv', label: 'Procès-verbal', kind: 'mega', enabled: true, groups: [grp('nos-formules', 'Nos formules')] },
    { id: 'formations', label: 'Formations', kind: 'mega', enabled: true, groups: [grp('formations-des-elus', 'Formations des élus')] },
    { id: 'ressources', label: 'Ressources', kind: 'mega', enabled: true, groups: [grp('guides', 'Guides')] },
  ] },
  live: { items: [] },
}

vi.mock('@/services/cms', () => ({
  fetchTemplates: vi.fn(() => Promise.resolve(TEMPLATES)),
  fetchAdminMenu: vi.fn(() => Promise.resolve(MENU)),
  createAdminPage: vi.fn(() => Promise.resolve({ id: 'a'.repeat(24) })),
}))

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SoundProvider><MemoryRouter><AdminCmsPageNew /></MemoryRouter></SoundProvider>
    </QueryClientProvider>,
  )

beforeEach(() => vi.clearAllMocks())

describe('Add page — the section decides the design', () => {
  it('lists the seven existing sections grouped by their menu, and never mentions templates or custom designs', async () => {
    renderForm()
    const radios = await screen.findAllByRole('radio')
    expect(radios.map((r) => r.textContent.split('/')[0])).toEqual(['Rédaction PV', 'Par ville', 'Tarifs & Infos', 'Formations', 'Communication', 'Guides pratiques', 'Ressources'])
    const groups = [...document.querySelectorAll('[role="radiogroup"] p')].map((p) => p.textContent)
    expect(groups).toEqual(['Procès-verbal', 'Formations', 'Ressources'])
    const text = document.body.textContent
    expect(text).not.toMatch(/Service Article|Ressources Article|technical description|custom|page builder|new layout/i)
    expect(text).not.toMatch(/template/i)
  })

  it('starts the hero label exactly as on the existing pages of the chosen section', async () => {
    renderForm()
    await userEvent.click(await screen.findByRole('radio', { name: /^Formations/ }))
    expect(screen.getByLabelText('Hero label').value).toBe('Services')
    await userEvent.click(screen.getByRole('radio', { name: /^Ressources/ }))
    expect(screen.getByLabelText('Hero label').value).toBe('Ressources')
  })

  it('finds the template by itself: the request carries the section and its template, nothing the admin chose', async () => {
    renderForm()
    await userEvent.click(await screen.findByRole('radio', { name: /^Formations/ }))
    fireEvent.change(screen.getByPlaceholderText(/Formation aux nouvelles obligations/), { target: { value: 'Ma formation' } })
    expect(screen.getByText('/services/training/ma-formation')).toBeTruthy()
    // the menu (Formations) is only suggested; a page can also stay out of the main menu
    fireEvent.change(screen.getByLabelText('Main menu'), { target: { value: '' } })
    await userEvent.click(screen.getByRole('button', { name: 'Create draft page' }))
    await waitFor(() => expect(createAdminPage).toHaveBeenCalled())
    expect(createAdminPage.mock.calls[0][0]).toMatchObject({ templateKey: 'service-article', section: 'training', title: 'Ma formation', slug: 'ma-formation', content: { badge: 'Services' } })
    expect(createAdminPage.mock.calls[0][0].menu).toBeUndefined()
  })

  it('a Ressources page is sent with the Ressources template and its own address', async () => {
    renderForm()
    await userEvent.click(await screen.findByRole('radio', { name: /^Ressources/ }))
    fireEvent.change(screen.getByPlaceholderText(/Formation aux nouvelles obligations/), { target: { value: 'Un article' } })
    expect(screen.getByText('/atoopv/ressources/un-article')).toBeTruthy()
    // the menu placement is suggested from the section
    expect(within(screen.getByLabelText('Main menu')).getAllByRole('option').find((o) => o.selected).textContent).toBe('Ressources')
    fireEvent.change(screen.getByLabelText('Menu group'), { target: { value: 'guides' } })
    await userEvent.click(screen.getByRole('button', { name: 'Create draft page' }))
    await waitFor(() => expect(createAdminPage).toHaveBeenCalled())
    expect(createAdminPage.mock.calls[0][0]).toMatchObject({ templateKey: 'ressources-article', section: 'ressources', menu: { menuId: 'ressources', groupId: 'guides' } })
  })
})
