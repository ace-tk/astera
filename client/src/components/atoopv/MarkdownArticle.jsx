import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink } from 'lucide-react'
import { resolveResourceHref } from '@/constants/resourcesLinks'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'
import { slugify } from '@/utils/slugify'
import { mergeIconHeadings, splitIconHeading } from '@/utils/mergeIconHeadings'

function textFrom(node) {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textFrom).join('')
  if (node.props?.children) return textFrom(node.props.children)
  return ''
}

/**
 * Renders one extracted markdown body (Ressources or Services) with
 * Astera's editorial typography — the generic counterpart to
 * RichTextSection's hand-typed blocks, for content whose structure isn't
 * known ahead of time (arbitrary headings/paragraphs/lists/tables/images/
 * links straight from a crawled page). Internal links are rewritten via
 * `resolveHref` (resolveResourceHref by default, resolveServiceHref for the
 * Services section) so a link that pointed at atoopv.com/some-page in the
 * source markdown lands on the matching page in this app instead.
 *
 * `editorialNumbers` is opt-in and off by default — every existing caller
 * keeps today's plain heading exactly as it renders now. Where a page turns
 * it on (Ressources/Blog articles with a real multi-section shape), each
 * `##` heading gets a large index number (counted from the headings that
 * actually exist in this document, nothing invented) plus an anchor id, so
 * a rail built from the same headings (see EditorialSectionRail) can jump
 * straight to them.
 *
 * `iconHeadings` is opt-in and off by default too — Services content is the
 * only source with the "bare icon line, then heading" shape (see
 * mergeIconHeadings.js), so this only changes anything for callers that
 * explicitly turn it on.
 */
