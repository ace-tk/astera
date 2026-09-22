import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Download, Rocket, Save, Undo2 } from 'lucide-react'
import {
  fetchAdminMenu, saveAdminMenuDraft, publishAdminMenu, discardAdminMenu, initializeAdminMenu,
  fetchAdminPages, fetchSectionNavList, fetchSectionNav, saveSectionNavDraft, initializeSectionNav, publishSectionNav, discardSectionNav,
  saveAdminDraft, fetchTemplates,
} from '@/services/cms'
import { describeError } from '@/cms/errors'
import { clone, pageLink, routeLink } from '@/cms/navIds'
import { toMenuItems, toSectionEntries } from '@/cms/navConvert'
import { ATOOPV_NAV } from '@/constants/content'
import { CATEGORY_NAV } from '@/constants/servicesNav'
import { RESSOURCES_NAV } from '@/constants/resourcesNav'
import { useToast } from '@/context/ToastContext'
import EntryListEditor from '@/components/cms/nav/EntryListEditor'
import LinkTarget from '@/components/cms/nav/LinkTarget'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'
const SECTION_LABELS = {
  drafting: 'Rédaction PV', 'by-city': 'Par ville', 'tarifs-infos': 'Tarifs & Infos', training: 'Formations',
  communication: 'Communication', guides: 'Guides pratiques', ressources: 'Ressources',
}
const BUILT_IN_SECTIONS = { ...CATEGORY_NAV, ressources: RESSOURCES_NAV }

function usePagesIndex() {
  const { data: pages = [] } = useQuery({ queryKey: ['cms', 'admin', 'pages', {}], queryFn: () => fetchAdminPages({}) })
  const pagesById = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages])
  return { pages, pagesById }
}

