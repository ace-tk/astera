import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ExternalLink } from 'lucide-react'
import { resolveResourceHref } from '@/constants/resourcesLinks'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

/**
 * Renders one extracted markdown body (Ressources or Services) with
 * Astera's editorial typography — the generic counterpart to
 * RichTextSection's hand-typed blocks, for content whose structure isn't
 * known ahead of time (arbitrary headings/paragraphs/lists/tables/images/
 * links straight from a crawled page). Internal links are rewritten via
 * `resolveHref` (resolveResourceHref by default, resolveServiceHref for the
 * Services section) so a link that pointed at atoopv.com/some-page in the
 * source markdown lands on the matching page in this app instead.
 */
export default function MarkdownArticle({ body, color = 'sky', resolveHref = resolveResourceHref }) {
  const a = accent(color)

  return (
    <div className="markdown-article max-w-none space-y-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-10 font-display text-2xl font-medium leading-tight tracking-tight text-balance first:mt-0">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 font-display text-2xl font-medium leading-tight tracking-tight text-balance first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => <h3 className="mt-8 font-display text-lg font-medium tracking-tight">{children}</h3>,
          h4: ({ children }) => <h4 className="mt-6 font-display text-base font-medium tracking-tight">{children}</h4>,
          p: ({ children }) => <p className="text-base leading-relaxed text-ink/80 text-pretty">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          ul: ({ children }) => <ul className={cn('list-disc space-y-2 pl-5 marker:text-base', a.text)}>{children}</ul>,
          ol: ({ children }) => <ol className={cn('list-decimal space-y-2 pl-5 marker:font-semibold', a.text)}>{children}</ol>,
          li: ({ children }) => <li className="pl-1 text-base leading-relaxed text-ink/80 marker:text-sm">{children}</li>,
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
        {body}
      </ReactMarkdown>
    </div>
  )
}
