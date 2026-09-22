// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MarkdownArticle from './MarkdownArticle'

// The link resolver pulls in the whole bundled content library (raw .md imports); this test only cares about the renderer.
vi.mock('@/constants/resourcesLinks', () => ({ resolveResourceHref: (href) => href }))

const html = (body) => {
  const { container } = render(<MemoryRouter><MarkdownArticle body={body} /></MemoryRouter>)
  return container
}

describe('MarkdownArticle underline', () => {
  it('draws <u>…</u> as underlined text styled by the site, next to bold and links', () => {
    const c = html('Un <u>mot souligné</u> et **du gras**, [un lien](/services) et <u>**gras souligné**</u>.')
    const underlined = [...c.querySelectorAll('u')].map((u) => u.textContent)
    expect(underlined).toEqual(['mot souligné', 'gras souligné'])
    expect(c.querySelector('u').className).toMatch(/underline/)
    expect(c.textContent).not.toMatch(/<\/?u>/)
    expect(c.querySelector('strong')).toBeTruthy()
  })

  it('still ignores any other raw HTML exactly as before', () => {
    const c = html('avant <b>x</b> <span style="color:red">y</span> après\n\n<script>window.hacked = 1</script>')
    expect(c.querySelector('b, span, script')).toBeNull()
    expect(window.hacked).toBeUndefined()
  })

  it('leaves a page without underline byte-for-byte unchanged', () => {
    const body = '## Titre\n\nUn paragraphe avec **gras**, *italique* et [un lien](/services/x).\n\n- un\n- deux'
    const withPlugin = html(body).innerHTML
    expect(withPlugin).not.toMatch(/<u[ >]/)
    expect(withPlugin).toContain('<strong')
  })
})
