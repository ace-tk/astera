import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Rocket, Save, Undo2 } from 'lucide-react'
import { fetchAdminLegalPages, saveAdminLegalPagesDraft, publishAdminLegalPages, discardAdminLegalPages } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { clone } from '@/cms/navIds'
import { useToast } from '@/context/ToastContext'
import RichTextEditor from '@/components/cms/RichTextEditor'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'

// Fixed set of exactly 4 pages — same "fixed structure" rule as the Homepage
// hero's 3 slides. `key` matches legalPagesContentSchema's object keys
// (server/src/cms/schemas.js); `path` is only shown as a reminder of where
// each one is live (the routes themselves are code, in App.jsx).
const PAGES = [
  { key: 'mentionsLegales', label: 'Mentions légales', path: '/mentions-legales' },
  { key: 'cgv', label: 'CGV', path: '/cgv' },
  { key: 'confidentialite', label: 'Politique de confidentialité', path: '/politique-de-confidentialite' },
  { key: 'cookies', label: 'Cookies', path: '/cookies' },
]

/**
 * The 4 footer legal pages' content (Content → Menus → Legal pages) — each
 * page's title, short lead and full body are editable here; the page shell
 * (hero layout, back link, footer) is part of the website design, same
 * "fixed structure, only content editable" rule as every other CMS tab.
 * Same draft → save → publish → discard workflow as the footer/homepage hero.
 */
export default function AdminCmsLegalPagesTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data: legalPages, isLoading, isError, error } = useQuery({ queryKey: ['cms', 'admin', 'legal-pages'], queryFn: fetchAdminLegalPages, staleTime: 0 })

  const [content, setContent] = useState(null)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (legalPages && !content) setContent(clone(legalPages.draft.content))
  }, [legalPages, content])

  const dirty = Boolean(legalPages && content && JSON.stringify(content) !== JSON.stringify(legalPages.draft.content))

  const applyServer = (d) => {
    qc.setQueryData(['cms', 'admin', 'legal-pages'], d)
    qc.invalidateQueries({ queryKey: ['cms', 'legal-pages'] })
    setContent(clone(d.draft.content))
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveAdminLegalPagesDraft(content, legalPages.rev), onSuccess: (d) => { applyServer(d); toast({ title: 'Legal pages draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminLegalPagesDraft(content, legalPages.rev)
      return publishAdminLegalPages()
    },
    onSuccess: (d) => { applyServer(d); toast({ title: 'Legal pages published', description: 'The public pages now show this content.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardAdminLegalPages(), onSuccess: (d) => { applyServer(d); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })

  const updatePage = (key, part) => setContent((c) => ({ ...c, [key]: { ...c[key], ...part } }))

  if (isLoading || !content) return <p className="py-10 text-center text-sm text-muted">Loading legal pages…</p>
  if (isError) return <p role="alert" className="py-10 text-center text-sm text-rose">{describeError(error)}</p>

  return (
    <div>
      {/* ── Action bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="published" hasUnpublishedChanges={dirty || legalPages.hasUnpublishedChanges} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={(!dirty && !legalPages.hasUnpublishedChanges) || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={(!dirty && !legalPages.hasUnpublishedChanges) || publish.isPending}><Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : 'Publish'}</Button>
        </div>
      </div>
      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}

      <div className="mt-5 space-y-4">
        {PAGES.map(({ key, label, path }) => (
          <div key={key} className="rounded-lg border border-ink/10 bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</h3>
              <span className="font-mono text-[10px] text-muted">{path}</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={LABEL}>Page title</span>
                <input
                  value={content[key].title}
                  onChange={(e) => updatePage(key, { title: e.target.value })}
                  maxLength={120}
                  className="input !h-9 !rounded-md !py-1.5 text-sm"
                />
              </label>
              <label className="block">
                <span className={LABEL}>Short lead (under the title)</span>
                <input
                  value={content[key].lead}
                  onChange={(e) => updatePage(key, { lead: e.target.value })}
                  maxLength={300}
                  className="input !h-9 !rounded-md !py-1.5 text-sm"
                />
              </label>
            </div>

            <div className="mt-3">
              <RichTextEditor
                label="Page body"
                value={content[key].body}
                onChange={(body) => updatePage(key, { body })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
