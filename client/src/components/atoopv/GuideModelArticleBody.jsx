import { Download } from 'lucide-react'
import MarkdownArticle from '@/components/atoopv/MarkdownArticle'
import Button from '@/components/ui/Button'

/**
 * modele-pv-cse-gratuit-only rendering of the article body. MarkdownArticle
 * itself is untouched and still renders every paragraph/list/table —
 * this only changes how the page groups its blocks: the "bare emoji line →
 * heading" pairs this page's source markdown repeats twice (see
 * utils/modelePvGratuitContent.js:splitIconSections) get their own
 * icon+heading row instead of rendering as two stacked, disconnected
 * blocks, and the standalone link to the model PDF renders as a real
 * download button (icon + label, same text as the source link) instead of
 * MarkdownArticle's plain inline text link. Scoped to this one page's
 * component tree so MarkdownArticle and every other Services/Ressources
 * article stay byte-for-byte unchanged.
 */
export default function GuideModelArticleBody({ segments, color, resolveHref }) {
  return (
    <div className="space-y-8">
      {segments.map((seg, i) => {
        if (seg.type === 'icon') {
          return (
            <section key={seg.id} id={seg.id} className="scroll-mt-28">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl leading-none" aria-hidden="true">
                  {seg.icon}
                </span>
                <h3 className="font-display text-xl font-medium leading-tight tracking-tight text-balance">{seg.heading}</h3>
              </div>
              {seg.md && (
                <div className="mt-3 pl-10">
                  <MarkdownArticle body={seg.md} color={color} resolveHref={resolveHref} />
                </div>
              )}
            </section>
          )
        }

        if (seg.type === 'pdf') {
          return (
            <Button key={i} as="a" href={seg.href} target="_blank" rel="noreferrer" variant="accent" size="md" className="w-fit">
              <Download className="h-4 w-4" /> {seg.label}
            </Button>
          )
        }

        return <MarkdownArticle key={i} body={seg.md} color={color} resolveHref={resolveHref} />
      })}
    </div>
  )
}
