import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { groupUnderline } from './underline'

/*
 * FAQ answers are single lines of text on the page (not a full article body), so they are
 * shown through this tiny renderer instead of the article renderer. It understands ONLY the
 * safe inline formatting the CMS editor can produce — bold, italic and underline — and
 * nothing else can appear: any other Markdown (links, code, images, lists, headings, HTML)
 * makes it step aside, and the text is shown exactly as it always was.
 */
const parser = unified().use(remarkParse)

// Text without any of these characters cannot carry formatting: it is left untouched.
const MAY_FORMAT = /[*_<\\&]/

/** React nodes for `text`, or `null` when it should simply be shown as plain text. */
export function inlineFormat(text) {
  if (typeof text !== 'string' || !MAY_FORMAT.test(text)) return null
  const tree = parser.parse(text)
  if (tree.children.length !== 1 || tree.children[0].type !== 'paragraph') return null

  let plain = false
  const render = (nodes, prefix) =>
    groupUnderline(nodes).map((n, i) => {
      const key = `${prefix}${i}`
      switch (n.type) {
        case 'text':
          return n.value
        case 'strong':
          return <strong key={key} className="font-semibold text-ink">{render(n.children, `${key}.`)}</strong>
        case 'emphasis':
          return <em key={key}>{render(n.children, `${key}.`)}</em>
        case 'underline':
          return <u key={key} className="underline decoration-1 underline-offset-4">{render(n.children, `${key}.`)}</u>
        default:
          plain = true
          return null
      }
    })

  const out = render(tree.children[0].children, '')
  return plain ? null : out
}
