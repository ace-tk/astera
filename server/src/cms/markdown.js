import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

/**
 * Rich text in the CMS is stored as Markdown (the same format the public site
 * already renders with its own AtoopV typography), so the ONLY way an admin can
 * influence presentation is through this whitelist of structural nodes. Raw
 * HTML, code blocks, footnotes and so on are rejected — there is no way to
 * inject styles, classes, scripts, or arbitrary layout.
 *
 * The whitelist covers what the editor toolbar can produce (bold, italic,
 * underline, headings, lists, links, quotes) plus the constructs already present
 * in the existing published content (images, tables, rules, inline code) so
 * imported pages validate without being altered.
 *
 * Underline has no Markdown syntax, so it is stored as `<u>…</u>`. That is the ONLY
 * raw HTML accepted: exactly those two tags (no attributes, no other tags), balanced
 * inside a single paragraph / heading / table cell / link / emphasis. Anything else
 * that looks like HTML is rejected, as before.
 */
const ALLOWED_NODES = new Set([
  'root', 'paragraph', 'text', 'heading', 'emphasis', 'strong', 'delete',
  'list', 'listItem', 'link', 'blockquote', 'image', 'thematicBreak',
  'inlineCode', 'break', 'table', 'tableRow', 'tableCell',
])

// Where inline HTML (i.e. `<u>`) may appear: inside a line of text, never as a block of its own.
const INLINE_PARENTS = new Set(['paragraph', 'heading', 'tableCell', 'link', 'emphasis', 'strong', 'delete'])

const MAX_HEADING_DEPTH = 4
const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\?)/i

const parser = unified().use(remarkParse).use(remarkGfm)

export function parseMarkdown(md) {
  return parser.parse(md)
}

/** The only raw HTML the CMS accepts: a balanced, attribute-free `<u>…</u>` inside a line of text. */
function underlineErrors(parent) {
  const errors = []
  let open = null
  for (const child of parent.children || []) {
    if (child.type !== 'html') continue
    const line = child.position?.start?.line
    if (!INLINE_PARENTS.has(parent.type) || (child.value !== '<u>' && child.value !== '</u>')) {
      errors.push({ line, message: 'Raw HTML is not allowed (underline is the only exception, and it is applied with the editor button)' })
    } else if (child.value === '<u>') {
      if (open) errors.push({ line, message: 'Underline cannot be nested' })
      open = child
    } else if (!open) {
      errors.push({ line, message: 'Underline is closed but was never opened' })
    } else {
      open = null
    }
  }
  if (open) errors.push({ line: open.position?.start?.line, message: 'Underline is opened but never closed' })
  return errors
}

/**
 * @returns {{ ok: boolean, errors: {message: string, line?: number}[], nodeTypes: Set<string> }}
 */
export function validateMarkdown(md) {
  const errors = []
  const nodeTypes = new Set()
  if (typeof md !== 'string') return { ok: false, errors: [{ message: 'Body must be a string' }], nodeTypes }

  const tree = parseMarkdown(md)
  const walk = (node) => {
    nodeTypes.add(node.type)
    const line = node.position?.start?.line
    if (node.type === 'html') {
      // judged with its siblings, by the parent (see underlineErrors)
    } else if (!ALLOWED_NODES.has(node.type)) {
      errors.push({ line, message: `Formatting not allowed: "${node.type}"` })
    }
    if (node.children) errors.push(...underlineErrors(node))
    if (node.type === 'heading' && node.depth > MAX_HEADING_DEPTH) {
      errors.push({ line, message: `Headings deeper than level ${MAX_HEADING_DEPTH} are not allowed` })
    }
    if ((node.type === 'link' || node.type === 'image') && node.url && !SAFE_URL.test(node.url.trim())) {
      errors.push({ line, message: `Unsafe or unsupported link address: "${node.url.slice(0, 60)}"` })
    }
    node.children?.forEach(walk)
  }
  walk(tree)
  return { ok: errors.length === 0, errors, nodeTypes }
}
