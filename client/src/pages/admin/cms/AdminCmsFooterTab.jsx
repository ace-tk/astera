import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ChevronDown, ChevronUp, Facebook, Instagram, Linkedin, Link2, Plus, Rocket, Save, Trash2, Twitter, Undo2, Youtube } from 'lucide-react'
import { fetchAdminFooter, saveAdminFooterDraft, publishAdminFooter, discardAdminFooter } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { clone, newId } from '@/cms/navIds'
import { useToast } from '@/context/ToastContext'
import FooterEntryListEditor from '@/components/cms/nav/FooterEntryListEditor'
import FooterLinkTarget from '@/components/cms/nav/FooterLinkTarget'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'
const CARD = 'rounded-lg border border-ink/10 bg-card p-4'
const SOCIAL_ICONS = { linkedin: Linkedin, instagram: Instagram, facebook: Facebook, twitter: Twitter, youtube: Youtube, other: Link2 }

/**
 * The site footer's content — brand text, contact info, the call-to-action
 * button, the nav columns, the legal links, optional social links, and the
 * copyright/bottom-bar text. Same draft → save → publish → discard workflow
 * as the main menu (AdminCmsMenus.jsx) and side navigation, reusing the same
 * building blocks where the shape matches (StatusBadge, the save/publish/
 * discard action bar) and a footer-specific link editor where it doesn't
 * (footer links can be routes, external addresses, email, phone, or a plain
 * '#' placeholder — not just CMS pages/routes like the main menu).
 *
 * The footer's visual design (5-column grid, contact block, CTA button,
 * bottom bar) is fixed, same as the main menu's groups/colours are fixed —
 * this only edits the CONTENT that design renders.
 */
