import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { Markdown } from 'tiptap-markdown'

/** Link addresses the CMS accepts (mirrors the server's whitelist in server/src/cms/markdown.js). */
export const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\?)/i

/**
 * The rich-text editor is deliberately small. It can produce ONLY: bold,
 * italic, underline, headings (levels 2–4), bullet and numbered lists, links
 * and quotes. There is no colour, font, size, alignment, code, raw HTML or
 * class support — and the server rejects anything outside this set — so the
 * public page's typography always comes from the AtoopV design system.
 *
 * Underline is stored as `<u>…</u>` (Markdown has no syntax for it). That is why
 * the Markdown extension runs with `html: true`: it is the only way `<u>` can be
 * read back and written out. It cannot widen what an admin can produce — the
 * editor's schema has no other HTML-backed node or mark, and the server accepts
 * no raw HTML except a balanced `<u>…</u>`.
 */
export function editorExtensions() {
  return [
    StarterKit.configure({
      // Level 1 is kept so existing pages (which use `#` as an unnumbered section
      // title) load unchanged; the toolbar itself only offers levels 2-4.
      heading: { levels: [1, 2, 3, 4] },
      code: false,
      codeBlock: false,
      strike: false,
      horizontalRule: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: false,
      linkOnPaste: true,
      HTMLAttributes: { rel: 'noopener noreferrer' },
      validate: (href) => SAFE_URL.test(href),
    }),
    // Images already present in existing pages stay visible and round-trip intact.
    // (Inserting new images comes with the media library.)
    Image.configure({ inline: true, allowBase64: false }),
    Markdown.configure({
      html: true, // required for `<u>` (underline) to round-trip; see the note above
      tightLists: true,
      bulletListMarker: '-',
      linkify: false,
      breaks: false,
      transformPastedText: true,
      transformCopiedText: false,
    }),
  ]
}
