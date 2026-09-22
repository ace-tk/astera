import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Eye, ImagePlus, ImageOff, Rocket, Save } from 'lucide-react'
import {
  fetchAdminBlog, createAdminBlog, saveAdminBlogDraft, publishAdminBlog, unpublishAdminBlog, discardAdminBlogDraft, deleteAdminBlog,
} from '@/services/blog'
import { resolveMediaUrl } from '@/cms/media'
import { describeError } from '@/cms/errors'
import { useToast } from '@/context/ToastContext'
import RichTextEditor from '@/components/cms/RichTextEditor'
import MediaPicker from '@/components/cms/MediaPicker'
import StatusBadge from '@/components/cms/StatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'
const FIELDS = ['title', 'excerpt', 'content', 'contentFormat', 'imageUrl', 'author', 'featured', 'publishedAt']
const pick = (v) => Object.fromEntries(FIELDS.map((k) => [k, v[k]]))
const NEW_POST = { title: '', excerpt: '', content: '', contentFormat: 'markdown', imageUrl: '', author: 'ATOOPV Team', featured: false, publishedAt: new Date().toISOString() }
const toDay = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '')

export default function AdminBlogEditor() {
  const { id } = useParams()
  const { data: blog, isLoading, isError, error } = useQuery({ queryKey: ['admin', 'blog', id], queryFn: () => fetchAdminBlog(id), enabled: Boolean(id), staleTime: 0 })

  if (id && isLoading) return <p className="py-10 text-center text-sm text-muted">Loading…</p>
  if (id && (isError || !blog)) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-center">
        <div>
          <h2 className="font-display text-xl font-semibold">Post not found</h2>
          <p className="mt-2 text-sm text-muted">{isError ? describeError(error) : ''}</p>
          <Button as={Link} to="/app/admin/blog" variant="soft" size="sm" className="mt-5"><ArrowLeft className="h-4 w-4" /> Back to Blog</Button>
        </div>
      </div>
    )
  }
  return <Editor key={blog?.id || 'new'} blog={blog} />
}