export default function AdminCmsFooterTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data: footer, isLoading, isError, error } = useQuery({ queryKey: ['cms', 'admin', 'footer'], queryFn: fetchAdminFooter, staleTime: 0 })

  const [content, setContent] = useState(null)
  const [problem, setProblem] = useState('')

  useEffect(() => {
    if (footer && !content) setContent(clone(footer.draft.content))
  }, [footer, content])

  const dirty = Boolean(footer && content && JSON.stringify(content) !== JSON.stringify(footer.draft.content))

  const applyServer = (f) => {
    qc.setQueryData(['cms', 'admin', 'footer'], f)
    qc.invalidateQueries({ queryKey: ['cms', 'footer'] })
    setContent(clone(f.draft.content))
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveAdminFooterDraft(content, footer.rev), onSuccess: (f) => { applyServer(f); toast({ title: 'Footer draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminFooterDraft(content, footer.rev)
      return publishAdminFooter()
    },
    onSuccess: (f) => { applyServer(f); toast({ title: 'Footer published', description: 'The public site now shows these changes.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardAdminFooter(), onSuccess: (f) => { applyServer(f); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })

  const set = (part) => setContent((c) => ({ ...c, ...part }))
  const setBrand = (part) => set({ brand: { ...content.brand, ...part } })
  const setContact = (part) => set({ contact: { ...content.contact, ...part } })
  const setCta = (part) => set({ cta: { ...content.cta, ...part } })

  if (isLoading || !content) return <p className="py-10 text-center text-sm text-muted">Loading footer…</p>
  if (isError) return <p role="alert" className="py-10 text-center text-sm text-rose">{describeError(error)}</p>

  return (
    <div>
      {/* ── Action bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="published" hasUnpublishedChanges={dirty || footer.hasUnpublishedChanges} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={(!dirty && !footer.hasUnpublishedChanges) || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={(!dirty && !footer.hasUnpublishedChanges) || publish.isPending}><Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : 'Publish footer'}</Button>
        </div>
      </div>
      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}

      <div className="mt-5 max-w-3xl space-y-5">
        {/* ── Brand ────────────────────────────────────────── */}
        <div className={CARD}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Brand</h3>
          <p className="mt-1 text-xs text-muted">The logo itself is part of the site design; its tagline and location text are editable here.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={LABEL}>Tagline</span><input value={content.brand.tagline} onChange={(e) => setBrand({ tagline: e.target.value })} aria-label="Brand tagline" maxLength={160} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>Location / entity</span><input value={content.brand.location} onChange={(e) => setBrand({ location: e.target.value })} aria-label="Brand location" maxLength={160} className="input !rounded-md" /></label>
          </div>
        </div>

        {/* ── Contact + CTA ────────────────────────────────── */}
        <div className={CARD}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Contact & call to action</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={LABEL}>Phone (shown text)</span><input value={content.contact.phoneDisplay} onChange={(e) => setContact({ phoneDisplay: e.target.value })} aria-label="Phone display text" maxLength={40} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>Phone link (tel:…)</span><input value={content.contact.phoneHref} onChange={(e) => setContact({ phoneHref: e.target.value })} aria-label="Phone link" placeholder="tel:+33…" maxLength={60} className="input !rounded-md font-mono text-sm" /></label>
            <label className="block sm:col-span-2"><span className={LABEL}>Email</span><input value={content.contact.email} onChange={(e) => setContact({ email: e.target.value })} aria-label="Contact email" maxLength={120} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>CTA button label</span><input value={content.cta.label} onChange={(e) => setCta({ label: e.target.value })} aria-label="Call to action label" maxLength={60} className="input !rounded-md" /></label>
            <div><span className={LABEL}>CTA button goes to</span><FooterLinkTarget label="Call to action link" value={content.cta.link} onChange={(link) => setCta({ link })} /></div>
          </div>
        </div>

        {/* ── Columns ──────────────────────────────────────── */}
        <ColumnsEditor columns={content.columns} onChange={(columns) => set({ columns })} />

        {/* ── Legal links ──────────────────────────────────── */}
        <div className={CARD}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Legal links</h3>
          <p className="mt-1 text-xs text-muted">Shown at the end of the last column. Point these at real pages whenever they exist — until then they can stay as they are.</p>
          <div className="mt-3">
            <FooterEntryListEditor entries={content.legalLinks} onChange={(legalLinks) => set({ legalLinks })} label="Legal links" idPrefix="legal" />
          </div>
        </div>

        {/* ── Social links ─────────────────────────────────── */}
        <SocialEditor social={content.social} onChange={(social) => set({ social })} />

        {/* ── Copyright ────────────────────────────────────── */}
        <div className={CARD}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Copyright & bottom bar</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={LABEL}>Copyright text</span><input value={content.copyrightText} onChange={(e) => set({ copyrightText: e.target.value })} aria-label="Copyright text" placeholder="© {year} …" maxLength={200} className="input !rounded-md" /></label>
            <label className="block"><span className={LABEL}>Bottom-right line</span><input value={content.bottomLine} onChange={(e) => set({ bottomLine: e.target.value })} aria-label="Bottom bar line" maxLength={200} className="input !rounded-md" /></label>
          </div>
          <p className="mt-2 text-[11px] text-muted">Use the literal text <code className="rounded bg-ink/[0.06] px-1 py-0.5">{'{year}'}</code> in the copyright text — it’s replaced with the current year automatically.</p>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
 *  Footer nav columns — add/remove columns, edit each one's title and links.
 * ========================================================================== */
function ColumnsEditor({ columns, onChange }) {
  const [openId, setOpenId] = useState(columns[0]?.id || null)

  const update = (id, part) => onChange(columns.map((c) => (c.id === id ? { ...c, ...part } : c)))
  const move = (i, d) => {
    const next = [...columns]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const remove = (id) => onChange(columns.filter((c) => c.id !== id))
  const add = () => {
    const col = { id: newId('col'), title: 'New column', links: [] }
    onChange([...columns, col])
    setOpenId(col.id)
  }

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Navigation columns</h3>
        <button type="button" onClick={add} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-2.5 text-xs font-medium hover:bg-ink/[0.05]"><Plus className="h-3.5 w-3.5" /> Add column</button>
      </div>
      <p className="mt-1 text-xs text-muted">These render as the three middle columns of the footer, in order, next to Contact.</p>

      <div className="mt-3 space-y-2">
        {columns.map((col, i) => {
          const open = openId === col.id
          return (
            <div key={col.id} className="rounded-md border border-ink/10">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => setOpenId(open ? null : col.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted" />}
                  <span className="truncate text-sm font-medium">{col.title || 'Untitled column'}</span>
                  <span className="shrink-0 text-[11px] text-muted">{col.links.length} link{col.links.length === 1 ? '' : 's'}</span>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" className="grid h-7 w-7 place-items-center rounded text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30" aria-label={`Move ${col.title} left`} disabled={i === 0} onClick={() => move(i, -1)}>◀</button>
                  <button type="button" className="grid h-7 w-7 place-items-center rounded text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30" aria-label={`Move ${col.title} right`} disabled={i === columns.length - 1} onClick={() => move(i, 1)}>▶</button>
                  <button type="button" className="grid h-7 w-7 place-items-center rounded text-rose/80 hover:bg-rose/10 hover:text-rose" aria-label={`Remove column ${col.title}`} onClick={() => remove(col.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {open && (
                <div className="border-t border-ink/10 p-3">
                  <label className="block"><span className={LABEL}>Column title</span><input value={col.title} onChange={(e) => update(col.id, { title: e.target.value })} aria-label={`Title for column ${i + 1}`} maxLength={60} className="input !rounded-md" /></label>
                  <div className="mt-3">
                    <FooterEntryListEditor entries={col.links} onChange={(links) => update(col.id, { links })} label={`Links in ${col.title}`} idPrefix={col.id} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {columns.length === 0 && <p className="rounded-md border border-dashed border-ink/15 px-3 py-4 text-center text-xs text-muted">No columns yet.</p>}
      </div>
    </div>
  )
}

/* ============================================================================
 *  Social links — optional; the public footer hides this row entirely when
 *  there are none enabled, so it's safe for this list to start (and stay) empty.
 * ========================================================================== */
function SocialEditor({ social, onChange }) {
  const move = (i, d) => {
    const next = [...social]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const patch = (i, part) => onChange(social.map((s, k) => (k === i ? { ...s, ...part } : s)))
  const remove = (i) => onChange(social.filter((_, k) => k !== i))
  const add = () => onChange([...social, { id: newId('social'), platform: 'LinkedIn', icon: 'linkedin', url: 'https://', enabled: true }])

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Social links (optional)</h3>
        <button type="button" onClick={add} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-2.5 text-xs font-medium hover:bg-ink/[0.05]"><Plus className="h-3.5 w-3.5" /> Add a social link</button>
      </div>
      <p className="mt-1 text-xs text-muted">There are none today — the row only appears on the site once at least one is enabled here.</p>

      {social.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-ink/15 px-3 py-4 text-center text-xs text-muted">No social links yet.</p>
      ) : (
        <ol className="mt-3 space-y-1.5" aria-label="Social links">
          {social.map((s, i) => {
            const Icon = SOCIAL_ICONS[s.icon] || Link2
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-1.5 rounded-md border border-ink/10 bg-paper/60 px-2 py-1.5">
                <div className="flex shrink-0">
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30" aria-label={`Move ${s.platform} up`} disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp className="h-4 w-4" /></button>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30" aria-label={`Move ${s.platform} down`} disabled={i === social.length - 1} onClick={() => move(i, 1)}><ChevronDown className="h-4 w-4" /></button>
                </div>
                <Icon className="h-4 w-4 shrink-0 text-muted" />
                <input value={s.platform} onChange={(e) => patch(i, { platform: e.target.value })} aria-label={`Platform name for link ${i + 1}`} maxLength={40} className="input !h-8 !w-32 !rounded-md !py-1 text-sm" />
                <select value={s.icon} onChange={(e) => patch(i, { icon: e.target.value })} aria-label={`Icon for link ${i + 1}`} className="input !h-8 !w-auto !rounded-md !py-1 text-sm">
                  {Object.keys(SOCIAL_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <input value={s.url} onChange={(e) => patch(i, { url: e.target.value })} aria-label={`URL for link ${i + 1}`} placeholder="https://…" className="input !h-8 !min-w-0 !flex-1 !rounded-md !py-1 font-mono text-xs" />
                <label className="flex shrink-0 items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={s.enabled !== false} onChange={(e) => patch(i, { enabled: e.target.checked })} aria-label={`Show ${s.platform} on the site`} />
                  Shown
                </label>
                <button type="button" className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-rose/80 hover:bg-rose/10 hover:text-rose" aria-label={`Remove ${s.platform}`} onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></button>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
