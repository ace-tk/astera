// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { Editor } from '@tiptap/core'
import { isRoundTripSafe, roundTrip, markdownShape, prepareForVisual } from './markdownRoundTrip'
import { editorExtensions } from './editorExtensions'

const CONTENT = path.resolve(__dirname, '../../../content')

describe('visual editor round trip', () => {
  it('preserves everything the toolbar can produce', () => {
    const md = [
      '## Titre',
      '',
      'Du **gras**, de l’*italique*, un [lien](/services/x) et un [autre](https://example.com).',
      '',
      '### Sous-titre',
      '',
      '- un',
      '- deux',
      '',
      '1. premier',
      '2. second',
      '',
      '> Une citation.',
      '',
      '#### Petit titre',
      '',
      'Fin.',
    ].join('\n')
    expect(markdownShape(roundTrip(md))).toBe(markdownShape(md))
    expect(isRoundTripSafe(md)).toBe(true)
  })

  it('keeps underline (<u>…</u>) intact, alone and combined with bold, italic, links, headings and lists', () => {
    for (const md of [
      'Un mot <u>souligné</u> dans une phrase.',
      '<u>Toute la phrase soulignée</u> puis la suite.',
      'Du <u>**gras souligné**</u> et du <u>*italique souligné*</u>.',
      'Un [<u>lien souligné</u>](/services/x) et du texte.',
      '## Un titre <u>souligné</u>',
      '- élément <u>souligné</u>\n- autre élément',
      '> Citation <u>soulignée</u>.',
    ]) {
      expect(isRoundTripSafe(md), md).toBe(true)
    }
    expect(roundTrip('Un mot <u>souligné</u> ici.')).toBe('Un mot <u>souligné</u> ici.')
  })

  it('writes underline as <u>…</u> when the underline command is applied, and removes it again', () => {
    const editor = new Editor({ element: document.createElement('div'), extensions: editorExtensions(), content: 'Un mot ici.' })
    try {
      editor.chain().setTextSelection({ from: 4, to: 7 }).toggleUnderline().run() // "mot"
      expect(editor.storage.markdown.getMarkdown()).toBe('Un <u>mot</u> ici.')
      editor.chain().setTextSelection({ from: 4, to: 7 }).toggleUnderline().run()
      expect(editor.storage.markdown.getMarkdown()).toBe('Un mot ici.')
    } finally {
      editor.destroy()
    }
    // The shape check treats underline as formatting: removing it changes the shape.
    expect(markdownShape('a <u>b</u> c')).not.toBe(markdownShape('a b c'))
  })

  it('opens unbalanced or foreign HTML in Markdown mode rather than rewriting it', () => {
    expect(isRoundTripSafe('un <u>mot non fermé')).toBe(false)
    expect(isRoundTripSafe('un <span>mot</span>')).toBe(false)
  })

  it('flags content the editor cannot represent, so it opens in Markdown mode instead', () => {
    expect(isRoundTripSafe('| a | b |\n| - | - |\n| 1 | 2 |')).toBe(false)
    expect(isRoundTripSafe('avant\n\n---\n\naprès')).toBe(false)
  })

  it('does not glue words together across a soft line break next to a link or bold text', () => {
    expect(roundTrip('[a](/x)\n[b](/y)')).toBe('[a](/x) [b](/y)')
    expect(roundTrip('**a**\n[b](/y)')).toBe('**a** [b](/y)')
    expect(isRoundTripSafe('[a](/x)\n[b](/y)')).toBe(true)
    // hard breaks are preserved
    expect(prepareForVisual('a  \nb')).toBe('a  \nb')
    expect(prepareForVisual('- item\n- item2')).toBe('- item\n- item2')
    expect(prepareForVisual('## T\n\ntext one\ntext two')).toBe('## T\n\ntext one text two')
  })

  it('keeps images and level-1 headings that already exist in pages', () => {
    expect(isRoundTripSafe('![alt](https://example.com/a.png)')).toBe(true)
    expect(isRoundTripSafe('# Un titre\n\ntexte')).toBe(true)
  })

  it('treats bold-around-link and link-around-bold as the same thing', () => {
    expect(isRoundTripSafe('**[lien](/x)**')).toBe(true)
  })

  it('treats empty content as safe', () => {
    expect(isRoundTripSafe('')).toBe(true)
  })

  it('reports how much of the EXISTING content the visual editor can hold losslessly', () => {
    const results = []
    for (const dir of ['drafting', 'by-city', 'tarifs-infos', 'training', 'communication', 'guides']) {
      for (const f of fs.readdirSync(path.join(CONTENT, dir))) {
        if (!f.endsWith('.md')) continue
        // Same body the CMS stores: everything after the metadata header.
        const raw = fs.readFileSync(path.join(CONTENT, dir, f), 'utf8')
        const body = raw.split(/\n\n- Source URL:.*\n- Category:.*\n- Breadcrumb:.*\n\n/)[1] ?? raw
        results.push({ f: `${dir}/${f}`, safe: isRoundTripSafe(body) })
      }
    }
    const safe = results.filter((r) => r.safe).length
    console.log(`Visual-editor round trip: ${safe}/${results.length} existing service pages are lossless; ${results.length - safe} open in Markdown mode.`)
    console.log('Markdown-mode pages:', results.filter((r) => !r.safe).map((r) => r.f).join(', '))
    expect(results.length).toBeGreaterThan(40)
  })
})
