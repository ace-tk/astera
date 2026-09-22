import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2, EyeOff } from 'lucide-react'
import { newId, pageLink, routeLink } from '@/cms/navIds'
import { cn } from '@/utils/cn'

const ICON_BTN = 'grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent'

/**
 * An ordered list of links (a mega-menu group, a mobile list, or a section's side
 * navigation): move up/down, rename, re-point, remove, and add either a CMS page
 * or a link to an existing address. Content only — how the list looks on the site
 * is fixed in the site's own navigation components.
 */
export default function EntryListEditor({ entries, onChange, pagesById, pages, label = 'Links', idPrefix = 'e' }) {
  const [adding, setAdding] = useState(null) // 'page' | 'link'
  const [newLabel, setNewLabel] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [pickPage, setPickPage] = useState('')
  const [error, setError] = useState('')

  const move = (i, d) => {
    const next = [...entries]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const patch = (i, part) => onChange(entries.map((e, k) => (k === i ? { ...e, ...part } : e)))
  const remove = (i) => onChange(entries.filter((_, k) => k !== i))

  const used = new Set(entries.filter((e) => e.link.type === 'page').map((e) => e.link.pageId))
  const choices = pages.filter((p) => !used.has(p.id))

  const add = () => {
    setError('')
    if (adding === 'page') {
      if (!pickPage) return setError('Choose a page.')
      onChange([...entries, { id: newId(idPrefix), label: '', link: pageLink(pickPage) }])
    } else {
      if (!newLabel.trim()) return setError('Give the link a label.')
      if (!newRoute.startsWith('/')) return setError('The address must start with / (for example /services/training).')
      onChange([...entries, { id: newId(idPrefix), label: newLabel.trim(), link: routeLink(newRoute.trim()) }])
    }
    setAdding(null); setNewLabel(''); setNewRoute(''); setPickPage('')
  }

  return (
    <div>
      {entries.length === 0 && <p className="rounded-md border border-dashed border-ink/15 px-3 py-4 text-center text-xs text-muted">Nothing here yet.</p>}
      <ol className="space-y-1.5" aria-label={label}>
        {entries.map((e, i) => {
          const page = e.link.type === 'page' ? pagesById.get(e.link.pageId) : null
          const hidden = page && page.status !== 'published'
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-1.5 rounded-md border border-ink/10 bg-paper/60 px-2 py-1.5">
              <div className="flex shrink-0">
                <button type="button" className={ICON_BTN} aria-label={`Move ${e.label || page?.title || 'link'} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className={ICON_BTN} aria-label={`Move ${e.label || page?.title || 'link'} down`} disabled={i === entries.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
              </div>
              <div className="min-w-0 flex-1 basis-40">
                <input
                  value={e.label}
                  onChange={(ev) => patch(i, { label: ev.target.value })}
                  aria-label={`Label for link ${i + 1}`}
                  placeholder={page ? `${page.navLabel || page.title} (follows the page)` : 'Label'}
                  maxLength={80}
                  className="input !h-8 !rounded-md !py-1 text-sm"
                />
              </div>
              <div className="min-w-0 basis-52 text-xs text-muted">
                {page ? (
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="truncate">Page · {page.path}</span>
                    {hidden && <span className="inline-flex shrink-0 items-center gap-1 rounded bg-golden/20 px-1.5 py-0.5 text-[10px] font-medium text-ink"><EyeOff className="h-3 w-3" /> Hidden until published</span>}
                  </span>
                ) : e.link.type === 'page' ? (
                  <span className="text-rose">Page not found</span>
                ) : (
                  <input value={e.link.route} onChange={(ev) => patch(i, { link: routeLink(ev.target.value) })} aria-label={`Address for link ${i + 1}`} className="input !h-8 !rounded-md !py-1 font-mono text-xs" />
                )}
              </div>
              <button type="button" className={cn(ICON_BTN, 'text-rose/80 hover:bg-rose/10 hover:text-rose')} aria-label={`Remove ${e.label || page?.title || 'link'}`} onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></button>
            </li>
          )
        })}
      </ol>

      {adding ? (
        <div className="mt-2 flex flex-wrap items-end gap-2 rounded-md border border-ink/12 bg-card p-2.5">
          {adding === 'page' ? (
            <label className="min-w-0 flex-1 basis-56">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Page</span>
              <select value={pickPage} onChange={(ev) => setPickPage(ev.target.value)} aria-label="Page to add" className="input !h-8 !rounded-md !py-1 text-sm">
                <option value="">Choose a page…</option>
                {choices.map((p) => <option key={p.id} value={p.id}>{p.title}{p.status !== 'published' ? ' (draft)' : ''}</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="min-w-0 flex-1 basis-40">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Label</span>
                <input value={newLabel} onChange={(ev) => setNewLabel(ev.target.value)} aria-label="New link label" maxLength={80} className="input !h-8 !rounded-md !py-1 text-sm" />
              </label>
              <label className="min-w-0 flex-1 basis-48">
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Address</span>
                <input value={newRoute} onChange={(ev) => setNewRoute(ev.target.value)} aria-label="New link address" placeholder="/services/…" className="input !h-8 !rounded-md !py-1 font-mono text-xs" />
              </label>
            </>
          )}
          <button type="button" onClick={add} className="h-8 rounded-md bg-ink px-3 text-xs font-medium text-paper">Add</button>
          <button type="button" onClick={() => { setAdding(null); setError('') }} className="h-8 rounded-md px-3 text-xs text-muted hover:text-ink">Cancel</button>
          {error && <p role="alert" className="w-full text-xs text-rose">{error}</p>}
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => setAdding('page')} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-2.5 text-xs font-medium hover:bg-ink/[0.05]"><Plus className="h-3.5 w-3.5" /> Add a page</button>
          <button type="button" onClick={() => setAdding('link')} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-2.5 text-xs font-medium hover:bg-ink/[0.05]"><Plus className="h-3.5 w-3.5" /> Add a link to an existing address</button>
        </div>
      )}
    </div>
  )
}
