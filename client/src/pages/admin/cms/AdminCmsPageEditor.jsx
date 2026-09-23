import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Eye, Rocket, MoreHorizontal, EyeOff, Undo2, Copy, Trash2, ExternalLink, History, AlertTriangle } from 'lucide-react'
import {
  fetchAdminPage, fetchTemplates, fetchAdminMenu, saveAdminDraft, publishAdminPage, unpublishAdminPage, discardAdminDraft,
  duplicateAdminPage, archiveAdminPage, fetchPageRevisions, restorePageRevision, fetchPageUsages,
} from '@/services/cms'
import { describeError, isConflict } from '@/cms/errors'
import { useToast } from '@/context/ToastContext'
import RichTextEditor from '@/components/cms/RichTextEditor'
import { FRAGMENTS_INTRO_BASE, editorialTextOf } from '@/cms/fragmentsIntroContainer'
import { disassembleServiceArticle, assembleServiceArticle } from '@/cms/serviceArticleContainers'
import StatusBadge from '@/components/cms/StatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import { slugify } from '@/utils/slugify'
import { cn } from '@/utils/cn'

// The editable state of a page: its draft version, plus its navigation settings (page metadata).
const fromPage = (page) => ({
  title: page.draft.title,
  slug: page.draft.slug,
  content: { ...page.draft.content },
  seo: { title: page.draft.seo?.title || '', description: page.draft.seo?.description || '', noindex: Boolean(page.draft.seo?.noindex) },
  nav: {
    navLabel: page.navLabel || '',
    showInNav: page.showInNav !== false,
    tags: page.tags || [],
    menuId: page.menu?.menuId || '',
    groupId: page.menu?.groupId || '',
  },
})
const toPatch = (f) => ({
  title: f.title,
  slug: f.slug,
  content: f.content,
  seo: f.seo,
  navLabel: f.nav.navLabel,
  showInNav: f.nav.showInNav,
  tags: f.nav.tags,
  menu: f.nav.menuId && f.nav.groupId ? { menuId: f.nav.menuId, groupId: f.nav.groupId } : null,
})
const fmt = (d) => (d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')
const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'

export default function AdminCmsPageEditor() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { toast } = useToast()
  const menuRef = useRef(null)
  const [moreOpen, setMoreOpen] = useState(false)

  const { data: page, isLoading, isError, error } = useQuery({
    queryKey: ['cms', 'admin', 'page', id],
    queryFn: () => fetchAdminPage(id),
    staleTime: 0,
  })
  const { data: templates = [] } = useQuery({ queryKey: ['cms', 'templates'], queryFn: fetchTemplates, staleTime: 5 * 60_000 })
  const { data: revisions = [] } = useQuery({ queryKey: ['cms', 'admin', 'revisions', id], queryFn: () => fetchPageRevisions(id), enabled: Boolean(page) })
  const { data: menu } = useQuery({ queryKey: ['cms', 'admin', 'menu', 'main'], queryFn: () => fetchAdminMenu('main') })
  const template = templates.find((t) => t.key === page?.templateKey)
  const section = template?.sections.find((s) => s.key === page?.section)

  const [form, setForm] = useState(null)
  const [editorKey, setEditorKey] = useState(0) // bumped when the content is replaced from outside the editor
  const [problem, setProblem] = useState(null) // { text, conflict?, fields? }
  const [confirm, setConfirm] = useState(null) // 'unpublish' | 'discard' | 'remove'
  const [usages, setUsages] = useState(null)

  useEffect(() => {
    if (page && !form) setForm(fromPage(page))
  }, [page, form])

  // Option A container editing (Hero/Intro/Stats/Main/Topics/afterTopics/FAQ/afterFAQ): disassembled
  // ONCE per page load (and again whenever content is replaced from outside the editor, same signal
  // `editorKey` already uses for discard/restore) — NOT re-derived from `form.content.body` on every
  // keystroke. Re-parsing the body after every edit would break the round trip mid-edit: a stat
  // value or FAQ answer that is briefly empty while the admin is typing gets silently dropped by
  // `assembleServiceArticle`'s `join()`, which desyncs the extractors' pattern matching for every
  // OTHER container that render — corrupting fields the admin never touched. Holding the parsed
  // containers as their own state and only ever writing OUT to `form.content.body` (never reading
  // back from it) avoids that entirely, while Save/Preview/Publish/dirty-checking keep working
  // completely unchanged, since that field is kept in sync on every edit regardless.
  const [containers, setContainersState] = useState(null)
  useEffect(() => {
    if (!page || !form || !template) return
    const usesContainers = template.key === 'service-article' && page.section !== 'guides'
    setContainersState(usesContainers ? disassembleServiceArticle(page.section, form.slug, form.content.body ?? '') : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey, Boolean(form), template?.key])

  useEffect(() => {
    if (!moreOpen) return undefined
    const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setMoreOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMoreOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [moreOpen])

  const dirty = useMemo(() => Boolean(page && form && JSON.stringify(form) !== JSON.stringify(fromPage(page))), [page, form])

  useEffect(() => {
    if (!dirty) return undefined
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const apply = (next, { replaceEditor = false } = {}) => {
    qc.setQueryData(['cms', 'admin', 'page', id], next)
    qc.invalidateQueries({ queryKey: ['cms', 'admin', 'pages'] })
    qc.invalidateQueries({ queryKey: ['cms', 'admin', 'revisions', id] })
    qc.invalidateQueries({ queryKey: ['cms', 'navigation'] })
    setForm(fromPage(next))
    if (replaceEditor) setEditorKey((k) => k + 1)
    setProblem(null)
  }

  const onError = (err) => {
    setProblem({ text: describeError(err), conflict: isConflict(err), fields: err?.data?.issues?.fieldErrors || {} })
    toast({ title: isConflict(err) ? 'Someone else changed this page' : 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' })
  }

  const save = useMutation({
    mutationFn: () => saveAdminDraft(id, toPatch(form), page.rev),
    onSuccess: (p) => apply(p),
    onError,
  })

  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminDraft(id, toPatch(form), page.rev).then((p) => qc.setQueryData(['cms', 'admin', 'page', id], p))
      return publishAdminPage(id)
    },
    onSuccess: (p) => {
      apply(p)
      toast({ title: 'Published', description: 'The page is now live.', color: 'emerald' })
    },
    onError,
  })

  const done = (message, opts) => (p) => { setConfirm(null); apply(p, opts); toast({ title: message, color: 'emerald' }) }
  const failed = (err) => { setConfirm(null); onError(err) }

  const unpublish = useMutation({ mutationFn: () => unpublishAdminPage(id), onSuccess: done('Page unpublished'), onError: failed })
  const discard = useMutation({ mutationFn: () => discardAdminDraft(id), onSuccess: done('Changes discarded', { replaceEditor: true }), onError: failed })
  const remove = useMutation({
    mutationFn: () => archiveAdminPage(id, page.status === 'published' ? `/services/${page.section}` : undefined),
    onSuccess: done('Page removed'),
    onError: failed,
  })

  const duplicate = useMutation({
    mutationFn: () => duplicateAdminPage(id),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['cms', 'admin', 'pages'] })
      toast({ title: 'Copy created', description: 'Open it from the Pages list.', color: 'emerald' })
      window.location.assign(`/app/admin/cms/pages/${p.id}`)
    },
    onError,
  })

  const restoreRev = useMutation({
    mutationFn: (seq) => restorePageRevision(id, seq),
    onSuccess: (p) => { apply(p, { replaceEditor: true }); toast({ title: 'Earlier version loaded into the draft', description: 'Save or publish to keep it.', color: 'emerald' }) },
    onError,
  })

  const ask = async (kind) => {
    setMoreOpen(false)
    setConfirm(kind)
    setUsages(null)
    if (kind !== 'discard') {
      try { setUsages(await fetchPageUsages(id)) } catch { /* best effort */ }
    }
  }

  const draftPath = template && page ? template.pathPattern.replace(':section', page.section).replace(':slug', form?.slug || page.draft.slug) : ''
  const busy = save.isPending || publish.isPending

  const preview = async () => {
    const win = window.open('about:blank', '_blank') // opened synchronously so the browser allows it
    try {
      if (dirty) {
        const p = await saveAdminDraft(id, toPatch(form), page.rev)
        apply(p)
      }
      const url = `${draftPath}?preview=${page.id}`
      if (win) win.location.href = url
      else window.location.assign(url)
    } catch (err) {
      win?.close()
      onError(err)
    }
  }

  if (isLoading || (page && !form)) return <p className="py-16 text-center text-sm text-muted">Loading page…</p>
  if (isError) {
    return (
      <div className="py-16 text-center">
        <p role="alert" className="text-sm text-rose">{describeError(error, 'This page could not be loaded.')}</p>
        <Link to="/app/admin/cms/pages" className="mt-4 inline-block text-sm underline">Back to pages</Link>
      </div>
    )
  }

  const archived = page.status === 'archived'
  const setContent = (key, value) => setForm((f) => ({ ...f, content: { ...f.content, [key]: value } }))
  // Guides (and Ressources, a different template entirely) never had Stats/Topics/FAQ in their
  // design — they keep the single generic body field; every other Service Article section gets the
  // container view (`containers` state set up above).
  const usesContainers = template?.key === 'service-article' && page.section !== 'guides'
  const setContainers = (patch) => {
    const next = { ...containers, ...patch }
    setContainersState(next)
    setContent('body', assembleServiceArticle(next))
  }
  // The existing "FragmentsToDocument" intro this page's design renders above its hero (see
  // cms/fragmentsIntroContainer.js): only its wording is editable here. Lazily seeded from the
  // current hardcoded text on first edit, so simply opening the page never marks it dirty.
  const fiBase = FRAGMENTS_INTRO_BASE[form.slug]
  const fi = form.content.fragmentsIntro ?? (fiBase ? editorialTextOf(fiBase) : null)
  const setFi = (patch) => setContent('fragmentsIntro', { ...fi, ...patch })
  const setSeo = (key, value) => setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }))
  const setNav = (part) => setForm((f) => ({ ...f, nav: { ...f.nav, ...part } }))
  const megaMenus = (() => {
    const seen = new Map()
    for (const v of [menu?.draft?.items, menu?.live?.items]) for (const it of v || []) if (it.kind === 'mega' && it.enabled !== false && !seen.has(it.id)) seen.set(it.id, it)
    return [...seen.values()]
  })()
  const chosenMenu = megaMenus.find((m) => m.id === form.nav.menuId)
  const fieldError = (key) => problem?.fields?.[key]
  const slugChangedLive = page.status === 'published' && page.live && form.slug !== page.live.slug
  const usageText = () => {
    if (!usages) return ''
    const bits = []
    if (usages.menus.length) bits.push(`the ${usages.menus.join(', ')} menu`)
    if (usages.sectionNavs?.length) bits.push(`the side navigation of ${usages.sectionNavs.length} section${usages.sectionNavs.length > 1 ? 's' : ''}`)
    if (usages.pages.length) bits.push(`${usages.pages.length} other page${usages.pages.length > 1 ? 's' : ''}`)
    return bits.length ? ` It is referenced by ${bits.join(', ')}: it will disappear from menus and lists automatically, and links inside other pages will stop working.` : ''
  }

  return (
    <div>
      {/* ── Action bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-ink/10 bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/app/admin/cms/pages" onClick={(e) => { if (dirty && !window.confirm('You have unsaved changes. Leave without saving?')) e.preventDefault() }} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Pages
          </Link>
          <span className="hidden h-5 w-px bg-ink/12 sm:block" aria-hidden="true" />
          <StatusBadge status={page.status} hasUnpublishedChanges={page.hasUnpublishedChanges || (page.status === 'published' && dirty)} />
          {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || busy || archived}>
              <Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}
            </Button>
            <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={preview} disabled={busy || archived}>
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={busy || archived || (!dirty && page.status === 'published' && !page.hasUnpublishedChanges)}>
              <Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : page.status === 'published' ? 'Publish changes' : 'Publish'}
            </Button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-md border border-ink/12 text-ink/70 hover:bg-ink/[0.05]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {moreOpen && (
                <div role="menu" aria-label="Page actions" className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-lg border border-ink/12 bg-card p-1 shadow-float">
                  {page.status === 'published' && (
                    <button type="button" role="menuitem" onClick={() => ask('unpublish')} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-ink/[0.05]"><EyeOff className="h-4 w-4" /> Unpublish</button>
                  )}
                  {page.live && (
                    <button type="button" role="menuitem" onClick={() => ask('discard')} disabled={!dirty && !page.hasUnpublishedChanges} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-ink/[0.05] disabled:opacity-40"><Undo2 className="h-4 w-4" /> Discard changes</button>
                  )}
                  <button type="button" role="menuitem" onClick={() => { setMoreOpen(false); duplicate.mutate() }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-ink/[0.05]"><Copy className="h-4 w-4" /> Duplicate</button>
                  <button type="button" role="menuitem" onClick={() => ask('remove')} disabled={archived} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-rose hover:bg-rose/10 disabled:opacity-40"><Trash2 className="h-4 w-4" /> Remove page</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {problem && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{problem.text}</p>
            {problem.conflict && (
              <button type="button" className="mt-1.5 underline" onClick={async () => { const p = await fetchAdminPage(id); apply(p, { replaceEditor: true }) }}>
                Load the latest version (your unsaved edits will be replaced)
              </button>
            )}
          </div>
        </div>
      )}

      {archived && (
        <p className="mb-6 rounded-lg border border-ink/12 bg-ink/[0.04] px-4 py-3 text-sm text-ink/80">This page has been removed, so it can’t be edited. Restore it from the Pages list (filter “Removed”).</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ── Content ──────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          <label className="block">
            <span className={LABEL}>Page title</span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={archived}
              maxLength={200}
              className="input !rounded-md !py-3 !text-lg font-medium"
              aria-invalid={Boolean(fieldError('title'))}
            />
            {fieldError('title') && <span className="mt-1 block text-xs text-rose">{fieldError('title').join(' ')}</span>}
          </label>

          {template?.fields.filter((f) => !(usesContainers && f.key === 'body')).map((f) =>
            f.type === 'richtext' ? (
              <div key={f.key}>
                <span className={LABEL}>{f.label}</span>
                <RichTextEditor key={`${f.key}-${editorKey}`} value={form.content[f.key] ?? ''} onChange={(v) => setContent(f.key, v)} disabled={archived} error={fieldError(f.key)} label={f.label} />
                {f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
                {fieldError(f.key) && <p className="mt-1.5 text-xs text-rose">{fieldError(f.key).join(' ')}</p>}
              </div>
            ) : (
              <label key={f.key} className="block">
                <span className={LABEL}>{f.label}</span>
                <input
                  value={form.content[f.key] ?? ''}
                  onChange={(e) => setContent(f.key, e.target.value)}
                  disabled={archived}
                  maxLength={f.maxLength}
                  className="input !rounded-md"
                  aria-invalid={Boolean(fieldError(f.key))}
                />
                {f.help && <span className="mt-1.5 block text-xs text-muted">{f.help}</span>}
                {fieldError(f.key) && <span className="mt-1 block text-xs text-rose">{fieldError(f.key).join(' ')}</span>}
              </label>
            ),
          )}

          {containers && (
            <div className="space-y-6">
              {Boolean(containers.intro) && (
                <div>
                  <span className={LABEL}>Intro</span>
                  <RichTextEditor key={`intro-${editorKey}`} value={containers.intro} onChange={(v) => setContainers({ intro: v })} disabled={archived} label="Intro" />
                </div>
              )}

              {containers.stats && (
                <section aria-label="Stats">
                  <span className={LABEL}>Stats</span>
                  <div className="mt-1.5 space-y-2">
                    {containers.stats.map((s, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                          value={s.value}
                          onChange={(e) => setContainers({ stats: containers.stats.map((s2, idx) => (idx === i ? { ...s2, value: e.target.value } : s2)) })}
                          disabled={archived}
                          aria-label={`Stat ${i + 1} value`}
                          placeholder="Value"
                          className="input !h-9 !rounded-md text-sm"
                        />
                        <input
                          value={s.label}
                          onChange={(e) => setContainers({ stats: containers.stats.map((s2, idx) => (idx === i ? { ...s2, label: e.target.value } : s2)) })}
                          disabled={archived}
                          aria-label={`Stat ${i + 1} label`}
                          placeholder="Label"
                          className="input !h-9 !rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div>
                <span className={LABEL}>Main content</span>
                <RichTextEditor key={`main-${editorKey}`} value={containers.main} onChange={(v) => setContainers({ main: v })} disabled={archived} label="Main content" />
              </div>

              {containers.topics && (
                <section aria-label="Topics">
                  <span className={LABEL}>Topics</span>
                  <div className="mt-1.5 space-y-2">
                    {containers.topics.map((t, i) => (
                      <div key={i} className="grid grid-cols-[4rem_1fr] gap-2">
                        <input
                          value={t.icon}
                          onChange={(e) => setContainers({ topics: containers.topics.map((t2, idx) => (idx === i ? { ...t2, icon: e.target.value } : t2)) })}
                          disabled={archived}
                          aria-label={`Topic ${i + 1} icon`}
                          placeholder="Icon"
                          className="input !h-9 !rounded-md text-center text-sm"
                        />
                        <input
                          value={t.title}
                          onChange={(e) => setContainers({ topics: containers.topics.map((t2, idx) => (idx === i ? { ...t2, title: e.target.value } : t2)) })}
                          disabled={archived}
                          aria-label={`Topic ${i + 1} title`}
                          placeholder="Title"
                          className="input !h-9 !rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {containers.topics && Boolean(containers.afterTopics) && (
                <div>
                  <span className={LABEL}>Content after topics</span>
                  <RichTextEditor key={`afterTopics-${editorKey}`} value={containers.afterTopics} onChange={(v) => setContainers({ afterTopics: v })} disabled={archived} label="Content after topics" />
                </div>
              )}

              {containers.faq && (
                <section aria-label="FAQ">
                  <span className={LABEL}>FAQ</span>
                  <div className="mt-1.5 space-y-2">
                    {containers.faq.map((item, i) => (
                      <div key={i} className="space-y-1.5 rounded-md border border-ink/10 p-2.5">
                        <input
                          value={item.question}
                          onChange={(e) => setContainers({ faq: containers.faq.map((f2, idx) => (idx === i ? { ...f2, question: e.target.value } : f2)) })}
                          disabled={archived}
                          aria-label={`FAQ ${i + 1} question`}
                          placeholder="Question"
                          className="input !h-9 !rounded-md text-sm"
                        />
                        <textarea
                          value={item.answer}
                          onChange={(e) => setContainers({ faq: containers.faq.map((f2, idx) => (idx === i ? { ...f2, answer: e.target.value } : f2)) })}
                          disabled={archived}
                          rows={2}
                          aria-label={`FAQ ${i + 1} answer`}
                          placeholder="Answer"
                          className="input resize-y !rounded-md text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {containers.faq && Boolean(containers.afterFaq) && (
                <div>
                  <span className={LABEL}>Content after FAQ</span>
                  <RichTextEditor key={`afterFaq-${editorKey}`} value={containers.afterFaq} onChange={(v) => setContainers({ afterFaq: v })} disabled={archived} label="Content after FAQ" />
                </div>
              )}
            </div>
          )}

          {fi && (
            <section className="rounded-lg border border-ink/10 bg-card p-4" aria-label="Existing intro animation — text only">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Existing intro animation — text only</h2>
              <p className="mt-1 text-xs text-muted">This page has an animated intro above its hero. Only its wording can be edited here — the animation, positions and layout are fixed by the page design.</p>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className={LABEL}>Small heading</span>
                  <input value={fi.eyebrow} onChange={(e) => setFi({ eyebrow: e.target.value })} disabled={archived} maxLength={120} className="input !rounded-md" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {fi.titleLines.map((line, i) => (
                    <label key={i} className="block">
                      <span className={LABEL}>Title line {i + 1}</span>
                      <input value={line} onChange={(e) => setFi({ titleLines: fi.titleLines.map((l, idx) => (idx === i ? e.target.value : l)) })} disabled={archived} maxLength={60} className="input !rounded-md" />
                    </label>
                  ))}
                </div>

                <div>
                  <span className={LABEL}>Modules / themes</span>
                  <div className="mt-1.5 space-y-2">
                    {fi.fragments.map((frag, i) => (
                      <div key={i} className="grid gap-2 rounded-md border border-ink/10 p-2.5 sm:grid-cols-[7rem_1fr_7rem]">
                        <input value={frag.role} onChange={(e) => setFi({ fragments: fi.fragments.map((f2, idx) => (idx === i ? { ...f2, role: e.target.value } : f2)) })} disabled={archived} maxLength={40} aria-label={`Module ${i + 1} role`} placeholder="Role" className="input !h-9 !rounded-md text-sm" />
                        <input value={frag.text} onChange={(e) => setFi({ fragments: fi.fragments.map((f2, idx) => (idx === i ? { ...f2, text: e.target.value } : f2)) })} disabled={archived} maxLength={200} aria-label={`Module ${i + 1} text`} placeholder="Text" className="input !h-9 !rounded-md text-sm" />
                        <input value={frag.tag} onChange={(e) => setFi({ fragments: fi.fragments.map((f2, idx) => (idx === i ? { ...f2, tag: e.target.value } : f2)) })} disabled={archived} maxLength={40} aria-label={`Module ${i + 1} tag`} placeholder="Tag" className="input !h-9 !rounded-md text-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {fi.groups.map((g, i) => (
                    <label key={i} className="block">
                      <span className={LABEL}>Group {i + 1} label</span>
                      <input value={g.label} onChange={(e) => setFi({ groups: fi.groups.map((g2, idx) => (idx === i ? { label: e.target.value } : g2)) })} disabled={archived} maxLength={60} className="input !rounded-md" />
                    </label>
                  ))}
                </div>

                <label className="block">
                  <span className={LABEL}>Document label</span>
                  <input value={fi.documentLabel} onChange={(e) => setFi({ documentLabel: e.target.value })} disabled={archived} maxLength={60} className="input !rounded-md" />
                </label>

                <div>
                  <span className={LABEL}>Document rows</span>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    {fi.documentRows.map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input value={row.label} onChange={(e) => setFi({ documentRows: fi.documentRows.map((r2, idx) => (idx === i ? { ...r2, label: e.target.value } : r2)) })} disabled={archived} maxLength={40} aria-label={`Document row ${i + 1} label`} placeholder="Label" className="input !h-9 !rounded-md text-sm" />
                        <input value={row.text} onChange={(e) => setFi({ documentRows: fi.documentRows.map((r2, idx) => (idx === i ? { ...r2, text: e.target.value } : r2)) })} disabled={archived} maxLength={120} aria-label={`Document row ${i + 1} value`} placeholder="Value" className="input !h-9 !rounded-md text-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={LABEL}>Annotations</span>
                  <div className="mt-1.5 space-y-2">
                    {fi.annotations.map((a, i) => (
                      <input key={i} value={a} onChange={(e) => setFi({ annotations: fi.annotations.map((a2, idx) => (idx === i ? e.target.value : a2)) })} disabled={archived} maxLength={120} aria-label={`Annotation ${i + 1}`} className="input !rounded-md" />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className={LABEL}>Document meta</span>
                  <input value={fi.documentMeta} onChange={(e) => setFi({ documentMeta: e.target.value })} disabled={archived} maxLength={120} className="input !rounded-md" />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {fi.statement.map((s, i) => (
                    <label key={i} className="block">
                      <span className={LABEL}>Statement line {i + 1}</span>
                      <input value={s} onChange={(e) => setFi({ statement: fi.statement.map((s2, idx) => (idx === i ? e.target.value : s2)) })} disabled={archived} maxLength={80} className="input !rounded-md" />
                    </label>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Settings ─────────────────────────────────────────── */}
        <aside className="space-y-5" aria-label="Page settings">
          <section className="rounded-lg border border-ink/10 bg-card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Address</h2>
            <label className="mt-3 block">
              <span className="sr-only">Address (slug)</span>
              <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} disabled={archived} maxLength={100} className="input !rounded-md font-mono text-sm" />
            </label>
            <p className="mt-2 break-all font-mono text-xs text-ink/60">{draftPath}</p>
            {slugChangedLive && <p className="mt-2 text-xs text-ink/80">When you publish, the current address will redirect to the new one.</p>}
            {section && <p className="mt-3 text-xs text-muted">Section: {section.label}</p>}
            {page.status === 'published' && (
              <a href={page.path} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-royal hover:underline"><ExternalLink className="h-3.5 w-3.5" /> View live page</a>
            )}
            {page.legacy?.file && (
              <p className="mt-3 border-t border-ink/8 pt-3 text-xs text-muted">Migrated from <code className="font-mono">{page.legacy.file}</code>. The original file is kept as a safety copy.</p>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-card p-4" aria-label="Navigation">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Navigation</h2>
            <label className="mt-3 block">
              <span className={LABEL}>Navigation label</span>
              <input value={form.nav.navLabel} onChange={(e) => setNav({ navLabel: e.target.value })} disabled={archived} maxLength={120} className="input !rounded-md" placeholder="Defaults to the page name" aria-label="Navigation label" />
            </label>
            {megaMenus.length > 0 && (
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className={LABEL}>Main menu</span>
                  <select value={form.nav.menuId} onChange={(e) => setNav({ menuId: e.target.value, groupId: '' })} disabled={archived} aria-label="Main menu" className="input !rounded-md">
                    <option value="">Not shown in the main menu</option>
                    {megaMenus.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </label>
                {chosenMenu && (
                  <label className="block">
                    <span className={LABEL}>Group</span>
                    <select value={form.nav.groupId} onChange={(e) => setNav({ groupId: e.target.value })} disabled={archived} aria-label="Menu group" className="input !rounded-md">
                      <option value="">Choose a group…</option>
                      {chosenMenu.groups.map((g) => <option key={g.id} value={g.id}>{g.heading}</option>)}
                    </select>
                  </label>
                )}
              </div>
            )}
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.nav.showInNav} onChange={(e) => setNav({ showInNav: e.target.checked })} disabled={archived} className="h-4 w-4 rounded border-ink/30" aria-label="Show in side navigation" />
              Show in the section’s side navigation
            </label>
            {template?.tagOptions?.length > 0 && (
              <fieldset className="mt-3">
                <legend className={LABEL}>Listings</legend>
                {template.tagOptions.map((t) => (
                  <label key={t.key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.nav.tags.includes(t.key)} onChange={(e) => setNav({ tags: e.target.checked ? [...form.nav.tags, t.key] : form.nav.tags.filter((k) => k !== t.key) })} disabled={archived} className="h-4 w-4 rounded border-ink/30" />
                    {t.label}
                  </label>
                ))}
              </fieldset>
            )}
            <p className="mt-3 text-xs text-muted">Menus, side navigation, listings and previous/next links only ever show published pages — unpublishing removes this page from all of them.</p>
          </section>

          <section className="rounded-lg border border-ink/10 bg-card p-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Search & sharing</h2>
            <label className="mt-3 block">
              <span className={LABEL}>SEO title</span>
              <input value={form.seo.title} onChange={(e) => setSeo('title', e.target.value)} disabled={archived} maxLength={120} className="input !rounded-md" placeholder="Defaults to the page title" />
            </label>
            <label className="mt-3 block">
              <span className={LABEL}>SEO description</span>
              <textarea value={form.seo.description} onChange={(e) => setSeo('description', e.target.value)} disabled={archived} maxLength={320} rows={3} className="input resize-none !rounded-md" placeholder="Defaults to the first paragraph" />
              <span className="mt-1 block text-right text-[11px] text-muted">{form.seo.description.length}/320</span>
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.seo.noindex} onChange={(e) => setSeo('noindex', e.target.checked)} disabled={archived} className="h-4 w-4 rounded border-ink/30" />
              Hide from search engines
            </label>
          </section>

          <section className="rounded-lg border border-ink/10 bg-card p-4">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"><History className="h-3.5 w-3.5" /> History</h2>
            <p className="mt-2 text-xs text-muted">Published {fmt(page.publishedAt)}</p>
            {revisions.length === 0 ? (
              <p className="mt-3 text-xs text-muted">Versions appear here each time the page is published.</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {revisions.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate"><span className="font-medium capitalize">{r.kind}</span> · {fmt(r.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => { if (!dirty || window.confirm('Loading an earlier version replaces your unsaved edits. Continue?')) restoreRev.mutate(r.seq) }}
                      disabled={archived || restoreRev.isPending}
                      className={cn('shrink-0 rounded px-2 py-1 font-medium text-royal hover:bg-royal/10 disabled:opacity-40')}
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirm === 'unpublish'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => unpublish.mutate()}
        busy={unpublish.isPending}
        icon={EyeOff}
        color="golden"
        title="Unpublish this page?"
        description={`It will disappear from the public site straight away. Your draft is kept, and you can publish it again later.${usageText()}`}
        confirmLabel="Unpublish"
      />
      <ConfirmDialog
        open={confirm === 'discard'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => discard.mutate()}
        busy={discard.isPending}
        icon={Undo2}
        color="golden"
        title="Discard your changes?"
        description="Your draft goes back to exactly what is published. Your unsaved and saved edits since then are lost."
        confirmLabel="Discard changes"
      />
      <ConfirmDialog
        open={confirm === 'remove'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => remove.mutate()}
        busy={remove.isPending}
        danger
        icon={Trash2}
        title="Remove this page?"
        description={`It will be taken offline${page.status === 'published' ? ' and visitors of its address will be sent to the section page' : ''}. It is kept under “Removed” and can be restored.${usageText()}`}
        confirmLabel="Remove page"
      />
    </div>
  )
}
