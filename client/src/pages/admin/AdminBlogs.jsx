import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, ImageOff, Plus } from 'lucide-react'
import { fetchAdminBlogs } from '@/services/blog'
import { resolveMediaUrl } from '@/cms/media'
import { describeError } from '@/cms/errors'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

/** Content → Blog: every post with its status. Posts open in the editor; the public design is fixed. */
export default function AdminBlogs() {
  const { data: blogs = [], isLoading, isError, error } = useQuery({ queryKey: ['admin', 'blogs'], queryFn: fetchAdminBlogs })

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-purple">Content</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">Write and publish posts. They appear on the website in the existing Blog design — you only supply the content.</p>
        </div>
        <Button as={Link} to="/app/admin/blog/new" variant="accent" size="sm"><Plus className="h-4 w-4" /> New post</Button>
      </div>

      <div className="mt-6 rounded-3xl border border-ink/8 bg-card shadow-soft">
        {isLoading && <p className="px-5 py-6 text-sm text-muted">Loading…</p>}
        {isError && <p role="alert" className="px-5 py-6 text-sm text-rose">{describeError(error)}</p>}
        {!isLoading && !isError && blogs.length === 0 && <p className="px-5 py-6 text-sm text-muted">No posts yet. Create the first one.</p>}
        <ul className="divide-y divide-ink/5">
          {blogs.map((b) => {
            const w = b.working
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                <span className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-ink/[0.05] text-muted/50">
                  {w.imageUrl ? <img src={resolveMediaUrl(w.imageUrl)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <ImageOff className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1 basis-56">
                  <Link to={`/app/admin/blog/${b.id}`} className="block truncate text-sm font-medium hover:text-royal">{w.title}</Link>
                  <p className="truncate text-xs text-muted">{w.author} · {fmtDate(w.publishedAt)} · /blog/{b.slug}</p>
                </div>
                <StatusBadge status={b.status} hasUnpublishedChanges={b.hasUnpublishedChanges} />
                <div className="flex gap-2">
                  <Button as={Link} to={`/app/admin/blog/${b.id}`} variant="soft" size="sm" magnetic={false}>Edit</Button>
                  {b.status === 'published' && (
                    <Button as="a" href={`/blog/${b.slug}`} target="_blank" rel="noreferrer" variant="soft" size="sm" magnetic={false} aria-label={`View ${w.title} on the website`}>
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
