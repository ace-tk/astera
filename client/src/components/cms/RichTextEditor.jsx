import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { Bold, Italic, Underline, Heading2, Heading3, Heading4, List, ListOrdered, Link2, Quote, Undo2, Redo2, Eye, FileCode2 } from 'lucide-react'
import { editorExtensions, SAFE_URL } from '@/cms/editorExtensions'
import { isRoundTripSafe, prepareForVisual } from '@/cms/markdownRoundTrip'
import { cn } from '@/utils/cn'

/*
 * The editing surface only. It offers exactly: bold, italic, underline, headings 2-4,
 * bullet / numbered lists, links and quotes. There are no colour, font, size,
 * alignment or spacing controls — how the text LOOKS on the public site is
 * decided by the AtoopV design system (the page's own renderer), never here.
 * The preview styling below is only there to make editing legible.
 */
const CONTENT_CLASS = cn(
  'px-4 py-3 text-[15px] leading-relaxed text-ink',
  '[&_.ProseMirror]:min-h-[22rem] [&_.ProseMirror]:outline-none',
  '[&_.ProseMirror_p]:my-3',
  '[&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:font-display [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-medium',
  '[&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:font-display [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-medium',
  '[&_.ProseMirror_h3]:mb-1.5 [&_.ProseMirror_h3]:mt-5 [&_.ProseMirror_h3]:font-display [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-medium',
  '[&_.ProseMirror_h4]:mb-1 [&_.ProseMirror_h4]:mt-4 [&_.ProseMirror_h4]:font-display [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-medium',
  '[&_.ProseMirror_ul]:my-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6',
  '[&_.ProseMirror_ol]:my-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6',
  '[&_.ProseMirror_li]:my-1 [&_.ProseMirror_li_p]:my-0',
  '[&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-ink/20 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-ink/80',
  '[&_.ProseMirror_a]:cursor-text [&_.ProseMirror_a]:text-royal [&_.ProseMirror_a]:underline',
  '[&_.ProseMirror_img]:my-3 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md',
)

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection while clicking
      onClick={onClick}
      className={cn(
        'grid h-8 w-8 place-items-center rounded-md text-ink/70 transition-colors hover:bg-ink/[0.07] hover:text-ink disabled:opacity-35',
        active && 'bg-ink text-paper hover:bg-ink hover:text-paper',
      )}
    >
      {children}
    </button>
  )
}

const Divider = () => <span className="mx-1 h-5 w-px bg-ink/12" aria-hidden="true" />

