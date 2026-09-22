import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check } from 'lucide-react'
import { createAdminPage, fetchAdminMenu, fetchTemplates } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { slugify } from '@/utils/slugify'
import RichTextEditor from '@/components/cms/RichTextEditor'
import Button from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'

function StepHeading({ id, n, done, children }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-sm font-semibold">
      <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px]', done ? 'bg-emerald text-white' : 'bg-ink text-paper')}>
        {done ? <Check className="h-3.5 w-3.5" /> : n}
      </span>
      {children}
    </h2>
  )
}

export default function AdminCmsPageNew() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: templates = [], isLoading, isError, error: loadError } = useQuery({ queryKey: ['cms', 'templates'], queryFn: fetchTemplates })
  const { data: menu } = useQuery({ queryKey: ['cms', 'admin', 'menu', 'main'], queryFn: () => fetchAdminMenu('main') })

  const [templateKey, setTemplateKey] = useState('')
  const [section, setSection] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [menuId, setMenuId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [navLabel, setNavLabel] = useState('')
  const [tags, setTags] = useState([])
  const [content, setContent] = useState({})
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState('')

  // Only templates flagged as creatable are ever used — there is no "custom" option. The admin never
  // picks a template: choosing where the page belongs (its section) decides the design, and the
  // template behind it is found automatically (every section belongs to exactly one template).
  const choices = useMemo(() => templates.filter((t) => t.creatable), [templates])
  const groups = useMemo(() => {
    const byMenu = new Map()
    for (const t of choices) for (const s of t.sections) byMenu.set(s.menu, [...(byMenu.get(s.menu) || []), { ...s, templateKey: t.key }])
    return [...byMenu]
  }, [choices])
  const template = choices.find((t) => t.key === templateKey)
  const sectionDef = template?.sections.find((s) => s.key === section)
  const address = template && sectionDef ? template.pathPattern.replace(':section', section).replace(':slug', slug || '…') : ''

  // Mega menus the page can be placed in (draft and live copies, disabled ones excluded).
  const megaMenus = useMemo(() => {
    const seen = new Map()
    for (const v of [menu?.draft?.items, menu?.live?.items]) for (const it of v || []) if (it.kind === 'mega' && it.enabled !== false && !seen.has(it.id)) seen.set(it.id, it)
    return [...seen.values()]
  }, [menu])
  const chosenMenu = megaMenus.find((m) => m.id === menuId)

  const pickSection = (s) => {
    const t = choices.find((c) => c.key === s.templateKey)
    setTemplateKey(t.key)
    setSection(s.key)
    setTags([])
    // The hero label (and any other field with a default) starts exactly as on the existing pages of the section.
    setContent(Object.fromEntries(t.fields.map((f) => [f.key, t.defaults?.[f.key] ?? ''])))
    // Suggest the menu this section normally belongs to (still editable, and optional).
    const suggested = megaMenus.find((m) => m.label.toLowerCase() === s.menu.toLowerCase())
    setMenuId(suggested?.id || ''); setGroupId('')
  }

  const create = useMutation({
    mutationFn: () =>
      createAdminPage({
        templateKey, section, title, slug, content,
        seo: { title: seoTitle, description: seoDescription },
        navLabel, tags,
        ...(menuId && groupId ? { menu: { menuId, groupId } } : {}),
        publish: status === 'published',
      }),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['cms', 'admin'] })
      qc.invalidateQueries({ queryKey: ['cms', 'navigation'] })
      navigate(`/app/admin/cms/pages/${page.id}`)
    },
    onError: (err) => setError(describeError(err)),
  })

  const ready = template && sectionDef && title.trim() && slug && (!menuId || groupId)

  return (
    <div className="max-w-3xl">
      <Link to="/app/admin/cms/pages" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Pages</Link>
      <p className="eyebrow mt-5 text-purple">Content</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Add page</h1>
      <p className="mt-2 text-sm text-muted">Every page uses the existing design of the section you choose. You supply the content; the website decides how it looks.</p>

      <form className="mt-8 space-y-9" onSubmit={(e) => { e.preventDefault(); setError(''); if (ready) create.mutate() }}>
        {/* 1 · Section (decides the design) */}
        <section aria-labelledby="step-section">
          <StepHeading id="step-section" n={1} done={Boolean(sectionDef)}>Section</StepHeading>
          <p className="mt-1 text-xs text-muted">Choose where the page belongs on the website. It automatically uses that section’s existing design — you only supply the content.</p>
          {isLoading && <p className="mt-3 text-sm text-muted">Loading sections…</p>}
          {isError && <p role="alert" className="mt-3 text-sm text-rose">{describeError(loadError)}</p>}
          <div className="mt-3 space-y-4" role="radiogroup" aria-labelledby="step-section">
            {groups.map(([menuLabel, sections]) => (
              <div key={menuLabel}>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{menuLabel}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sections.map((s) => (
                    <button key={s.key} type="button" role="radio" aria-checked={section === s.key} onClick={() => pickSection(s)}
                      className={cn('rounded-lg border px-4 py-3 text-left transition-colors', section === s.key ? 'border-ink bg-card shadow-soft' : 'border-ink/12 bg-card hover:border-ink/30')}>
                      <span className="block text-sm font-medium">{s.label}</span>
                      <span className="block font-mono text-[11px] text-ink/50">{choices.find((t) => t.key === s.templateKey)?.pathPattern.replace(':section', s.key)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">New sections and designs cannot be created here — they are part of the website itself.</p>
        </section>

        {template && sectionDef && (
          <>
            {/* 3 · Name + address */}
            <section aria-labelledby="step-name">
              <StepHeading id="step-name" n={2} done={Boolean(title.trim() && slug)}>Page name and address</StepHeading>
              <div className="mt-3 space-y-4">
                <label className="block">
                  <span className={LABEL}>Page name</span>
                  <input value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)) }} className="input !rounded-md" placeholder="e.g. Formation aux nouvelles obligations du CSE" maxLength={200} autoFocus />
                </label>
                <label className="block">
                  <span className={LABEL}>Slug (address)</span>
                  <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)) }} className="input !rounded-md font-mono" maxLength={100} />
                  <span className="mt-1.5 block font-mono text-xs text-ink/60">{address}</span>
                </label>
              </div>
            </section>

            {/* 4 · Menu placement */}
            <section aria-labelledby="step-menu">
              <StepHeading id="step-menu" n={3} done={Boolean(menuId && groupId)}>Main menu</StepHeading>
              <p className="mt-1 text-xs text-muted">Optional. When the page is published it appears in the chosen menu group automatically — no other change needed. Unpublishing removes it again.</p>
              {megaMenus.length === 0 ? (
                <p className="mt-3 text-sm text-muted">The main menu has not been set up yet, so pages can’t be placed in it. You can do that later from the page’s settings.</p>
              ) : (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={LABEL}>Main menu</span>
                    <select value={menuId} onChange={(e) => { setMenuId(e.target.value); setGroupId('') }} aria-label="Main menu" className="input !rounded-md">
                      <option value="">Not shown in the main menu</option>
                      {megaMenus.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </label>
                  {chosenMenu && (
                    <label className="block">
                      <span className={LABEL}>Group</span>
                      <select value={groupId} onChange={(e) => setGroupId(e.target.value)} aria-label="Menu group" className="input !rounded-md">
                        <option value="">Choose a group…</option>
                        {chosenMenu.groups.map((g) => <option key={g.id} value={g.id}>{g.heading}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              )}
              {menuId && !groupId && (
                <p role="status" className="mt-3 rounded-md border border-golden/40 bg-golden/10 px-3 py-2 text-xs text-ink/80">
                  Choose which group of “{chosenMenu?.label}” the page belongs to — or set the main menu to “Not shown in the main menu” — before creating it.
                </p>
              )}
              <label className="mt-4 block">
                <span className={LABEL}>Navigation label (optional)</span>
                <input value={navLabel} onChange={(e) => setNavLabel(e.target.value)} className="input !rounded-md" maxLength={120} placeholder="A shorter name for menus and side navigation — defaults to the page name" />
              </label>
              {template.tagOptions.length > 0 && (
                <fieldset className="mt-4">
                  <legend className={LABEL}>Listings</legend>
                  {template.tagOptions.map((t) => (
                    <label key={t.key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={tags.includes(t.key)} onChange={(e) => setTags((cur) => (e.target.checked ? [...cur, t.key] : cur.filter((k) => k !== t.key)))} className="h-4 w-4 rounded border-ink/30" />
                      {t.label}
                    </label>
                  ))}
                </fieldset>
              )}
            </section>

            {/* 5 · Content */}
            <section aria-labelledby="step-content">
              <StepHeading id="step-content" n={4} done={false}>Content</StepHeading>
              <div className="mt-3 space-y-5">
                {template.fields.map((f) =>
                  f.type === 'richtext' ? (
                    <div key={f.key}>
                      <span className={LABEL}>{f.label}</span>
                      <RichTextEditor value={content[f.key] ?? ''} onChange={(v) => setContent((c) => ({ ...c, [f.key]: v }))} label={f.label} />
                      {f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
                    </div>
                  ) : (
                    <label key={f.key} className="block">
                      <span className={LABEL}>{f.label}</span>
                      <input value={content[f.key] ?? ''} onChange={(e) => setContent((c) => ({ ...c, [f.key]: e.target.value }))} maxLength={f.maxLength} className="input !rounded-md" />
                      {f.help && <span className="mt-1.5 block text-xs text-muted">{f.help}</span>}
                    </label>
                  ),
                )}
              </div>
            </section>

            {/* 6 · SEO */}
            <section aria-labelledby="step-seo">
              <StepHeading id="step-seo" n={5} done={false}>Search & sharing</StepHeading>
              <div className="mt-3 grid gap-4">
                <label className="block"><span className={LABEL}>SEO title</span><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={120} className="input !rounded-md" placeholder="Defaults to the page name" /></label>
                <label className="block"><span className={LABEL}>SEO description</span><textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} maxLength={320} rows={3} className="input resize-none !rounded-md" placeholder="Defaults to the first paragraph" /></label>
              </div>
            </section>

            {/* 6 · Status */}
            <section aria-labelledby="step-status">
              <StepHeading id="step-status" n={6} done={false}>Status</StepHeading>
              <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="step-status">
                {[['draft', 'Save as draft', 'Not visible to visitors. Preview it, then publish when ready.'], ['published', 'Publish now', 'Visible to visitors straight away (and in its menu, if you chose one).']].map(([v, l, d]) => (
                  <button key={v} type="button" role="radio" aria-checked={status === v} onClick={() => setStatus(v)}
                    className={cn('rounded-lg border px-4 py-3 text-left transition-colors', status === v ? 'border-ink bg-card shadow-soft' : 'border-ink/12 bg-card hover:border-ink/30')}>
                    <span className="block text-sm font-medium">{l}</span>
                    <span className="block text-xs text-muted">{d}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {error && <p role="alert" className="rounded-md border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose">{error}</p>}

        <div className="flex items-center gap-3 border-t border-ink/10 pt-5">
          <Button type="submit" variant="accent" size="sm" className="rounded-md" disabled={!ready || create.isPending}>
            {create.isPending ? 'Creating…' : status === 'published' ? 'Create and publish' : 'Create draft page'}
          </Button>
          <Link to="/app/admin/cms/pages" className="text-sm text-muted hover:text-ink">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
