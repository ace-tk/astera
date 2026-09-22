import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, X, Check, Loader2 } from 'lucide-react'
import { fetchMediaLibrary, uploadMediaImage } from '@/services/cms'
import { resolveMediaUrl } from '@/cms/media'
import { describeError } from '@/cms/errors'
import { cn } from '@/utils/cn'

/**
 * Choose an image from the CMS media library, or upload a new one into it. Returns the image's
 * library path (`/api/media/<id>/<file>`) through `onSelect`. Images only; nothing else is stored.
 */
export default function MediaPicker({ open, onClose, onSelect, current }) {
  const qc = useQueryClient()
  const fileRef = useRef(null)
  const [problem, setProblem] = useState('')
  const { data: media = [], isLoading, isError } = useQuery({ queryKey: ['cms', 'media'], queryFn: fetchMediaLibrary, enabled: open })

  const upload = useMutation({
    mutationFn: (file) => uploadMediaImage(file),
    onSuccess: (m) => { setProblem(''); qc.invalidateQueries({ queryKey: ['cms', 'media'] }); onSelect(m.path) },
    onError: (err) => setProblem(describeError(err)),
  })

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Choose an image">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onMouseDown={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-ink/8 bg-paper p-5 shadow-float">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-medium tracking-tight">Choose an image</h3>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" aria-label="Upload an image" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = '' }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-sm font-medium text-paper disabled:opacity-60">
              {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload new image
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/[0.06]"><X className="h-4 w-4" /></button>
          </div>
        </div>
        {problem && <p role="alert" className="mb-3 text-sm text-rose">{problem}</p>}
        <p className="mb-3 text-xs text-muted">JPEG, PNG, GIF or WebP, up to 5 MB.</p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && <p className="py-8 text-center text-sm text-muted">Loading…</p>}
          {isError && <p role="alert" className="py-8 text-center text-sm text-rose">The media library could not be loaded.</p>}
          {!isLoading && !isError && media.length === 0 && <p className="py-8 text-center text-sm text-muted">No images yet. Upload the first one.</p>}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => onSelect(m.path)} aria-label={`Use ${m.title || m.filename}`}
                  className={cn('group relative block w-full overflow-hidden rounded-xl border bg-ink/[0.04] text-left', current === m.path ? 'border-ink ring-2 ring-ink/30' : 'border-ink/10 hover:border-ink/30')}>
                  <span className="block aspect-[16/10] overflow-hidden"><img src={resolveMediaUrl(m.path)} alt={m.alt || ''} loading="lazy" className="h-full w-full object-cover" /></span>
                  <span className="block truncate px-2.5 py-1.5 text-xs text-muted">{m.title || m.filename}</span>
                  {current === m.path && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-paper"><Check className="h-3.5 w-3.5" /></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  )
}
