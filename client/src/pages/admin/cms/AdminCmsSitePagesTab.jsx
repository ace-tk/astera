import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ExternalLink, Rocket, Save, Undo2 } from 'lucide-react'
import { fetchAdminSitePage, saveAdminSitePageDraft, publishAdminSitePage, discardAdminSitePage } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { clone } from '@/cms/navIds'
import { setIn } from '@/cms/siteContentTree'
import { SITE_PAGES, SITE_PAGE_KEYS } from '@/cms/sitePageRegistry'
import { useToast } from '@/context/ToastContext'
import SiteContentForm from '@/components/cms/SiteContentForm'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/** One site page's editor — same draft → save → publish → discard workflow as the footer/homepage hero. */
function SitePageEditor({ pageKey }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const queryKey = ['cms', 'admin', 'site-page', pageKey]
  const { data: page, isLoading, isError, error } = useQuery({ queryKey, queryFn: () => fetchAdminSitePage(pageKey), staleTime: 0 })

  const [content, setContent] = useState(null)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (page && !content) setContent(clone(page.draft.content))
  }, [page, content])

  const dirty = Boolean(page && content && JSON.stringify(content) !== JSON.stringify(page.draft.content))

  const applyServer = (p) => {
    qc.setQueryData(queryKey, p)
    qc.invalidateQueries({ queryKey: ['cms', 'site-page', pageKey] })
    setContent(clone(p.draft.content))
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveAdminSitePageDraft(pageKey, content, page.rev), onSuccess: (p) => { applyServer(p); toast({ title: 'Draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminSitePageDraft(pageKey, content, page.rev)
      return publishAdminSitePage(pageKey)
    },
    onSuccess: (p) => { applyServer(p); toast({ title: 'Page published', description: 'The public page now shows this content.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardAdminSitePage(pageKey), onSuccess: (p) => { applyServer(p); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })

  if (isLoading || !content) return <p className="py-10 text-center text-sm text-muted">Loading page…</p>
  if (isError) return <p role="alert" className="py-10 text-center text-sm text-rose">{describeError(error)}</p>

  const { label, path } = SITE_PAGES[pageKey]
  const pending = dirty || page.hasUnpublishedChanges
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="published" hasUnpublishedChanges={pending} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"><ExternalLink className="h-3.5 w-3.5" /> View {label} page</a>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={!pending || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={!pending || publish.isPending}><Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : 'Publish'}</Button>
        </div>
      </div>
      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}
      <p className="mt-4 text-xs text-muted">Edit the text, links, images and prices below. The page layout and design are fixed: items can be reworded but not added or removed.</p>
      <div className="mt-4">
        <SiteContentForm content={content} onChange={(path2, value) => setContent((c) => setIn(c, path2, value))} />
      </div>
    </div>
  )
}

const GROUPS = [...new Set(SITE_PAGE_KEYS.map((key) => SITE_PAGES[key].group || 'Pages'))]

/**
 * Content → Menus → Site pages: the website's bespoke-design pages (Accueil, AtooSavoir, Tarification, À propos, Contact, …) and the hub pages
 * whose texts, links, images and prices are editable. All editors stay mounted (only the selected one
 * is shown) so switching pages never loses unsaved edits.
 */
export default function AdminCmsSitePagesTab() {
  const [active, setActive] = useState(SITE_PAGE_KEYS[0])
  // An editor is mounted the first time its tab is opened and then kept (hidden), so switching never loses unsaved edits
  // — but 16 big forms are not all built up front.
  const [opened, setOpened] = useState(() => new Set([SITE_PAGE_KEYS[0]]))
  const open = (key) => { setActive(key); setOpened((o) => (o.has(key) ? o : new Set(o).add(key))) }
  return (
    <div>
      <div className="mb-5 space-y-3" role="tablist" aria-label="Site pages">
        {GROUPS.map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-2">
            <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{group}</span>
            {SITE_PAGE_KEYS.filter((key) => (SITE_PAGES[key].group || 'Pages') === group).map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active === key}
                onClick={() => open(key)}
                className={cn('rounded-md border px-3 py-1.5 text-sm', active === key ? 'border-ink bg-ink text-paper' : 'border-ink/12 hover:bg-ink/[0.04]')}
              >
                {SITE_PAGES[key].label}
              </button>
            ))}
          </div>
        ))}
      </div>
      {SITE_PAGE_KEYS.filter((key) => opened.has(key)).map((key) => (
        <div key={key} hidden={active !== key}><SitePageEditor pageKey={key} /></div>
      ))}
    </div>
  )
}
