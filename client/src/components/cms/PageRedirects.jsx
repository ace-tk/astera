import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { createAdminRedirect, deleteAdminRedirect, fetchAdminRedirects } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { useToast } from '@/context/ToastContext'

const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted'

/**
 * "Old addresses that redirect here": the 301 manager for one page. Adding an old address makes visitors (and search
 * engines) go to this page for good; no code change needed. The server refuses loops and chains.
 */
export default function PageRedirects({ pagePath, disabled }) {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [from, setFrom] = useState('')
  const key = ['cms', 'admin', 'redirects', pagePath]
  const { data: items = [] } = useQuery({ queryKey: key, queryFn: () => fetchAdminRedirects(pagePath), enabled: Boolean(pagePath) })
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key })
    qc.invalidateQueries({ queryKey: ['cms', 'redirects'] })
  }
  const failed = (err) => toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' })

  const add = useMutation({
    mutationFn: () => createAdminRedirect(from.trim(), pagePath),
    onSuccess: () => { setFrom(''); refresh(); toast({ title: 'Redirect added', color: 'emerald' }) },
    onError: failed,
  })
  const remove = useMutation({ mutationFn: (id) => deleteAdminRedirect(id), onSuccess: () => { refresh(); toast({ title: 'Redirect removed', color: 'emerald' }) }, onError: failed })

  const valid = from.trim().startsWith('/') && from.trim().length > 1
  return (
    <section className="rounded-lg border border-ink/10 bg-card p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Redirects (301)</h2>
      <p className="mt-2 text-xs text-muted">Old addresses that send visitors and search engines to this page ({pagePath}).</p>
      {items.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {items.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 rounded-md bg-ink/[0.03] px-2 py-1.5 text-xs">
              <span className="min-w-0 truncate" title={r.from}>{r.from}{r.source === 'auto' ? <span className="ml-1 text-muted">(automatic)</span> : null}</span>
              <button type="button" onClick={() => remove.mutate(r.id)} disabled={disabled || remove.isPending} className="shrink-0 text-muted hover:text-red-600" aria-label={`Remove the redirect from ${r.from}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <label className="mt-3 block">
        <span className={LABEL}>Old address</span>
        <div className="mt-1 flex gap-2">
          <input value={from} onChange={(e) => setFrom(e.target.value)} disabled={disabled} maxLength={300} placeholder="/services/guides/old-page" className="input !rounded-md" onKeyDown={(e) => { if (e.key === 'Enter' && valid) add.mutate() }} />
          <button type="button" onClick={() => add.mutate()} disabled={disabled || !valid || add.isPending} className="shrink-0 rounded-md border border-ink/15 px-3 text-xs font-medium hover:bg-ink/5 disabled:opacity-50">Add</button>
        </div>
      </label>
      <p className="mt-2 text-[11px] text-muted">The old address must not be a published page: unpublish or remove it first. Real server-side 301s for pages that are not in the CMS are applied at the next site release.</p>
    </section>
  )
}