export default function MarkdownArticle({ body, color = 'sky', resolveHref = resolveResourceHref, editorialNumbers = false, iconHeadings = false }) {
  const a = accent(color)
  const h2Index = useRef(0)
  const seenH2Ids = useRef(new Set())
  h2Index.current = 0
  seenH2Ids.current = new Set()
  const source = iconHeadings ? mergeIconHeadings(body) : body

  // Icon-headings: an icon-bearing h2/h3/h4 becomes a flex row (icon column
  // + heading, which wraps on its own within its own column) instead of a
  // plain heading. `wrapClass` carries the vertical rhythm that would
  // otherwise sit on the heading itself, since the heading is no longer the
  // outermost element.
  function iconRow(children, Tag, headingClass, wrapClass) {
    const split = iconHeadings ? splitIconHeading(textFrom(children)) : null
    if (!split) return <Tag className={cn(wrapClass, headingClass)}>{children}</Tag>
    return (
      <div className={cn('flex items-start gap-2.5', wrapClass)}>
        <span className="shrink-0 text-[1.15em] leading-[1.3]" aria-hidden="true">
          {split.icon}
        </span>
        <Tag className={headingClass}>{split.text}</Tag>
      </div>
    )
  }

  return (
    <div className="markdown-article max-w-none space-y-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-10 font-display text-2xl font-medium leading-tight tracking-tight text-balance first:mt-0">{children}</h2>
          ),
          h2: ({ children }) => {
            const id = slugify(textFrom(children)) || undefined
            // A second heading with the exact same text (several pages repeat
            // their own H2 verbatim, e.g. a "content" pass over the same
            // source further down the page) would otherwise still get its
            // own number and its own `id="..."` -- two DOM nodes sharing one
            // id, and the reader sees the same section title (and, with
            // editorialNumbers on, a second large number) reappear right
            // after the first. extractH2Sections already skips these for the
            // section rail; mirroring that here keeps the in-content numbers
            // and the rail in lockstep and stops the repeat from rendering as
            // a second numbered heading. The text itself is untouched --
            // still rendered, just via the plain (unnumbered) heading style
            // used everywhere editorialNumbers is off.
            const isRepeat = Boolean(id) && seenH2Ids.current.has(id)
            if (id) seenH2Ids.current.add(id)
            if (!editorialNumbers || isRepeat) {
              return iconRow(
                children,
                (p) => <h2 id={isRepeat ? undefined : id} {...p} />,
                'font-display text-2xl font-medium leading-tight tracking-tight text-balance',
                'mt-10 scroll-mt-28 first:mt-0',
              )
            }
            h2Index.current += 1
            const number = String(h2Index.current).padStart(2, '0')
            return (
              <div id={id} className="mt-14 scroll-mt-28 first:mt-0">
                <div className="flex items-baseline gap-4">
                  <span className="shrink-0 font-display text-4xl font-semibold leading-none text-ink/15 sm:text-5xl">{number}</span>
                  <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">{children}</h2>
                </div>
                <div className="mt-4 h-px w-full bg-gradient-to-r from-ink/15 via-ink/8 to-transparent" aria-hidden="true" />
              </div>
            )
          },
          h3: ({ children }) => iconRow(children, 'h3', 'font-display text-lg font-medium tracking-tight', 'mt-8'),
          h4: ({ children }) => iconRow(children, 'h4', 'font-display text-base font-medium tracking-tight', 'mt-6'),
          p: ({ children }) => <p className="text-base leading-relaxed text-ink/80 text-pretty">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          ul: ({ children }) => <ul className={cn('list-disc space-y-2 pl-5 marker:text-base', a.text)}>{children}</ul>,
          ol: ({ children }) => <ol className={cn('list-decimal space-y-2 pl-5 marker:font-semibold', a.text)}>{children}</ol>,
          li: ({ children }) => {
            // Some ordered lists (e.g. a guide's own "Sommaire"/table of
            // contents) carry a bare chapter number as the item's own first
            // line, on top of the `<ol>` marker this renderer already draws
            // — "1." from the list, then a literal "1" from the content,
            // both showing the same real number. Detected narrowly (first
            // child renders down to nothing but digits) so a normal list
            // item that merely starts with a number in its own sentence is
            // never affected. Nothing is removed: the number this shows is
            // the content's own digit, just carrying the marker instead of
            // duplicating it above the marker.
            // react-markdown inserts whitespace-only text nodes ("\n")
            // between a loose list item's block children, so the real first
            // child (the bare-number paragraph) isn't always kids[0].
            const rawKids = Array.isArray(children) ? children : [children]
            const kids = rawKids.filter((k) => typeof k !== 'string' || k.trim() !== '')
            const firstText = textFrom(kids[0]).trim()
            if (kids.length > 1 && /^\d+$/.test(firstText)) {
              return (
                <li className="flex items-start gap-3 pl-1 text-base leading-relaxed text-ink/80" style={{ listStyleType: 'none' }}>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-royal/10 font-mono text-xs font-medium text-royal">
                    {firstText}
                  </span>
                  <span className="flex-1 space-y-2 [&>p]:m-0">{kids.slice(1)}</span>
                </li>
              )
            }
            return <li className="pl-1 text-base leading-relaxed text-ink/80 marker:text-sm">{children}</li>
          },
          a: ({ href, children }) => {
            const resolved = resolveHref(href || '')
            if (resolved.external) {
              return (
                <a href={resolved.href} target="_blank" rel="noreferrer" className={cn('inline-flex items-center gap-1 font-medium link-underline', a.text)}>
                  {children}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )
            }
            return (
              <Link to={resolved.href} className={cn('font-medium link-underline', a.text)}>
                {children}
              </Link>
            )
          },
          blockquote: ({ children }) => (
            <figure className="relative overflow-hidden rounded-3xl border border-ink/8 bg-card p-6 shadow-soft">
              <span className="pointer-events-none absolute -right-2 -top-6 font-display text-[6rem] leading-none text-ink/10">”</span>
              <blockquote className="relative space-y-3 italic text-ink/90 [&_p]:text-ink/90">{children}</blockquote>
            </figure>
          ),
          img: ({ src, alt }) => (
            <span className="block">
              <img src={src} alt={alt} loading="lazy" className="w-full rounded-2xl border border-ink/8 object-cover shadow-soft" />
              {alt && <span className="mt-2 block text-center text-sm text-muted">{alt}</span>}
            </span>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-2xl border border-ink/8 shadow-soft">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-card">{children}</thead>,
          th: ({ children }) => <th className="border-b border-ink/8 px-4 py-3 font-display text-sm font-medium text-ink">{children}</th>,
          td: ({ children }) => <td className="border-b border-ink/8 px-4 py-3 text-ink/80 last:border-b-0">{children}</td>,
          hr: () => <hr className="border-ink/8" />,
          code: ({ children }) => <code className="rounded bg-card px-1.5 py-0.5 font-mono text-[0.85em] text-ink">{children}</code>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