export default function RichTextEditor({ value, onChange, disabled = false, error, label = 'Article body' }) {
  const initial = useRef(value)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Untouched content must stay byte-for-byte what is stored. The editor
  // normalises Markdown when it loads it (the same words and structure, just
  // written slightly differently), so we remember what it produced for the
  // ORIGINAL content and only report a change once the output differs from
  // that. If the admin edits and then undoes their edit, we hand back the
  // original string exactly.
  const originalRef = useRef(value)
  const baselineRef = useRef(null)

  // Markdown mode is the safety net: if the visual editor cannot represent this
  // content exactly, it opens as Markdown rather than reformatting it.
  const [mode, setMode] = useState(() => (isRoundTripSafe(initial.current) ? 'visual' : 'source'))
  const [notice, setNotice] = useState(() =>
    isRoundTripSafe(initial.current)
      ? ''
      : 'This content uses formatting the visual editor cannot reproduce exactly, so it opened in Markdown mode to keep it intact.',
  )
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [linkError, setLinkError] = useState('')

  const editor = useEditor({
    extensions: editorExtensions(),
    content: prepareForVisual(initial.current),
    editable: !disabled,
    editorProps: { attributes: { 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' } },
    onCreate: ({ editor: ed }) => { baselineRef.current = ed.storage.markdown.getMarkdown() },
    onUpdate: ({ editor: ed }) => {
      if (baselineRef.current === null) return // still initialising
      const md = ed.storage.markdown.getMarkdown()
      onChangeRef.current(md === baselineRef.current ? originalRef.current : md)
    },
  })

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  const switchTo = (next) => {
    if (next === mode) return
    if (next === 'visual') {
      if (!isRoundTripSafe(value)) {
        setNotice('The visual editor cannot reproduce this content exactly, so Markdown mode is the only safe way to edit it.')
        return
      }
      editor?.commands.setContent(prepareForVisual(value), false)
      originalRef.current = value
      baselineRef.current = editor?.storage.markdown.getMarkdown() ?? null
      setNotice('')
    }
    setMode(next)
  }

  const openLink = () => {
    setLinkValue(editor.getAttributes('link').href || '')
    setLinkError('')
    setLinkOpen(true)
  }

  const applyLink = () => {
    const href = linkValue.trim()
    if (!href) return
    if (!SAFE_URL.test(href)) {
      setLinkError('Use a full web address (https://…), a page path starting with /, a mailto: or tel: address.')
      return
    }
    if (editor.state.selection.empty && !editor.isActive('link')) {
      setLinkError('Select the text you want to turn into a link first.')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setLinkOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  const run = (fn) => () => fn(editor.chain().focus()).run()
  const tools = !editor || mode !== 'visual' || disabled

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-card', error ? 'border-rose/60' : 'border-ink/12')}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-ink/10 bg-paper px-2 py-1.5" role="toolbar" aria-label="Formatting">
        <ToolButton label="Bold" active={editor?.isActive('bold')} disabled={tools} onClick={run((c) => c.toggleBold())}><Bold className="h-4 w-4" /></ToolButton>
        <ToolButton label="Italic" active={editor?.isActive('italic')} disabled={tools} onClick={run((c) => c.toggleItalic())}><Italic className="h-4 w-4" /></ToolButton>
        <ToolButton label="Underline" active={editor?.isActive('underline')} disabled={tools} onClick={run((c) => c.toggleUnderline())}><Underline className="h-4 w-4" /></ToolButton>
        <Divider />
        <ToolButton label="Heading 2" active={editor?.isActive('heading', { level: 2 })} disabled={tools} onClick={run((c) => c.toggleHeading({ level: 2 }))}><Heading2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Heading 3" active={editor?.isActive('heading', { level: 3 })} disabled={tools} onClick={run((c) => c.toggleHeading({ level: 3 }))}><Heading3 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Heading 4" active={editor?.isActive('heading', { level: 4 })} disabled={tools} onClick={run((c) => c.toggleHeading({ level: 4 }))}><Heading4 className="h-4 w-4" /></ToolButton>
        <Divider />
        <ToolButton label="Bullet list" active={editor?.isActive('bulletList')} disabled={tools} onClick={run((c) => c.toggleBulletList())}><List className="h-4 w-4" /></ToolButton>
        <ToolButton label="Numbered list" active={editor?.isActive('orderedList')} disabled={tools} onClick={run((c) => c.toggleOrderedList())}><ListOrdered className="h-4 w-4" /></ToolButton>
        <ToolButton label="Quote" active={editor?.isActive('blockquote')} disabled={tools} onClick={run((c) => c.toggleBlockquote())}><Quote className="h-4 w-4" /></ToolButton>
        <ToolButton label="Link" active={editor?.isActive('link')} disabled={tools} onClick={openLink}><Link2 className="h-4 w-4" /></ToolButton>
        <Divider />
        <ToolButton label="Undo" disabled={tools || !editor?.can().undo()} onClick={run((c) => c.undo())}><Undo2 className="h-4 w-4" /></ToolButton>
        <ToolButton label="Redo" disabled={tools || !editor?.can().redo()} onClick={run((c) => c.redo())}><Redo2 className="h-4 w-4" /></ToolButton>

        <div className="ml-auto flex items-center gap-0.5 rounded-md bg-ink/[0.05] p-0.5" role="group" aria-label="Editing mode">
          <button type="button" onClick={() => switchTo('visual')} aria-pressed={mode === 'visual'} className={cn('inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium', mode === 'visual' ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink')}>
            <Eye className="h-3.5 w-3.5" /> Visual
          </button>
          <button type="button" onClick={() => switchTo('source')} aria-pressed={mode === 'source'} className={cn('inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium', mode === 'source' ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink')}>
            <FileCode2 className="h-3.5 w-3.5" /> Markdown
          </button>
        </div>
      </div>

      {linkOpen && mode === 'visual' && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 bg-paper/60 px-3 py-2">
          <label className="sr-only" htmlFor="cms-link-url">Link address</label>
          <input
            id="cms-link-url"
            autoFocus
            value={linkValue}
            onChange={(e) => { setLinkValue(e.target.value); setLinkError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setLinkOpen(false) }}
            placeholder="https://…  or  /services/…"
            className="input !h-8 !w-72 !rounded-md !py-1"
          />
          <button type="button" onClick={applyLink} className="h-8 rounded-md bg-ink px-3 text-xs font-medium text-paper">Apply</button>
          {editor?.isActive('link') && <button type="button" onClick={removeLink} className="h-8 rounded-md px-3 text-xs font-medium text-rose hover:bg-rose/10">Remove link</button>}
          <button type="button" onClick={() => setLinkOpen(false)} className="h-8 rounded-md px-3 text-xs text-muted hover:text-ink">Cancel</button>
          {linkError && <p role="alert" className="w-full text-xs text-rose">{linkError}</p>}
        </div>
      )}

      {notice && <p role="status" className="border-b border-golden/30 bg-golden/10 px-4 py-2 text-xs text-ink/80">{notice}</p>}

      <div hidden={mode !== 'visual'}>
        <EditorContent editor={editor} className={CONTENT_CLASS} />
      </div>
      {mode === 'source' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          spellCheck={false}
          aria-label={`${label} (Markdown)`}
          className="block min-h-[26rem] w-full resize-y bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-ink outline-none"
        />
      )}
    </div>
  )
}
