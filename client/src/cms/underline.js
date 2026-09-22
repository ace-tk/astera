/*
 * Underline has no Markdown syntax, so the CMS stores it as `<u>…</u>`, the only raw HTML it
 * accepts (the server enforces this, see server/src/cms/markdown.js). These helpers turn that
 * pair of inline-HTML nodes into one `underline` node, so:
 *   • the public renderer (MarkdownArticle) can draw it with the site's own typography, and
 *   • the editor's round-trip check can compare it like any other formatting.
 */

/** Groups `<u>` … `</u>` sibling html nodes into one `underline` node. Unbalanced tags are left untouched. */
export function groupUnderline(children) {
  const out = []
  let open = null
  for (const child of children) {
    if (child.type === 'html' && child.value === '<u>' && !open) {
      open = { tag: child, children: [] }
    } else if (child.type === 'html' && child.value === '</u>' && open) {
      out.push({ type: 'underline', data: { hName: 'u' }, children: open.children })
      open = null
    } else {
      ;(open ? open.children : out).push(child)
    }
  }
  if (open) out.push(open.tag, ...open.children) // never closed: leave as it was
  return out
}

/** remark plugin: `<u>…</u>` becomes a real `<u>` element (styled by MarkdownArticle's `u` component). */
export function remarkUnderline() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return
      node.children = groupUnderline(node.children)
      node.children.forEach(walk)
    }
    walk(tree)
  }
}
