import { pageLink, routeLink } from '@/cms/navIds'

/** Where a menu (or its call-to-action) goes: a CMS page, or an existing address. */
export default function LinkTarget({ value, onChange, pages, label }) {
  const isPage = value?.type === 'page'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`${label} — kind`}
        value={isPage ? 'page' : 'route'}
        onChange={(e) => onChange(e.target.value === 'page' ? pageLink(pages[0]?.id || '') : routeLink('/'))}
        className="input !h-9 !w-auto !rounded-md !py-1 text-sm"
      >
        <option value="route">Existing address</option>
        <option value="page" disabled={!pages.length}>CMS page</option>
      </select>
      {isPage ? (
        <select aria-label={`${label} — page`} value={value.pageId} onChange={(e) => onChange(pageLink(e.target.value))} className="input !h-9 !min-w-0 !flex-1 !rounded-md !py-1 text-sm">
          {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      ) : (
        <input aria-label={`${label} — address`} value={value?.route || ''} onChange={(e) => onChange(routeLink(e.target.value))} placeholder="/services/…" className="input !h-9 !min-w-0 !flex-1 !rounded-md !py-1 font-mono text-sm" />
      )}
    </div>
  )
}
