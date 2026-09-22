import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Eye, ExternalLink, Search, EyeOff, Trash2, RotateCcw, FileText } from 'lucide-react'
import { fetchAdminPages, fetchTemplates, unpublishAdminPage, archiveAdminPage, restoreAdminPage, fetchPageUsages, previewUrl } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { useToast } from '@/context/ToastContext'
import StatusBadge from '@/components/cms/StatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'

const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')

export default function AdminCmsPages() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [section, setSection] = useState('')
  const [status, setStatus] = useState('')
  const [confirm, setConfirm] = useState(null) // { kind: 'unpublish' | 'remove', page, usages }

  const { data: templates = [] } = useQuery({ queryKey: ['cms', 'templates'], queryFn: fetchTemplates, staleTime: 5 * 60_000 })
  const sections = Object.fromEntries(templates.flatMap((t) => t.sections).map((s) => [s.key, s]))

  const { data: pages = [], isLoading, isError, error } = useQuery({
    queryKey: ['cms', 'admin', 'pages', { q, section, status }],
    queryFn: () => fetchAdminPages({ q, section, status }),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['cms', 'admin'] })
  const fail = (err) => toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' })

  const unpublish = useMutation({
    mutationFn: (p) => unpublishAdminPage(p.id),
    onSuccess: () => { refresh(); setConfirm(null); toast({ title: 'Page unpublished', description: 'It is no longer visible to visitors. Your draft is kept.', color: 'emerald' }) },
    onError: fail,
  })
  const remove = useMutation({
    mutationFn: (p) => archiveAdminPage(p.id, p.status === 'published' ? `/services/${p.section}` : undefined),
    onSuccess: () => { refresh(); setConfirm(null); toast({ title: 'Page removed', description: 'You can restore it from the “Removed” filter.', color: 'emerald' }) },
    onError: fail,
  })
  const restore = useMutation({
    mutationFn: (p) => restoreAdminPage(p.id),
    onSuccess: () => { refresh(); toast({ title: 'Page restored as a draft', color: 'emerald' }) },
    onError: fail,
  })

  const ask = async (kind, page) => {
    setConfirm({ kind, page, usages: null })
    try {
      const usages = await fetchPageUsages(page.id)
      setConfirm((c) => (c && c.page.id === page.id ? { ...c, usages } : c))
    } catch { /* the warning is best-effort */ }
  }

  const usageText = (u) => {
    if (!u) return ''
    const bits = []
    if (u.menus.length) bits.push(`the ${u.menus.join(', ')} menu`)
    if (u.sectionNavs?.length) bits.push(`the side navigation of ${u.sectionNavs.length} section${u.sectionNavs.length > 1 ? 's' : ''}`)
    if (u.pages.length) bits.push(`${u.pages.length} other page${u.pages.length > 1 ? 's' : ''}`)
    return bits.length ? ` It is referenced by ${bits.join(', ')}: it will disappear from menus and lists automatically, and links inside other pages will stop working.` : ''
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-purple">Content</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Pages</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Create and edit pages in the website’s existing sections. The design is fixed in the site — you control the content only.
          </p>
        </div>
        <Button as={Link} to="/app/admin/cms/pages/new" variant="accent" size="sm" className="rounded-md">
          <Plus className="h-4 w-4" /> New page
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search pages</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or address" className="input !w-72 !rounded-md !pl-9" />
        </label>
        <select aria-label="Filter by section" value={section} onChange={(e) => setSection(e.target.value)} className="input !w-auto !rounded-md">
          <option value="">All sections</option>
          {Object.values(sections).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto !rounded-md">
          <option value="">All (except removed)</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="archived">Removed</option>
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-ink/10 bg-card">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_10rem_9rem_auto] gap-4 border-b border-ink/10 bg-paper px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:grid">
          <span>Title</span><span>Address</span><span>Status</span><span>Updated</span><span className="text-right">Actions</span>
        </div>

        {isLoading && <p className="px-4 py-10 text-center text-sm text-muted">Loading pages…</p>}
        {isError && <p role="alert" className="px-4 py-10 text-center text-sm text-rose">{describeError(error)}</p>}
        {!isLoading && !isError && pages.length === 0 && (
          <div className="px-4 py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-ink/25" />
            <p className="mt-3 text-sm font-medium">No pages here yet</p>
            <p className="mt-1 text-sm text-muted">{q || section || status ? 'Nothing matches those filters.' : 'Create the first page in one of the website’s sections.'}</p>
          </div>
        )}

        <ul>
          {pages.map((p) => (
            <li key={p.id} className="grid gap-x-4 gap-y-2 border-b border-ink/8 px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_10rem_9rem_auto] md:items-center">
              <div className="min-w-0">
                <Link to={`/app/admin/cms/pages/${p.id}`} className="block truncate text-sm font-medium hover:text-royal">{p.title}</Link>
                <p className="text-xs text-muted">
                  {sections[p.section]?.label || p.section}
                  {p.isLegacy && <span className="ml-2 rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wider">Migrated</span>}
                </p>
              </div>
              <code className="min-w-0 truncate font-mono text-xs text-ink/70">{p.path}</code>
              <div><StatusBadge status={p.status} hasUnpublishedChanges={p.hasUnpublishedChanges} /></div>
              <span className="text-xs text-muted">{fmt(p.updatedAt)}</span>
              <div className="flex items-center gap-1 md:justify-end">
                {p.status !== 'archived' ? (
                  <>
                    <Link to={`/app/admin/cms/pages/${p.id}`} title="Edit" aria-label={`Edit ${p.title}`} className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink"><Pencil className="h-4 w-4" /></Link>
                    <a href={previewUrl(p)} target="_blank" rel="noreferrer" title="Preview draft" aria-label={`Preview ${p.title}`} className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink"><Eye className="h-4 w-4" /></a>
                    {p.status === 'published' && (
                      <>
                        <a href={p.path} target="_blank" rel="noreferrer" title="View live page" aria-label={`View ${p.title} live`} className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink"><ExternalLink className="h-4 w-4" /></a>
                        <button type="button" title="Unpublish" aria-label={`Unpublish ${p.title}`} onClick={() => ask('unpublish', p)} className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink"><EyeOff className="h-4 w-4" /></button>
                      </>
                    )}
                    <button type="button" title="Remove" aria-label={`Remove ${p.title}`} onClick={() => ask('remove', p)} className="grid h-8 w-8 place-items-center rounded-md text-rose/80 hover:bg-rose/10 hover:text-rose"><Trash2 className="h-4 w-4" /></button>
                  </>
                ) : (
                  <button type="button" onClick={() => restore.mutate(p)} className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-ink/80 hover:bg-ink/[0.07]"><RotateCcw className="h-3.5 w-3.5" /> Restore</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={confirm?.kind === 'unpublish'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => unpublish.mutate(confirm.page)}
        busy={unpublish.isPending}
        icon={EyeOff}
        color="golden"
        title="Unpublish this page?"
        description={`“${confirm?.page.title}” will disappear from the public site straight away. Your draft is kept, and you can publish it again later.${usageText(confirm?.usages)}`}
        confirmLabel="Unpublish"
      />
      <ConfirmDialog
        open={confirm?.kind === 'remove'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => remove.mutate(confirm.page)}
        busy={remove.isPending}
        danger
        icon={Trash2}
        title="Remove this page?"
        description={`“${confirm?.page.title}” will be taken offline${confirm?.page.status === 'published' ? ' and visitors of its address will be sent to the section page' : ''}. It is kept in “Removed” and can be restored.${usageText(confirm?.usages)}`}
        confirmLabel="Remove page"
      />
    </div>
  )
}
