import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { newId } from '@/cms/navIds'
import FooterLinkTarget from './FooterLinkTarget'

const ICON_BTN = 'grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink/70 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent'

/**
 * An ordered list of footer links (a column's links, or the legal links): move
 * up/down, rename, re-point (any address kind — see FooterLinkTarget), remove,
 * add. Unlike the main menu's EntryListEditor, entries here never "follow a CMS
 * page" — the label is always a plain, required text field.
 */
export default function FooterEntryListEditor({ entries, onChange, label = 'Links', idPrefix = 'l', max }) {
  const move = (i, d) => {
    const next = [...entries]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  const patch = (i, part) => onChange(entries.map((e, k) => (k === i ? { ...e, ...part } : e)))
  const remove = (i) => onChange(entries.filter((_, k) => k !== i))
  const add = () => onChange([...entries, { id: newId(idPrefix), label: 'New link', link: { type: 'route', route: '/' } }])

  return (
    <div>
      {entries.length === 0 && <p className="rounded-md border border-dashed border-ink/15 px-3 py-4 text-center text-xs text-muted">Nothing here yet.</p>}
      <ol className="space-y-1.5" aria-label={label}>
        {entries.map((e, i) => (
          <li key={e.id} className="flex flex-wrap items-center gap-1.5 rounded-md border border-ink/10 bg-paper/60 px-2 py-1.5">
            <div className="flex shrink-0">
              <button type="button" className={ICON_BTN} aria-label={`Move ${e.label} up`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
              <button type="button" className={ICON_BTN} aria-label={`Move ${e.label} down`} disabled={i === entries.length - 1} onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
            </div>
            <div className="min-w-0 flex-1 basis-36">
              <input value={e.label} onChange={(ev) => patch(i, { label: ev.target.value })} aria-label={`Label for link ${i + 1}`} maxLength={80} className="input !h-8 !rounded-md !py-1 text-sm" />
            </div>
            <div className="min-w-0 flex-[2] basis-64">
              <FooterLinkTarget label={`Link ${i + 1}`} value={e.link} onChange={(link) => patch(i, { link })} />
            </div>
            <button type="button" className={`${ICON_BTN} text-rose/80 hover:bg-rose/10 hover:text-rose`} aria-label={`Remove ${e.label}`} onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={add}
        disabled={max != null && entries.length >= max}
        className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-ink/12 px-2.5 text-xs font-medium hover:bg-ink/[0.05] disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Plus className="h-3.5 w-3.5" /> Add a link
      </button>
    </div>
  )
}
