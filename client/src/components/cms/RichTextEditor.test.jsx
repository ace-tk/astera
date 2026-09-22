// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, waitFor, screen } from '@testing-library/react'
import RichTextEditor from './RichTextEditor'

// Content with the shapes that the editor normalises on load (soft line breaks
// between links, marquee-style lines) — real content from existing pages.
const REAL_BODY = [
  '[Demander un devis gratuit →](/tarification/)',
  '[Tous nos services](/nos-services-pv/)',
  '',
  'CSE',
  '✦',
  'CSEC',
  '',
  '# Un titre',
  '',
  'Du **texte** normal.',
].join('\n')

describe('RichTextEditor', () => {
  it('does not report a change (or rewrite the stored Markdown) just because it was opened', async () => {
    const onChange = vi.fn()
    render(<RichTextEditor value={REAL_BODY} onChange={onChange} />)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Article body' })).toBeTruthy())
    await new Promise((r) => setTimeout(r, 200))
    // Either never called, or only ever called with the exact original string.
    for (const [value] of onChange.mock.calls) expect(value).toBe(REAL_BODY)
  })

  it('opens in Markdown mode (not visual) for content it cannot hold exactly', async () => {
    const onChange = vi.fn()
    render(<RichTextEditor value={'| a | b |\n| - | - |\n| 1 | 2 |'} onChange={onChange} />)
    expect(await screen.findByLabelText('Article body (Markdown)')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toMatch(/Markdown mode/)
  })

  it('offers exactly bold, italic, underline, headings, lists, quote and link — no styling controls', async () => {
    render(<RichTextEditor value="" onChange={() => {}} />)
    const bar = await screen.findByRole('toolbar', { name: 'Formatting' })
    const labels = [...bar.querySelectorAll('button')].map((b) => b.getAttribute('aria-label')).filter(Boolean)
    expect(labels).toEqual(expect.arrayContaining(['Bold', 'Italic', 'Underline', 'Heading 2', 'Heading 3', 'Heading 4', 'Bullet list', 'Numbered list', 'Quote', 'Link']))
    for (const label of labels) expect(label).not.toMatch(/font|size|colou?r|align|highlight|strike|code/i)
  })
})
