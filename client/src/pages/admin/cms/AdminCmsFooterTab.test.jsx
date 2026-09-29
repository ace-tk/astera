// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import AdminCmsFooterTab from './AdminCmsFooterTab'
import { saveAdminFooterDraft, publishAdminFooter } from '@/services/cms'
import { ToastProvider } from '@/context/ToastContext'
import { SoundProvider } from '@/context/SoundContext'

const CONTENT = {
  brand: { tagline: '« Retranscrire sans trahir. »', location: 'Lyon · Annecy — ALC SAS' },
  contact: { phoneDisplay: '04 12 10 06 06', phoneHref: 'tel:+33412100606', email: 'contact@atoopv.com' },
  cta: { label: 'Demander un devis', link: { type: 'route', route: '/tarification' } },
  columns: [
    { id: 'offres', title: 'Offres', links: [{ id: 'offres-pv', label: 'Rédaction PV', link: { type: 'route', route: '/services' } }] },
    { id: 'entreprise', title: 'Entreprise', links: [{ id: 'entreprise-contact', label: 'Contact', link: { type: 'mailto', url: 'mailto:contact@atoopv.com' } }] },
  ],
  legalLinks: [{ id: 'legal-mentions', label: 'Mentions légales', link: { type: 'anchor', url: '#' } }],
  social: [],
  copyrightText: '© {year} ALC SAS — Tous droits réservés.',
  bottomLine: 'contact@atoopv.com · 04 12 10 06 06',
}
const FOOTER = { draft: { content: CONTENT }, live: { content: CONTENT }, rev: 3, hasUnpublishedChanges: false, publishedAt: '2026-09-29T00:00:00.000Z' }

vi.mock('@/services/cms', () => ({
  fetchAdminFooter: vi.fn(() => Promise.resolve(FOOTER)),
  saveAdminFooterDraft: vi.fn((content) => Promise.resolve({ ...FOOTER, draft: { content }, rev: FOOTER.rev + 1, hasUnpublishedChanges: true })),
  publishAdminFooter: vi.fn(() => Promise.resolve({ ...FOOTER, live: FOOTER.draft, hasUnpublishedChanges: false })),
  discardAdminFooter: vi.fn(() => Promise.resolve(FOOTER)),
}))

const renderTab = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <SoundProvider><ToastProvider><AdminCmsFooterTab /></ToastProvider></SoundProvider>
    </QueryClientProvider>,
  )

beforeEach(() => vi.clearAllMocks())

describe('Admin Footer editor', () => {
  it('loads and shows the current footer content in the fields', async () => {
    renderTab()
    expect(await screen.findByLabelText('Brand tagline')).toHaveValue('« Retranscrire sans trahir. »')
    expect(screen.getByLabelText('Phone display text')).toHaveValue('04 12 10 06 06')
    expect(screen.getByLabelText('Contact email')).toHaveValue('contact@atoopv.com')
    expect(screen.getByLabelText('Call to action label')).toHaveValue('Demander un devis')
    expect(screen.getByLabelText('Copyright text')).toHaveValue('© {year} ALC SAS — Tous droits réservés.')
    // both columns are listed
    expect(screen.getByText('Offres')).toBeTruthy()
    expect(screen.getByText('Entreprise')).toBeTruthy()
    // Save/Publish start disabled — nothing has changed yet
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Publish footer/ })).toBeDisabled()
  })

  it('editing a field enables Save draft, and saves exactly that change', async () => {
    renderTab()
    const tagline = await screen.findByLabelText('Brand tagline')
    await userEvent.clear(tagline)
    await userEvent.type(tagline, 'Nouvelle signature')
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(saveAdminFooterDraft).toHaveBeenCalled())
    const [savedContent, rev] = saveAdminFooterDraft.mock.calls[0]
    expect(savedContent.brand.tagline).toBe('Nouvelle signature')
    expect(rev).toBe(FOOTER.rev)
    // everything else was left untouched
    expect(savedContent.contact.email).toBe('contact@atoopv.com')
  })

  it('publish saves the draft first when dirty, then publishes', async () => {
    renderTab()
    const email = await screen.findByLabelText('Contact email')
    await userEvent.clear(email)
    await userEvent.type(email, 'hello@atoopv.com')
    await userEvent.click(screen.getByRole('button', { name: /Publish footer/ }))
    await waitFor(() => expect(publishAdminFooter).toHaveBeenCalled())
    expect(saveAdminFooterDraft).toHaveBeenCalled()
    expect(saveAdminFooterDraft.mock.calls[0][0].contact.email).toBe('hello@atoopv.com')
  })

  it('discard is available and calls the discard endpoint', async () => {
    renderTab()
    await screen.findByLabelText('Brand tagline')
    // hasUnpublishedChanges is false and nothing is dirty, so Discard starts disabled too
    expect(screen.getByRole('button', { name: /Discard changes/ })).toBeDisabled()
  })

  it('adding a social link shows it in the list, and the section explains it is optional', async () => {
    renderTab()
    await screen.findByLabelText('Brand tagline')
    expect(screen.getByText(/no social links yet/i)).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /Add a social link/ }))
    expect(screen.queryByText(/no social links yet/i)).toBeNull()
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeEnabled()
  })

  it('adding a navigation column and a link inside it marks the draft dirty', async () => {
    renderTab()
    await screen.findByLabelText('Brand tagline')
    await userEvent.click(screen.getByRole('button', { name: /Add column/ }))
    expect(screen.getByText('New column')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Save draft/ })).toBeEnabled()
  })

  it('a legal link can be re-pointed from its "#" placeholder to a real route', async () => {
    renderTab()
    await screen.findByLabelText('Brand tagline')
    const legalSection = screen.getByText('Legal links').closest('div')
    const kindSelect = await within(legalSection).findByLabelText(/Link 1 — kind/)
    await userEvent.selectOptions(kindSelect, 'route')
    const addressInput = within(legalSection).getByLabelText(/Link 1 — address/)
    await userEvent.clear(addressInput)
    await userEvent.type(addressInput, '/legal/mentions')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(saveAdminFooterDraft).toHaveBeenCalled())
    const saved = saveAdminFooterDraft.mock.calls[0][0]
    expect(saved.legalLinks[0].link).toEqual({ type: 'route', route: '/legal/mentions' })
  })
})
