import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * A searchable dropdown for long option lists (e.g. the country picker) —
 * styled like a regular `.input` field. Filters as you type, closes on
 * outside click / Escape, fully keyboard-accessible via a native listbox role.
 */
export default function SearchableSelect({ value, onChange, options, placeholder = 'Search…', id, required, error, className }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, query])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        required={required}
        className={cn(
          className || 'input',
          'flex items-center justify-between text-left',
          !value && 'text-muted',
          error && 'border-rose',
        )}
      >
        {value || placeholder}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-ink/10 bg-card shadow-float">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full border-b border-ink/8 bg-transparent px-3.5 py-2.5 text-sm outline-none"
            aria-label="Search options"
          />
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3.5 py-2 text-sm text-muted">No matches</li>}
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                  className={cn(
                    'flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors hover:bg-ink/[0.04]',
                    opt === value && 'font-medium text-accent',
                  )}
                >
                  {opt}
                  {opt === value && <Check className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
