// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { AllProviders } from '@/test/providers'
import AdminBlogs from './AdminBlogs'
import AdminBlogEditor from './AdminBlogEditor'
import * as blog from '@/services/blog'
import * as cms from '@/services/cms'

vi.mock('@/services/blog', () => ({
  fetchAdminBlogs: vi.fn(), fetchAdminBlog: vi.fn(), createAdminBlog: vi.fn(), saveAdminBlogDraft: vi.fn(), publishAdminBlog: vi.fn(),
  unpublishAdminBlog: vi.fn(), discardAdminBlogDraft: vi.fn(), deleteAdminBlog: vi.fn(),
}))
vi.mock('@/services/cms', async (orig) => ({ ...(await orig()), fetchMediaLibrary: vi.fn(), uploadMediaImage: vi.fn() }))

const working = (over = {}) => ({ title: 'Mon billet', excerpt: 'Résumé.', content: 'Texte', contentFormat: 'markdown', imageUrl: '', author: 'ATOOPV Team', featured: false, publishedAt: '2026-03-15T12:00:00.000Z', ...over })
const post = (over = {}, w = {}) => ({ id: 'p1', slug: 'mon-billet', status: 'draft', hasUnpublishedChanges: false, everPublished: false, rev: 1, working: working(w), live: null, ...over })

const editor = (route = '/app/admin/blog/p1') =>
  render(
    <AllProviders route={route}>
      <Routes>
        <Route path="/app/admin/blog" element={<AdminBlogs />} />
        <Route path="/app/admin/blog/new" element={<AdminBlogEditor />} />
        <Route path="/app/admin/blog/:id" element={<AdminBlogEditor />} />
      </Routes>
    </AllProviders>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  window.open = vi.fn(() => ({ location: {}, close: vi.fn() }))
})

describe('Admin → Blog list', () => {
  it('lists posts with their status, and offers View on the website only for published ones', async () => {
    blog.fetchAdminBlogs.mockResolvedValue([
      post({ id: 'a', slug: 'a', status: 'published' }, { title: 'En ligne' }),
      post({ id: 'b', slug: 'b', status: 'draft' }, { title: 'Brouillon' }),
      post({ id: 'c', slug: 'c', status: 'unpublished' }, { title: 'Retiré' }),
    ])
    editor('/app/admin/blog')
    expect(await screen.findByText('En ligne')).toBeTruthy()
    const rows = Object.fromEntries(screen.getAllByRole('listitem').map((li) => [li.querySelector('a').textContent, li]))
    expect(within(rows['En ligne']).getByText('Published')).toBeTruthy()
    expect(within(rows['Brouillon']).getByText('Draft')).toBeTruthy()
    expect(within(rows['Retiré']).getByText('Unpublished')).toBeTruthy()
    expect(within(rows['En ligne']).getByRole('link', { name: /View En ligne on the website/ }).getAttribute('href')).toBe('/blog/a')
    expect(within(rows['Brouillon']).queryByRole('link', { name: /on the website/ })).toBeNull()
    expect(screen.getByRole('link', { name: /New post/ }).getAttribute('href')).toBe('/app/admin/blog/new')
  })
})

