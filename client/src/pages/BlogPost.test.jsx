// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { AllProviders } from '@/test/providers'
import BlogPost from './BlogPost'
import * as blog from '@/services/blog'
import { resolveMediaUrl } from '@/cms/media'

vi.mock('@/constants/resourcesLinks', () => ({ resolveResourceHref: (h) => ({ href: h, external: /^https?:/.test(h) }) }))
vi.mock('@/services/cms', async (orig) => ({ ...(await orig()), fetchNavigation: () => Promise.reject(new Error('offline')) }))
vi.mock('@/services/blog', () => ({ fetchBlogBySlug: vi.fn(), fetchBlogPreview: vi.fn(), fetchFeaturedBlog: vi.fn() }))

const base = { id: '1', slug: 'post', title: 'Titre du billet', excerpt: 'Le résumé.', imageUrl: 'https://images.example.com/a.jpg', author: 'ATOOPV Team', publishedAt: '2026-02-03T10:00:00.000Z' }
const page = (route) => render(<AllProviders route={route}><Routes><Route path="/blog/:slug" element={<BlogPost />} /></Routes></AllProviders>)

beforeEach(() => vi.clearAllMocks())

describe('Blog page', () => {
  it('shows an existing plain-text post exactly as before: text kept literally, line breaks preserved', async () => {
    blog.fetchBlogBySlug.mockResolvedValue({ ...base, contentFormat: 'text', content: 'Ligne un\nLigne <deux> & **trois**' })
    const { container } = page('/blog/post')
    await screen.findByText('Titre du billet')
    const body = container.querySelector('.whitespace-pre-wrap')
    expect(body.textContent).toBe('Ligne un\nLigne <deux> & **trois**')
    expect(container.querySelector('.markdown-article')).toBeNull()
  })

  it('renders a post written in the Admin editor with the site’s article typography (bold, italic, underline, headings, lists, quote, link)', async () => {
    blog.fetchBlogBySlug.mockResolvedValue({ ...base, contentFormat: 'markdown', content: '## Un titre\n\nDu **gras**, de l’*italique*, un mot <u>souligné</u> et [un lien](https://example.com).\n\n- une\n- deux\n\n1. un\n2. deux\n\n> Une citation.' })
    const { container } = page('/blog/post')
    await screen.findByText('Un titre')
    const md = container.querySelector('.markdown-article')
    expect(md.querySelector('h2').textContent).toBe('Un titre')
    expect(md.querySelector('strong').textContent).toBe('gras')
    expect(md.querySelector('em').textContent).toBe('italique')
    expect(md.querySelector('u').textContent).toBe('souligné')
    expect(md.querySelectorAll('ul li')).toHaveLength(2)
    expect(md.querySelectorAll('ol li')).toHaveLength(2)
    expect(md.querySelector('blockquote').textContent.trim()).toBe('Une citation.')
    expect(md.querySelector('a[href="https://example.com"]')).toBeTruthy()
    expect(container.textContent).not.toMatch(/<\/?u>|\*\*/)
    expect(container.querySelector('.whitespace-pre-wrap')).toBeNull()
  })

  it('never renders raw HTML from a post', async () => {
    blog.fetchBlogBySlug.mockResolvedValue({ ...base, contentFormat: 'markdown', content: 'Texte <script>window.hacked=1</script> <b>x</b>' })
    const { container } = page('/blog/post')
    await screen.findByText('Titre du billet')
    expect(container.querySelector('article script, article b')).toBeNull()
    expect(window.hacked).toBeUndefined()
  })

  it('preview (?preview=id) shows the working copy in the same design with a notice, and only calls the admin preview', async () => {
    blog.fetchBlogPreview.mockResolvedValue({ ...base, title: 'Brouillon', contentFormat: 'markdown', content: 'Texte **brouillon**', preview: true })
    page('/blog/post?preview=abc123')
    expect(await screen.findByText('Brouillon')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toMatch(/Preview — this is an unpublished draft/)
    expect(blog.fetchBlogPreview).toHaveBeenCalledWith('abc123')
    expect(blog.fetchBlogBySlug).not.toHaveBeenCalled()
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"][content="noindex, nofollow"]')).toBeTruthy())
  })

  it('a normal visit has no preview notice and never asks for the admin preview', async () => {
    blog.fetchBlogBySlug.mockResolvedValue({ ...base, contentFormat: 'text', content: 'x' })
    page('/blog/post')
    await screen.findByText('Titre du billet')
    expect(screen.queryByText(/Preview — this is an unpublished draft/)).toBeNull()
    expect(blog.fetchBlogPreview).not.toHaveBeenCalled()
  })

  it('an unpublished or unknown post shows the existing "couldn’t be found" message', async () => {
    blog.fetchBlogBySlug.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    page('/blog/post')
    expect(await screen.findByText('This post couldn’t be found.')).toBeTruthy()
  })
})

describe('resolveMediaUrl', () => {
  it('points library images at the API origin and leaves every other address alone', () => {
    expect(resolveMediaUrl('/api/media/64b0c0ffee64b0c0ffee64b0/cover.png')).toMatch(/^https?:\/\/[^/]+\/api\/media\/64b0c0ffee64b0c0ffee64b0\/cover\.png$/)
    expect(resolveMediaUrl('https://images.example.com/a.jpg')).toBe('https://images.example.com/a.jpg')
    expect(resolveMediaUrl('')).toBe('')
    expect(resolveMediaUrl(undefined)).toBeUndefined()
  })
})