function Editor({ blog: initial }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [blog, setBlog] = useState(initial || null) // the server's view (null until first save)
  const [form, setForm] = useState(() => pick(initial?.working || NEW_POST))
  const [base, setBase] = useState(() => pick(initial?.working || NEW_POST))
  const [problem, setProblem] = useState('')
  const [picking, setPicking] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'unpublish' | 'discard' | 'delete'
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = JSON.stringify(form) !== JSON.stringify(base)
  const isNew = !blog

  const apply = (b) => {
    setBlog(b)
    setForm(pick(b.working))
    setBase(pick(b.working))
    setProblem('')
    qc.setQueryData(['admin', 'blog', b.id], b)
    qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }); return null }

  /** Save the working copy (creating the post the first time). Resolves to the saved post, or null. */
  const save = async () => {
    try {
      if (!form.title.trim()) { setProblem('Give the post a title first.'); return null }
      const saved = isNew ? await createAdminBlog(form) : await saveAdminBlogDraft(blog.id, form, blog.rev)
      apply(saved)
      if (isNew) navigate(`/app/admin/blog/${saved.id}`, { replace: true })
      return saved
    } catch (err) {
      return fail(err)
    }
  }
  const run = async (fn) => { setBusy(true); try { return await fn() } finally { setBusy(false) } }

  const onSave = () => run(async () => { if (await save()) toast({ title: 'Draft saved', description: 'The live post is unchanged until you publish.', color: 'emerald' }) })

  const onPreview = () => {
    const win = window.open('about:blank', '_blank') // opened synchronously so the browser allows it
    return run(async () => {
      const saved = dirty || isNew ? await save() : blog
      if (!saved) return win?.close()
      const url = `/blog/${saved.slug}?preview=${saved.id}`
      if (win) win.location.href = url
      else window.location.assign(url)
    })
  }

  const onPublish = () => run(async () => {
    const saved = dirty || isNew ? await save() : blog
    if (!saved) return
    try {
      apply(await publishAdminBlog(saved.id))
      toast({ title: 'Published', description: 'The post is now live on the website.', color: 'emerald' })
    } catch (err) { fail(err) }
  })

  const onConfirmed = () => {
    const what = confirm
    setConfirm(null)
    return run(async () => {
      try {
        if (what === 'unpublish') { apply(await unpublishAdminBlog(blog.id)); toast({ title: 'Unpublished', description: 'The post is no longer on the website. Your text is kept.', color: 'emerald' }) }
        if (what === 'discard') { apply(await discardAdminBlogDraft(blog.id)); toast({ title: 'Changes discarded', color: 'emerald' }) }
        if (what === 'delete') {
          await deleteAdminBlog(blog.id)
          qc.setQueryData(['admin', 'blogs'], (list) => list?.filter((b) => b.id !== blog.id)) // the list must not flash the deleted post
          qc.removeQueries({ queryKey: ['admin', 'blog', blog.id] })
          qc.invalidateQueries({ queryKey: ['admin', 'blogs'] })
          navigate('/app/admin/blog')
        }
      } catch (err) { fail(err) }
    })
  }

  const status = blog?.status || 'draft'
  const published = status === 'published'
  const canDiscard = blog && blog.everPublished && (blog.hasUnpublishedChanges || dirty)
  const canDelete = blog && !blog.everPublished
  const publishLabel = published ? (blog.hasUnpublishedChanges || dirty ? 'Publish changes' : 'Published') : 'Publish'

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/app/admin/blog" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"><ArrowLeft className="h-4 w-4" /> Blog</Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{isNew ? 'New post' : form.title || 'Untitled post'}</h1>
        <StatusBadge status={status} hasUnpublishedChanges={Boolean(blog?.hasUnpublishedChanges) || (published && dirty)} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={onSave} disabled={busy || (!dirty && !isNew)}><Save className="h-4 w-4" /> Save draft</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={onPreview} disabled={busy}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={onPublish} disabled={busy || (published && !blog.hasUnpublishedChanges && !dirty)}><Rocket className="h-4 w-4" /> {publishLabel}</Button>
        </div>
      </div>

      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-5">
          <label className="block">
            <span className={LABEL}>Title</span>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} aria-label="Title" className="input !rounded-md text-base" />
          </label>

          <label className="block">
            <span className={LABEL}>Summary</span>
            <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value.replace(/[\r\n]+/g, ' '))} rows={3} maxLength={400} aria-label="Summary" className="input resize-none !rounded-md" />
            <span className="mt-1 block text-xs text-muted">Shown under the title and on the homepage card. {form.excerpt.length}/400</span>
          </label>

          <div>
            <span className={LABEL}>Cover image</span>
            <div className="aspect-[16/9] max-w-md overflow-hidden rounded-xl border border-ink/10 bg-ink/[0.04]">
              {form.imageUrl ? <img src={resolveMediaUrl(form.imageUrl)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-muted/50"><ImageOff className="h-7 w-7" /></div>}
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setPicking(true)} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-3 text-xs font-medium hover:bg-ink/[0.05]">
                <ImagePlus className="h-3.5 w-3.5" /> {form.imageUrl ? 'Change image' : 'Choose image'}
              </button>
              {form.imageUrl && <button type="button" onClick={() => set('imageUrl', '')} className="h-8 rounded-md px-3 text-xs font-medium text-rose hover:bg-rose/10">Remove</button>}
            </div>
          </div>

          <div>
            <span className={LABEL}>Text</span>
            {form.contentFormat === 'markdown' ? (
              <RichTextEditor value={form.content} onChange={(v) => set('content', v)} label="Post text" />
            ) : (
              <>
                <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={16} maxLength={20000} aria-label="Post text" className="input !rounded-md" />
                <p className="mt-1.5 text-xs text-muted">This post keeps its original plain-text format (line breaks are preserved). New posts use the formatting editor.</p>
              </>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-ink/10 bg-card p-4">
            <label className="block">
              <span className={LABEL}>Author</span>
              <input value={form.author} onChange={(e) => set('author', e.target.value)} maxLength={120} aria-label="Author" className="input !rounded-md" />
            </label>
            <label className="mt-4 block">
              <span className={LABEL}>Date shown</span>
              <input type="date" value={toDay(form.publishedAt)} onChange={(e) => e.target.value && set('publishedAt', `${e.target.value}T12:00:00.000Z`)} aria-label="Date shown" className="input !rounded-md" />
            </label>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink/30" />
              <span>Feature on the homepage<span className="block text-xs text-muted">The homepage Blog card shows the featured post, or the latest one.</span></span>
            </label>
            <p className="mt-4 text-xs text-muted">Address: <span className="font-mono">{blog ? `/blog/${blog.slug}` : '/blog/… (created from the title)'}</span></p>
          </section>

          {blog && (
            <section className="space-y-2 rounded-lg border border-ink/10 bg-card p-4">
              <p className="text-xs text-muted">Edits stay in the draft. Only <strong>Publish</strong> changes what visitors see.</p>
              {published && <button type="button" onClick={() => setConfirm('unpublish')} disabled={busy} className="block w-full rounded-md border border-ink/12 px-3 py-2 text-left text-sm hover:bg-ink/[0.05]">Unpublish</button>}
              {canDiscard && <button type="button" onClick={() => setConfirm('discard')} disabled={busy} className="block w-full rounded-md border border-ink/12 px-3 py-2 text-left text-sm hover:bg-ink/[0.05]">Discard changes</button>}
              {canDelete && <button type="button" onClick={() => setConfirm('delete')} disabled={busy} className="block w-full rounded-md px-3 py-2 text-left text-sm text-rose hover:bg-rose/10">Delete post</button>}
              {!canDelete && !published && <p className="text-xs text-muted">A post that has been published cannot be deleted — it stays here, unpublished.</p>}
            </section>
          )}
        </aside>
      </div>

      <MediaPicker open={picking} current={form.imageUrl} onClose={() => setPicking(false)} onSelect={(path) => { set('imageUrl', path); setPicking(false) }} />
      <ConfirmDialog
        open={Boolean(confirm)}
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirmed}
        danger={confirm === 'delete' || confirm === 'unpublish'}
        title={{ unpublish: 'Unpublish this post?', discard: 'Discard your changes?', delete: 'Delete this post?' }[confirm] || ''}
        description={{
          unpublish: 'It will disappear from the website (and the homepage card). Your text is kept and you can publish it again.',
          discard: 'Your unpublished edits are thrown away and the post goes back to the version that is live.',
          delete: 'This post was never published. It will be deleted for good.',
        }[confirm] || ''}
        confirmLabel={{ unpublish: 'Unpublish', discard: 'Discard changes', delete: 'Delete post' }[confirm] || 'Confirm'}
      />
    </div>
  )
}
