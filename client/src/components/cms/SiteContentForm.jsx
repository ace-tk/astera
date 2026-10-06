import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import MediaPicker from '@/components/cms/MediaPicker'
import { resolveMediaUrl } from '@/cms/media'
import { humanize, isEditableKey, isLeaf, isImageKey, isLinkKey, itemTitle } from '@/cms/siteContentTree'
import { cn } from '@/utils/cn'

const LABEL = 'mb-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted'
const INPUT = 'input !h-9 !rounded-md !py-1.5 text-sm'

function Leaf({ label, value, path, name, onChange }) {
  const [picking, setPicking] = useState(false)
  const id = `site-${path.join('-')}`
  const aria = path.join(' › ')

  if (typeof value === 'number') {
    return (
      <label className="block" htmlFor={id}>
        <span className={LABEL}>{label}</span>
        <input id={id} aria-label={aria} type="number" min="0" step="any" value={value} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn(INPUT, 'max-w-[10rem]')} />
      </label>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm" htmlFor={id}>
        <input id={id} aria-label={aria} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}
      </label>
    )
  }
  const text = typeof value === 'string' ? value : ''
  const long = text.length > 90 || text.includes('\n')
  return (
    <div>
      <label className="block" htmlFor={id}>
        <span className={LABEL}>{label}</span>
        {long ? (
          <textarea id={id} aria-label={aria} value={text} onChange={(e) => onChange(e.target.value)} rows={name === 'markdown' ? 24 : Math.min(10, Math.max(3, Math.ceil(text.length / 80)))} className={cn('input !rounded-md !py-2 text-sm leading-relaxed', name === 'markdown' && 'font-mono text-xs')} />
        ) : (
          <div className="flex gap-2">
            <input id={id} aria-label={aria} value={text} onChange={(e) => onChange(e.target.value)} className={cn(INPUT, (isLinkKey(name) || isImageKey(name)) && 'font-mono text-xs')} />
            {isImageKey(name) && (
              <button type="button" onClick={() => setPicking(true)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-ink/12 px-3 text-sm hover:bg-ink/[0.04]">
                <ImagePlus className="h-4 w-4" /> Choose
              </button>
            )}
          </div>
        )}
      </label>
      {isImageKey(name) && text && <img src={resolveMediaUrl(text)} alt="" className="mt-2 h-16 rounded-md border border-ink/10 object-cover" />}
      {text.includes('*') && <p className="mt-1 text-[11px] text-muted">Words between *stars* are highlighted on the page.</p>}
      {isImageKey(name) && <MediaPicker open={picking} onClose={() => setPicking(false)} current={text} onSelect={(p) => { onChange(p); setPicking(false) }} />}
    </div>
  )
}

/**
 * Edits a site page's content tree generically: text, numbers and links can be changed; the
 * shape (what exists, how many items, design tokens like id/type/color) is fixed — the server
 * enforces the same, see server/src/cms/sitePageShape.js. Top-level groups are collapsible.
 */
function Node({ name, value, path, depth, onChange }) {
  const label = humanize(name)
  if (isLeaf(value)) return <Leaf label={label} value={value} path={path} name={name} onChange={(v) => onChange(path, v)} />

  const entries = (Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value)).filter(([k, v]) => isEditableKey(k) && v !== null && typeof v !== 'function')
  if (entries.length === 0) return null

  // Lists of plain strings (bullets, dropdown options, heading parts): a compact stack of inputs.
  const body = (
    <div className={cn('space-y-3', depth > 0 && 'rounded-md border border-ink/8 bg-paper/60 p-3')}>
      {entries.map(([k, v]) => {
        const isItem = typeof k === 'number'
        const childName = isItem && Array.isArray(value) && typeof v === 'string' ? name : k
        return (
          <div key={k}>
            {!isLeaf(v) && depth >= 0 && (
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/70">{isItem ? itemTitle(v, k) : humanize(k)}</p>
            )}
            <Node name={isLeaf(v) && isItem ? `${label} ${k + 1}` : childName} value={v} path={[...path, k]} depth={depth + 1} onChange={onChange} />
          </div>
        )
      })}
    </div>
  )

  if (depth > 0) return body
  return (
    <details className="group rounded-lg border border-ink/10 bg-card">
      <summary className="cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] marker:text-muted">{label}</summary>
      <div className="px-4 pb-4">{body}</div>
    </details>
  )
}

export default function SiteContentForm({ content, onChange }) {
  return (
    <div className="space-y-3">
      {Object.entries(content).map(([k, v]) => (isEditableKey(k) ? <Node key={k} name={k} value={v} path={[k]} depth={0} onChange={onChange} /> : null))}
    </div>
  )
}
