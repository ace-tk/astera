import { Editor } from '@tiptap/core'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { editorExtensions } from './editorExtensions'
import { groupUnderline } from './underline'

const parser = unified().use(remarkParse).use(remarkGfm)

/* ------------------------------ soft-break prep ---------------------------- */

/**
 * A single line break inside a paragraph (a "soft break") renders as one space
 * on the public site. The visual editor drops it when it sits next to a link or
 * bold/italic text — which would glue words together — so before loading into
 * the editor those breaks are written as the plain spaces they render as.
 * Hard breaks (two trailing spaces, or a backslash) are left alone.
 */
export function prepareForVisual(md) {
  if (!md || !md.includes('\n')) return md
  const tree = parser.parse(md)
  const edits = []
  const walk = (node, inQuote) => {
    if (node.type === 'paragraph' && !inQuote && node.position) {
      const { start, end } = node.position
      const slice = md.slice(start.offset, end.offset)
      if (slice.includes('\n')) {
        const lines = slice.split('\n')
        let out = lines[0]
        for (let i = 1; i < lines.length; i++) {
          const prev = out
          const hard = / {2,}$/.test(prev) || prev.endsWith('\\')
          out = hard ? `${prev}\n${lines[i]}` : `${prev.replace(/[ \t]+$/, '')} ${lines[i].replace(/^[ \t]+/, '')}`
        }
        if (out !== slice) edits.push({ from: start.offset, to: end.offset, text: out })
      }
    }
    node.children?.forEach((c) => walk(c, inQuote || node.type === 'blockquote'))
  }
  walk(tree, false)
  let result = md
  for (const e of edits.sort((a, b) => b.from - a.from)) result = result.slice(0, e.from) + e.text + result.slice(e.to)
  return result
}

/* ---------------------------------- shape ---------------------------------- */

const INLINE_HOLDERS = new Set(['paragraph', 'heading', 'tableCell'])

/** Flatten inline content into runs of text that share the same set of marks, so
 * `**[a](u)**` and `[**a**](u)` (identical on the page) compare equal. */
function inlineRuns(nodesIn) {
  const nodes = groupUnderline(nodesIn)
  const out = []
  const push = (run) => {
    const prev = out[out.length - 1]
    if (prev && run.v !== undefined && prev.v !== undefined && prev.m === run.m) prev.v += run.v
    else out.push(run)
  }
  const visit = (n, marks) => {
    switch (n.type) {
      case 'text': push({ v: n.value.replace(/\s+/g, ' '), m: [...marks].sort().join('|') }); break
      case 'inlineCode': push({ v: n.value, m: [...marks, 'code'].sort().join('|') }); break
      case 'strong': case 'emphasis': case 'delete': case 'underline': groupUnderline(n.children).forEach((c) => visit(c, [...marks, n.type])); break
      case 'link': groupUnderline(n.children).forEach((c) => visit(c, [...marks, `link:${n.url}`])); break
      case 'break': out.push({ br: 1 }); break
      case 'image': out.push({ img: n.url, alt: n.alt || '' }); break
      default: out.push({ other: n.type })
    }
  }
  nodes.forEach((n) => visit(n, []))
  return out
}

function simplify(node) {
  const out = { t: node.type }
  if (node.depth) out.d = node.depth
  if (node.type === 'list') out.o = Boolean(node.ordered)
  if (node.children) {
    out.c = INLINE_HOLDERS.has(node.type) ? inlineRuns(node.children) : node.children.map(simplify)
  }
  return out
}

export const markdownShape = (md) => JSON.stringify(simplify(parser.parse(md)))

/** Load Markdown into the visual editor and read it straight back out. */
export function roundTrip(md) {
  const editor = new Editor({ element: document.createElement('div'), extensions: editorExtensions(), content: prepareForVisual(md) })
  try {
    return editor.storage.markdown.getMarkdown()
  } finally {
    editor.destroy()
  }
}

/**
 * Can the visual editor represent this Markdown without changing what appears on
 * the page? If not (tables, horizontal rules, …) the page opens in Markdown mode
 * instead, so content is never silently reformatted.
 */
export function isRoundTripSafe(md) {
  if (!md || !md.trim()) return true
  try {
    return markdownShape(md) === markdownShape(roundTrip(md))
  } catch {
    return false
  }
}