export default function AdminCmsMenus() {
  const [tab, setTab] = useState('menu')
  return (
    <div>
      <p className="eyebrow text-purple">Content</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Menus</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        The site’s main menus are fixed. Here you manage the pages inside them and the order they appear in — the menus themselves and their look are part of the website.
      </p>

      <div role="tablist" aria-label="Menu areas" className="mt-6 inline-flex gap-1 rounded-lg border border-ink/10 bg-card p-1">
        {[['menu', 'Main menu'], ['side', 'Side navigation']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn('h-8 rounded-md px-3.5 text-sm font-medium', tab === id ? 'bg-ink text-paper' : 'text-ink/70 hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === 'menu' ? <MainMenuTab /> : <SideNavTab />}</div>
    </div>
  )
}

/* ============================================================================
 *  Main menu
 *
 *  The menus are FIXED: which menus exist, their names, order, type, colour,
 *  illustration, groups and group headings are part of the website's design (and the
 *  server refuses to change them). Here an admin manages only what sits inside them:
 *  the links in each group, the mobile list, and the texts / links of the panels.
 * ========================================================================== */

function MainMenuTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { pages, pagesById } = usePagesIndex()
  const { data: menu, isLoading, isError, error } = useQuery({ queryKey: ['cms', 'admin', 'menu', 'main'], queryFn: () => fetchAdminMenu('main'), staleTime: 0 })

  const [items, setItems] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (menu && !items) {
      setItems(clone(menu.draft.items))
      setSelectedId(menu.draft.items[0]?.id || null)
    }
  }, [menu, items])

  const dirty = Boolean(menu && items && JSON.stringify(items) !== JSON.stringify(menu.draft.items))
  const selected = items?.find((i) => i.id === selectedId) || null

  const applyServer = (m) => {
    qc.setQueryData(['cms', 'admin', 'menu', 'main'], m)
    qc.invalidateQueries({ queryKey: ['cms', 'navigation'] })
    setItems(clone(m.draft.items))
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveAdminMenuDraft('main', items, menu.rev), onSuccess: (m) => { applyServer(m); toast({ title: 'Menu draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminMenuDraft('main', items, menu.rev)
      return publishAdminMenu('main')
    },
    onSuccess: (m) => { applyServer(m); toast({ title: 'Menu published', description: 'The site navigation now shows these changes.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardAdminMenu('main'), onSuccess: (m) => { applyServer(m); setSelectedId(m.draft.items[0]?.id || null); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })
  const importBuiltIn = useMutation({
    mutationFn: () => initializeAdminMenu('main', toMenuItems(ATOOPV_NAV)),
    onSuccess: (m) => { applyServer(m); setSelectedId(m.draft.items[0]?.id || null); toast({ title: 'Built-in menu imported', description: 'The site looks exactly the same — you can now edit it here.', color: 'emerald' }) },
    onError: fail,
  })
  const removeFromMenu = useMutation({
    mutationFn: (pageId) => saveAdminDraft(pageId, { menu: null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cms', 'admin'] }); qc.invalidateQueries({ queryKey: ['cms', 'navigation'] }); toast({ title: 'Removed from the menu', color: 'emerald' }) },
    onError: fail,
  })

  const update = (id, part) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...part } : i)))
  const updateGroup = (itemId, gid, part) => setItems((list) => list.map((i) => (i.id === itemId ? { ...i, groups: i.groups.map((g) => (g.id === gid ? { ...g, ...part } : g)) } : i)))

  if (isLoading || !items) return <p className="py-10 text-center text-sm text-muted">Loading menus…</p>
  if (isError) return <p role="alert" className="py-10 text-center text-sm text-rose">{describeError(error)}</p>

  const placedIn = (itemId, gid) => pages.filter((p) => p.menu?.menuId === itemId && p.menu?.groupId === gid)

  /* ------------------------------ empty state ------------------------------ */
  if (items.length === 0 && menu.draft.items.length === 0 && menu.live.items.length === 0) {
    return (
      <div className="max-w-2xl rounded-lg border border-ink/10 bg-card p-6">
        <h2 className="text-base font-semibold">Set up the main menu</h2>
        <p className="mt-2 text-sm text-muted">
          The website currently shows its built-in menu. Import it once and the pages inside it become editable here — nothing on the site changes when you do.
        </p>
        <Button variant="accent" size="sm" className="mt-4 rounded-md" onClick={() => importBuiltIn.mutate()} disabled={importBuiltIn.isPending}>
          <Download className="h-4 w-4" /> {importBuiltIn.isPending ? 'Importing…' : 'Import the built-in menu'}
        </Button>
        {problem && <p role="alert" className="mt-3 text-sm text-rose">{problem}</p>}
      </div>
    )
  }

  return (
    <div>
      {/* ── Action bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="published" hasUnpublishedChanges={dirty || menu.hasUnpublishedChanges} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={(!dirty && !menu.hasUnpublishedChanges) || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={(!dirty && !menu.hasUnpublishedChanges) || publish.isPending}><Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : 'Publish menu'}</Button>
        </div>
      </div>
      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
        {/* ── Menu list (fixed) ──────────────────────────────── */}
        <section aria-label="Main menus">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Main menus</h2>
          <ul className="mt-3 space-y-1.5">
            {items.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(it.id)}
                  aria-current={selectedId === it.id ? 'true' : undefined}
                  className={cn('block w-full rounded-lg border px-3 py-2.5 text-left', selectedId === it.id ? 'border-ink bg-card shadow-soft' : 'border-ink/10 bg-card/60 hover:border-ink/25')}
                >
                  <span className="block truncate text-sm font-medium">{it.label}</span>
                  <span className="block text-[11px] text-muted">{it.kind === 'mega' ? `${it.groups.length} group${it.groups.length === 1 ? '' : 's'}` : 'Direct link — nothing to manage'}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            The main menus are fixed parts of the website: they can’t be added, removed, renamed or reordered here. “Story” and “Design Test” are part of the site itself.
          </p>
        </section>

        {/* ── Selected menu ──────────────────────────────────── */}
        {selected ? (
          <section aria-label={`Edit ${selected.label}`} className="min-w-0 space-y-5">
            <div className="rounded-lg border border-ink/10 bg-card p-4">
              <h2 className="font-display text-xl font-semibold tracking-tight">{selected.label}</h2>
              <p className="mt-1 text-xs text-muted">
                {selected.kind === 'mega'
                  ? 'Fixed menu. You manage the pages inside each group below; the groups, their headings and the menu’s look are part of the website.'
                  : 'This menu is a direct link. It has no pages inside it to manage.'}
              </p>
            </div>

            {selected.kind === 'mega' && (
              <>
                {selected.groups.map((g) => {
                  const placed = placedIn(selected.id, g.id)
                  return (
                    <div key={g.id} className="rounded-lg border border-ink/10 bg-card p-4">
                      <h3 className="text-sm font-semibold">{g.heading}</h3>
                      <div className="mt-3">
                        <EntryListEditor
                          entries={g.entries}
                          onChange={(entries) => updateGroup(selected.id, g.id, { entries })}
                          pagesById={pagesById}
                          pages={pages}
                          label={`Links in ${g.heading}`}
                          idPrefix="e"
                        />
                      </div>
                      {placed.length > 0 && (
                        <div className="mt-3 rounded-md border border-royal/20 bg-royal/[0.04] p-3">
                          <p className="text-xs font-medium">Pages placed here from their own settings</p>
                          <p className="mt-0.5 text-[11px] text-muted">They appear after the links above once published, and disappear automatically if unpublished.</p>
                          <ul className="mt-2 space-y-1">
                            {placed.map((p) => (
                              <li key={p.id} className="flex items-center gap-2 text-xs">
                                <Link to={`/app/admin/cms/pages/${p.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-royal">{p.navLabel || p.title}</Link>
                                <StatusBadge status={p.status} />
                                <button type="button" onClick={() => removeFromMenu.mutate(p.id)} className="shrink-0 rounded px-2 py-1 font-medium text-rose hover:bg-rose/10" aria-label={`Remove ${p.title} from this menu`}>Remove from menu</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })}

                <MegaExtras item={selected} update={update} pages={pages} />

                <div className="rounded-lg border border-ink/10 bg-card p-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Mobile menu list</h3>
                  <p className="mt-1 text-xs text-muted">The short list shown when this menu is opened on a phone. Newly placed pages are added to it automatically.</p>
                  <div className="mt-3">
                    <EntryListEditor entries={selected.mobile} onChange={(mobile) => update(selected.id, { mobile })} pagesById={pagesById} pages={pages} label="Mobile links" idPrefix="m" />
                  </div>
                </div>
              </>
            )}
          </section>
        ) : (
          <p className="rounded-lg border border-dashed border-ink/15 px-4 py-10 text-center text-sm text-muted">Select a menu to edit it.</p>
        )}
      </div>
    </div>
  )
}

/** The texts and links of the call-to-action and city panels beside a mega menu's groups. Whether a panel exists, and its look, are fixed. */
function MegaExtras({ item, update, pages }) {
  const published = pages.filter((p) => p.status === 'published')
  const cta = item.cta
  const cities = item.cities
  const setCta = (part) => update(item.id, { cta: { ...cta, ...part } })
  const setCities = (part) => update(item.id, { cities: { ...cities, ...part } })
  return (
    <>
      {cta && (
        <div className="rounded-lg border border-ink/10 bg-card p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Call to action</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={LABEL}>Small heading</span><input value={cta.eyebrow || ''} onChange={(e) => setCta({ eyebrow: e.target.value })} aria-label="Call to action small heading" maxLength={80} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>Button label</span><input value={cta.buttonLabel || ''} onChange={(e) => setCta({ buttonLabel: e.target.value })} aria-label="Call to action button label" maxLength={60} className="input !rounded-md" /></label>
            <label className="block sm:col-span-2"><span className={LABEL}>Text</span><input value={cta.title || ''} onChange={(e) => setCta({ title: e.target.value })} aria-label="Call to action text" maxLength={160} className="input !rounded-md" /></label>
            <div className="sm:col-span-2"><span className={LABEL}>Button goes to</span><LinkTarget label="Call to action link" value={cta.link || routeLink('/')} onChange={(link) => setCta({ link })} pages={published} /></div>
          </div>
        </div>
      )}

      {cities && (
        <div className="rounded-lg border border-ink/10 bg-card p-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Side panel</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={LABEL}>Heading</span><input value={cities.heading} onChange={(e) => setCities({ heading: e.target.value })} aria-label="Side panel heading" maxLength={80} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>Link label</span><input value={cities.linkLabel} onChange={(e) => setCities({ linkLabel: e.target.value })} aria-label="Side panel link label" maxLength={80} className="input !rounded-md" /></label>
            <label className="block sm:col-span-2"><span className={LABEL}>Text</span><textarea value={cities.label} onChange={(e) => setCities({ label: e.target.value })} aria-label="Side panel text" rows={2} maxLength={300} className="input resize-none !rounded-md" /></label>
            <div className="sm:col-span-2"><span className={LABEL}>Link goes to</span><LinkTarget label="Side panel link" value={cities.link || routeLink('/')} onChange={(link) => setCities({ link })} pages={published} /></div>
          </div>
        </div>
      )}
    </>
  )
}

/* ============================================================================
 *  Side navigation (also the order of the previous / next links)
 * ========================================================================== */

function SideNavTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { pages, pagesById } = usePagesIndex()
  const { data: list = [] } = useQuery({ queryKey: ['cms', 'admin', 'section-navs'], queryFn: fetchSectionNavList })
  const { data: templates = [] } = useQuery({ queryKey: ['cms', 'templates'], queryFn: fetchTemplates, staleTime: 5 * 60_000 })
  const sectionKeys = list.map((s) => s.section)
  const [section, setSection] = useState('training')

  const { data: nav, isLoading } = useQuery({ queryKey: ['cms', 'admin', 'section-nav', section], queryFn: () => fetchSectionNav(section), staleTime: 0 })
  const [entries, setEntries] = useState(null)
  const [problem, setProblem] = useState('')

  // Published pages of this section that aren't in the saved list yet are offered at the end, so they can be positioned.
  const unlisted = (saved) => {
    const inList = new Set(saved.filter((e) => e.link.type === 'page').map((e) => e.link.pageId))
    return pages
      .filter((p) => p.section === section && p.status === 'published' && p.showInNav && !inList.has(p.id))
      .map((p) => ({ id: `p-${p.id.slice(-10)}`, label: '', link: pageLink(p.id) })) // stable id: keeps the dirty check honest
  }

  useEffect(() => { setEntries(null); setProblem('') }, [section])
  useEffect(() => {
    if (nav && nav.section === section && !entries && (pages.length >= 0)) setEntries([...clone(nav.draft.entries), ...(nav.configured ? unlisted(nav.draft.entries) : [])])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, entries, section, pages])

  const dirty = Boolean(nav?.configured && entries && JSON.stringify(entries) !== JSON.stringify([...nav.draft.entries, ...unlisted(nav.draft.entries)]))
  const applyServer = (n) => {
    qc.setQueryData(['cms', 'admin', 'section-nav', section], n)
    qc.invalidateQueries({ queryKey: ['cms', 'admin', 'section-navs'] })
    qc.invalidateQueries({ queryKey: ['cms', 'navigation'] })
    setEntries(null)
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveSectionNavDraft(section, entries, nav.rev), onSuccess: (n) => { applyServer(n); toast({ title: 'Draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => { if (dirty) await saveSectionNavDraft(section, entries, nav.rev); return publishSectionNav(section) },
    onSuccess: (n) => { applyServer(n); toast({ title: 'Published', description: 'Side navigation and previous/next links now follow this order.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardSectionNav(section), onSuccess: (n) => { applyServer(n); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })
  const setup = useMutation({
    mutationFn: () => initializeSectionNav(section, toSectionEntries(BUILT_IN_SECTIONS[section] || [])),
    onSuccess: (n) => { applyServer(n); toast({ title: 'Ordering set up', description: 'The page order now matches the built-in list, ready to edit.', color: 'emerald' }) },
    onError: fail,
  })

  const sectionLabel = (k) => templates.flatMap((t) => t.sections).find((s) => s.key === k)?.label || SECTION_LABELS[k] || k

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Section</span>
          <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Section" className="input !h-9 !w-auto !rounded-md !py-1">
            {sectionKeys.map((k) => <option key={k} value={k}>{sectionLabel(k)}</option>)}
          </select>
        </label>
        {nav?.configured && (
          <>
            <StatusBadge status="published" hasUnpublishedChanges={dirty || nav.hasUnpublishedChanges} />
            {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={(!dirty && !nav.hasUnpublishedChanges) || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
              <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> Save draft</Button>
              <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={(!dirty && !nav.hasUnpublishedChanges) || publish.isPending}><Rocket className="h-4 w-4" /> Publish order</Button>
            </div>
          </>
        )}
      </div>

      {problem && <p role="alert" className="mt-4 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">{problem}</p>}

      <div className="mt-5 max-w-3xl">
        {isLoading || !nav ? (
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        ) : !nav.configured ? (
          <div className="rounded-lg border border-ink/10 bg-card p-6">
            <h2 className="text-base font-semibold">{sectionLabel(section)} — page order</h2>
            <p className="mt-2 text-sm text-muted">
              This section shows the site’s built-in page list, and pages you publish are added at the end automatically. To reorder pages (and the previous / next links), set up the ordering once — the list stays exactly as it is today until you change it.
            </p>
            <Button variant="accent" size="sm" className="mt-4 rounded-md" onClick={() => setup.mutate()} disabled={setup.isPending}>
              <Download className="h-4 w-4" /> {setup.isPending ? 'Setting up…' : 'Set up ordering from the built-in list'}
            </Button>
          </div>
        ) : entries ? (
          <div className="rounded-lg border border-ink/10 bg-card p-4">
            <p className="mb-3 text-xs text-muted">This order drives the side navigation and the previous / next links on every page in the section. Pages that are not published are hidden automatically.</p>
            <EntryListEditor entries={entries} onChange={setEntries} pagesById={pagesById} pages={pages.filter((p) => p.section === section)} label={`${sectionLabel(section)} pages`} idPrefix="s" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
