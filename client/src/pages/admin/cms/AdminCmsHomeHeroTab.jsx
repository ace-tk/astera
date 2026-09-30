import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ImagePlus, Rocket, Save, Undo2 } from 'lucide-react'
import { fetchAdminHomeHero, saveAdminHomeHeroDraft, publishAdminHomeHero, discardAdminHomeHero } from '@/services/cms'
import { describeError } from '@/cms/errors'
import { clone } from '@/cms/navIds'
import { resolveMediaUrl } from '@/cms/media'
import { useToast } from '@/context/ToastContext'
import MediaPicker from '@/components/cms/MediaPicker'
import StatusBadge from '@/components/cms/StatusBadge'
import Button from '@/components/ui/Button'

const LABEL = 'mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted'

/**
 * The homepage hero carousel's 3 slide images (Content → Menus → Homepage).
 * Fixed at exactly 3 slides — same "fixed structure, only content editable"
 * rule as the main menu — so this only lets an admin change WHICH image and
 * alt text each of the 3 existing slide positions shows, via the same
 * MediaPicker (upload or pick from the library) already used for blog cover
 * images. Same draft → save → publish → discard workflow as the footer/menu.
 */
export default function AdminCmsHomeHeroTab() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const { data: hero, isLoading, isError, error } = useQuery({ queryKey: ['cms', 'admin', 'home-hero'], queryFn: fetchAdminHomeHero, staleTime: 0 })

  const [content, setContent] = useState(null)
  const [problem, setProblem] = useState('')
  const [pickerForSlide, setPickerForSlide] = useState(null) // index of the slide currently choosing an image, or null

  useEffect(() => {
    if (hero && !content) setContent(clone(hero.draft.content))
  }, [hero, content])

  const dirty = Boolean(hero && content && JSON.stringify(content) !== JSON.stringify(hero.draft.content))

  const applyServer = (h) => {
    qc.setQueryData(['cms', 'admin', 'home-hero'], h)
    qc.invalidateQueries({ queryKey: ['cms', 'home-hero'] })
    setContent(clone(h.draft.content))
    setProblem('')
  }
  const fail = (err) => { setProblem(describeError(err)); toast({ title: 'That did not work', description: describeError(err), variant: 'warn', color: 'rose' }) }

  const save = useMutation({ mutationFn: () => saveAdminHomeHeroDraft(content, hero.rev), onSuccess: (h) => { applyServer(h); toast({ title: 'Homepage draft saved', color: 'emerald' }) }, onError: fail })
  const publish = useMutation({
    mutationFn: async () => {
      if (dirty) await saveAdminHomeHeroDraft(content, hero.rev)
      return publishAdminHomeHero()
    },
    onSuccess: (h) => { applyServer(h); toast({ title: 'Homepage published', description: 'The public homepage now shows these images.', color: 'emerald' }) },
    onError: fail,
  })
  const discard = useMutation({ mutationFn: () => discardAdminHomeHero(), onSuccess: (h) => { applyServer(h); toast({ title: 'Changes discarded', color: 'emerald' }) }, onError: fail })

  const updateSlide = (i, part) => setContent((c) => ({ ...c, slides: c.slides.map((s, k) => (k === i ? { ...s, ...part } : s)) }))

  if (isLoading || !content) return <p className="py-10 text-center text-sm text-muted">Loading homepage…</p>
  if (isError) return <p role="alert" className="py-10 text-center text-sm text-rose">{describeError(error)}</p>

  return (
    <div>
      {/* ── Action bar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="published" hasUnpublishedChanges={dirty || hero.hasUnpublishedChanges} />
        {dirty && <span className="text-xs text-muted" role="status">Unsaved changes</span>}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => discard.mutate()} disabled={(!dirty && !hero.hasUnpublishedChanges) || discard.isPending}><Undo2 className="h-4 w-4" /> Discard changes</Button>
          <Button variant="ghost" size="sm" magnetic={false} className="rounded-md" onClick={() => save.mutate()} disabled={!dirty || save.isPending}><Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : 'Save draft'}</Button>
          <Button variant="accent" size="sm" className="rounded-md" onClick={() => publish.mutate()} disabled={(!dirty && !hero.hasUnpublishedChanges) || publish.isPending}><Rocket className="h-4 w-4" /> {publish.isPending ? 'Publishing…' : 'Publish homepage'}</Button>
        </div>
      </div>
      {problem && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-rose/30 bg-rose/[0.06] px-4 py-3 text-sm text-rose"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{problem}</p></div>
      )}

      <div className="mt-5 max-w-2xl rounded-lg border border-ink/10 bg-card p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">Hero slider images</h3>
        <p className="mt-1 text-xs text-muted">
          The homepage’s top image carousel has 3 fixed slides — you choose which image and description each one shows. The slider itself (navigation, layout, animation) is part of the website design.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {content.slides.map((slide, i) => (
            <div key={slide.id} className="rounded-lg border border-ink/10 p-3">
              <p className={LABEL}>Slide {i + 1}</p>
              <button
                type="button"
                onClick={() => setPickerForSlide(i)}
                aria-label={`Change slide ${i + 1}’s image`}
                className="group relative block aspect-square w-full overflow-hidden rounded-md border border-ink/10 bg-ink/[0.04]"
              >
                <img src={resolveMediaUrl(slide.path)} alt={slide.alt} className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/0 text-transparent transition-colors group-hover:bg-ink/50 group-hover:text-paper">
                  <ImagePlus className="h-4 w-4" /> <span className="text-xs font-medium">Change image</span>
                </span>
              </button>
              <label className="mt-2.5 block">
                <span className={LABEL}>Description (alt text)</span>
                <input
                  value={slide.alt}
                  onChange={(e) => updateSlide(i, { alt: e.target.value })}
                  aria-label={`Slide ${i + 1} description`}
                  maxLength={300}
                  className="input !h-8 !rounded-md !py-1 text-sm"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <MediaPicker
        open={pickerForSlide != null}
        onClose={() => setPickerForSlide(null)}
        current={pickerForSlide != null ? content.slides[pickerForSlide].path : null}
        onSelect={(path) => {
          updateSlide(pickerForSlide, { path })
          setPickerForSlide(null)
        }}
      />
    </div>
  )
}