describe('Admin → Blog editor', () => {
  it('offers exactly the agreed formatting for the text, and no design controls', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    editor()
    const bar = await screen.findByRole('toolbar', { name: 'Formatting' })
    const labels = [...bar.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')).filter(Boolean)
    expect(labels).toEqual(expect.arrayContaining(['Bold', 'Italic', 'Underline', 'Heading 2', 'Heading 3', 'Heading 4', 'Bullet list', 'Numbered list', 'Quote', 'Link']))
    for (const l of labels) expect(l).not.toMatch(/font|size|colou?r|align|strike|code/i)
  })

  it('creates a post as a draft from the title (the address comes from it), and never publishes on its own', async () => {
    blog.createAdminBlog.mockResolvedValue(post({ id: 'new1', slug: 'nouveau' }, { title: 'Nouveau' }))
    editor('/app/admin/blog/new')
    await userEvent.type(await screen.findByLabelText('Title'), 'Nouveau')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(blog.createAdminBlog).toHaveBeenCalled())
    expect(blog.createAdminBlog.mock.calls[0][0]).toMatchObject({ title: 'Nouveau', contentFormat: 'markdown', imageUrl: '' })
    expect(blog.publishAdminBlog).not.toHaveBeenCalled()
  })

  it('asks for a title before saving anything', async () => {
    editor('/app/admin/blog/new')
    await userEvent.click(await screen.findByRole('button', { name: /Save draft/ }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/title/)
    expect(blog.createAdminBlog).not.toHaveBeenCalled()
  })

  it('saves edits as a draft (with the revision) and says the live post is unchanged', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post({ status: 'published', everPublished: true, live: working() }))
    blog.saveAdminBlogDraft.mockResolvedValue(post({ status: 'published', everPublished: true, hasUnpublishedChanges: true, rev: 2 }, { title: 'Mon billet modifié' }))
    editor()
    const title = await screen.findByLabelText('Title')
    await userEvent.clear(title)
    await userEvent.type(title, 'Mon billet modifié')
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(blog.saveAdminBlogDraft).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'Mon billet modifié' }), 1))
    expect(blog.publishAdminBlog).not.toHaveBeenCalled()
    expect(await screen.findByText('Published · unpublished changes')).toBeTruthy()
  })

  it('publishes on request, and shows the server’s reason when the post is not complete', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    blog.publishAdminBlog.mockRejectedValue(Object.assign(new Error('x'), { status: 422, data: { error: 'Add a cover image before publishing.', code: 'PUBLISH_INCOMPLETE' } }))
    editor()
    await userEvent.click(await screen.findByRole('button', { name: /^Publish$/ }))
    expect((await screen.findByRole('alert')).textContent).toMatch(/Add a cover image before publishing/)
    blog.publishAdminBlog.mockResolvedValue(post({ status: 'published', everPublished: true }))
    await userEvent.click(screen.getByRole('button', { name: /^Publish$/ }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Publish$/ })).toBeNull())
    expect((await screen.findAllByText('Published')).length).toBeGreaterThanOrEqual(1)
  })

  it('preview opens the same public address in preview mode', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    const win = { location: {}, close: vi.fn() }
    window.open = vi.fn(() => win)
    editor()
    await userEvent.click(await screen.findByRole('button', { name: /Preview/ }))
    await waitFor(() => expect(win.location.href).toBe('/blog/mon-billet?preview=p1'))
  })

  it('an existing plain-text post is edited as plain text (its format is kept)', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post({}, { contentFormat: 'text', content: 'Ligne un\nLigne deux' }))
    editor()
    const box = await screen.findByLabelText('Post text')
    expect(box.tagName).toBe('TEXTAREA')
    expect(box.value).toBe('Ligne un\nLigne deux')
    expect(screen.queryByRole('toolbar', { name: 'Formatting' })).toBeNull()
  })

  it('offers only the safe actions: delete for a never-published post; unpublish / discard for a live one', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    const first = editor()
    expect(await screen.findByRole('button', { name: 'Delete post' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Unpublish' })).toBeNull()
    first.unmount()

    blog.fetchAdminBlog.mockResolvedValue(post({ status: 'published', everPublished: true, hasUnpublishedChanges: true, live: working() }))
    editor()
    expect(await screen.findByRole('button', { name: 'Unpublish' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Delete post' })).toBeNull()
  })

  it('asks before unpublishing, and only then calls the server', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post({ status: 'published', everPublished: true, live: working() }))
    blog.unpublishAdminBlog.mockResolvedValue(post({ status: 'unpublished', everPublished: true }))
    editor()
    await userEvent.click(await screen.findByRole('button', { name: 'Unpublish' }))
    expect(blog.unpublishAdminBlog).not.toHaveBeenCalled()
    await userEvent.click(within(await screen.findByText('Unpublish this post?').then((t) => t.closest('div').parentElement)).getByRole('button', { name: 'Unpublish' }))
    await waitFor(() => expect(blog.unpublishAdminBlog).toHaveBeenCalledWith('p1'))
  })

  it('chooses the cover image from the media library (or uploads one) — a library path is what gets saved', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    cms.fetchMediaLibrary.mockResolvedValue([{ id: 'm1', title: 'Couverture', filename: 'couverture.png', path: '/api/media/m1/couverture.png', alt: '' }])
    blog.saveAdminBlogDraft.mockResolvedValue(post({ rev: 2 }, { imageUrl: '/api/media/m1/couverture.png' }))
    editor()
    await userEvent.click(await screen.findByRole('button', { name: /Choose image/ }))
    await userEvent.click(await screen.findByRole('button', { name: 'Use Couverture' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /Save draft/ }))
    await waitFor(() => expect(blog.saveAdminBlogDraft).toHaveBeenCalledWith('p1', expect.objectContaining({ imageUrl: '/api/media/m1/couverture.png' }), 1))
  })

  it('uploading a new image in the picker uses it straight away', async () => {
    blog.fetchAdminBlog.mockResolvedValue(post())
    cms.fetchMediaLibrary.mockResolvedValue([])
    cms.uploadMediaImage.mockResolvedValue({ id: 'm2', path: '/api/media/m2/nouvelle.png' })
    editor()
    await userEvent.click(await screen.findByRole('button', { name: /Choose image/ }))
    await userEvent.upload(await screen.findByLabelText('Upload an image'), new File([new Uint8Array(10)], 'nouvelle.png', { type: 'image/png' }))
    await waitFor(() => expect(cms.uploadMediaImage).toHaveBeenCalled())
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('button', { name: /Change image/ })).toBeTruthy()
  })
})
