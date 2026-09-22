// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { render } from '@testing-library/react'
import { inlineFormat } from './inlineFormat'
import { extractFaq } from '@/utils/formationContent'
import { parseContentFile } from '@/utils/contentMarkdown'
import FAQSection from '@/components/services/FAQSection'
import { isRoundTripSafe, roundTrip } from './markdownRoundTrip'

// The article link resolver pulls in the whole bundled content library (raw .md imports).
vi.mock('@/constants/resourcesLinks', () => ({ resolveResourceHref: (href) => href }))

const CONTENT = path.resolve(__dirname, '../../../content')
const html = (text) => {
  const nodes = inlineFormat(text)
  if (!nodes) return null
  const { container } = render(<p>{nodes}</p>)
  return container.firstChild.innerHTML
}

describe('inlineFormat (FAQ answers)', () => {
  it('shows bold, italic and underline, alone and combined', () => {
    expect(html('Un <u>mot</u> souligné.')).toBe('Un <u class="underline decoration-1 underline-offset-4">mot</u> souligné.')
    expect(html('Du **gras** et de l’*italique*.')).toBe('Du <strong class="font-semibold text-ink">gras</strong> et de l’<em>italique</em>.')
    expect(html('<u>**gras souligné**</u>')).toBe('<u class="underline decoration-1 underline-offset-4"><strong class="font-semibold text-ink">gras souligné</strong></u>')
    expect(html('**<u>souligné gras</u>** puis *<u>italique souligné</u>*')).toContain('<u class="underline decoration-1 underline-offset-4">souligné gras</u>')
  })

  it('leaves text without formatting characters untouched (returns null → shown exactly as before)', () => {
    for (const t of ['Oui, le PV est obligatoire.', 'Délai : 48 à 72 h — sous 5 jours.', "L'employeur doit l'établir."]) expect(inlineFormat(t)).toBeNull()
  })

  it('never renders anything beyond bold / italic / underline — other Markdown or HTML is shown as plain text', () => {
    for (const t of [
      '[un lien](https://exemple.fr) et **gras**',
      'du `code` et **gras**',
      '# titre **gras**',
      '- puce **gras**',
      '> citation **gras**',
      '![img](x.png) **gras**',
      'a <b>b</b> **gras**',
      '<script>alert(1)</script> **gras**',
      'a <u class="x">b</u>',
      'un <span style="color:red">mot</span>',
    ]) {
      expect(inlineFormat(t), t).toBeNull()
    }
  })

  it('does not treat stray or unbalanced tags as formatting', () => {
    expect(html('un <u>mot non fermé')).toBeNull() // the stray tag is an unsupported node → plain text
  })
})

describe('FAQ extraction and rendering', () => {
  const body = [
    'Intro.',
    '',
    'Cliquez sur une question pour afficher la réponse.',
    '',
    'Le PV est-il <u>obligatoire</u> ?',
    '',
    'Oui, il est **obligatoire** et <u>doit être approuvé</u> par *les élus*.',
    '',
    'Qui le rédige ?',
    '',
    'Un tiers, sans <u>enjeu</u> dans les débats.',
  ].join('\n')

  it('keeps underline (and bold / italic) in answers, and drops the tags from question titles', () => {
    const faq = extractFaq(body)
    expect(faq.items.map((i) => i.question)).toEqual(['Le PV est-il obligatoire ?', 'Qui le rédige ?'])
    expect(faq.items[0].answer).toBe('Oui, il est **obligatoire** et <u>doit être approuvé</u> par *les élus*.')
    expect(faq.items[1].answer).toBe('Un tiers, sans <u>enjeu</u> dans les débats.')
  })

  it('renders the formatting inside the open answer with the FAQ’s own paragraph styling', () => {
    const { container } = render(<FAQSection items={extractFaq(body).items} richAnswers />)
    const answer = container.querySelector('p.text-muted')
    expect(answer.className).toBe('pr-8 pt-3 text-sm leading-relaxed text-muted text-pretty')
    expect([...answer.querySelectorAll('u')].map((u) => u.textContent)).toEqual(['doit être approuvé'])
    expect(answer.querySelector('strong').textContent).toBe('obligatoire')
    expect(answer.querySelector('em').textContent).toBe('les élus')
    expect(answer.textContent).toBe('Oui, il est obligatoire et doit être approuvé par les élus.')
    expect(container.textContent).not.toMatch(/<\/?u>|\*\*/)
  })

  it('other FAQ callers (no richAnswers) keep showing their text exactly as given', () => {
    const { container } = render(<FAQSection items={[{ question: 'Q ?', answer: 'Réponse avec **astérisques** littéraux.' }, { question: 'Q2 ?', answer: 'B' }]} />)
    expect(container.querySelector('p.text-muted').innerHTML).toBe('Réponse avec **astérisques** littéraux.')
  })

  it('every EXISTING FAQ answer in the bundled content is shown exactly as before (no formatting characters)', () => {
    let items = 0
    for (const cat of fs.readdirSync(CONTENT)) {
      const dir = path.join(CONTENT, cat)
      if (!fs.statSync(dir).isDirectory()) continue
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
        const faq = extractFaq(parseContentFile(fs.readFileSync(path.join(dir, f), 'utf8'), f, 'S').body)
        for (const it of faq?.items || []) {
          items += 1
          expect(inlineFormat(it.answer), `${cat}/${f}: ${it.answer.slice(0, 60)}`).toBeNull()
        }
      }
    }
    expect(items).toBeGreaterThanOrEqual(30)
  })

  it('an FAQ written with bold / italic / underline survives the visual editor round trip', () => {
    expect(isRoundTripSafe(body)).toBe(true)
    const again = roundTrip(body)
    expect(extractFaq(again).items).toEqual(extractFaq(body).items)
  })
})
