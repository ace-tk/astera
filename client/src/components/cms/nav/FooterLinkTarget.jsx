/**
 * Where a footer link goes. Unlike the main menu (client/src/components/cms/nav/LinkTarget.jsx,
 * which only ever points at a CMS page or an in-site route), footer links need the full range
 * real footer content needs: an in-site route, an external address, an email, a phone number, or
 * — for the legal links, which have no real destination yet — a plain '#' placeholder. Matches
 * `footerLinkSchema` (server/src/cms/schemas.js) exactly; a CMS page is deliberately not offered
 * here (see that schema's comment for why).
 */
const KINDS = [
  ['route', 'Internal route'],
  ['external', 'External address'],
  ['mailto', 'Email'],
  ['tel', 'Phone'],
  ['anchor', 'Not linked yet (#)'],
]

const PLACEHOLDER = { route: '/services/…', external: 'https://…', mailto: 'mailto:you@example.com', tel: 'tel:+33…', anchor: '#' }

export default function FooterLinkTarget({ value, onChange, label }) {
  const type = value?.type || 'route'

  const setType = (nextType) => {
    if (nextType === 'route') return onChange({ type: 'route', route: value?.route || '/' })
    const defaults = { external: 'https://', mailto: 'mailto:', tel: 'tel:', anchor: '#' }
    onChange({ type: nextType, url: value?.url && value.type === nextType ? value.url : defaults[nextType] })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label={`${label} — kind`} value={type} onChange={(e) => setType(e.target.value)} className="input !h-9 !w-auto !rounded-md !py-1 text-sm">
        {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      {type === 'route' ? (
        <input
          aria-label={`${label} — address`}
          value={value?.route || ''}
          onChange={(e) => onChange({ type: 'route', route: e.target.value })}
          placeholder={PLACEHOLDER.route}
          className="input !h-9 !min-w-0 !flex-1 !rounded-md !py-1 font-mono text-sm"
        />
      ) : (
        <input
          aria-label={`${label} — value`}
          value={value?.url || ''}
          onChange={(e) => onChange({ ...value, type, url: e.target.value })}
          placeholder={PLACEHOLDER[type]}
          className="input !h-9 !min-w-0 !flex-1 !rounded-md !py-1 font-mono text-sm"
        />
      )}
    </div>
  )
}
