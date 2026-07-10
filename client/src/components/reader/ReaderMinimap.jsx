import { cn } from '@/utils/cn'

/**
 * A document minimap — each section is a little thumbnail of faux text lines.
 * The active section lifts and tints; a progress fill tracks reading position.
 * Click any block to jump. Purely a navigation aid, hidden on small screens.
 */
export default function ReaderMinimap({ sections, active, progress, onJump }) {
  return (
    <div className="sticky top-24 hidden w-16 shrink-0 flex-col items-center gap-2 xl:flex">
      <span className="text-[0.6rem] uppercase tracking-widest text-muted">Map</span>
      <div className="relative flex flex-col items-center gap-1.5">
        {/* progress spine */}
        <div className="absolute -left-2 top-0 h-full w-px bg-ink/8">
          <div className="w-px bg-accent transition-[height] duration-200" style={{ height: `${progress * 100}%` }} />
        </div>
        {sections.map((s) => {
          const on = active === s.id
          return (
            <button
              key={s.id}
              onClick={() => onJump(s.id)}
              title={s.title}
              className={cn(
                'flex w-12 flex-col gap-[3px] rounded-md border p-1.5 transition-all',
                on ? 'scale-105 border-accent/40 bg-card shadow-soft' : 'border-ink/8 bg-card/60 hover:border-ink/20',
              )}
            >
              {[100, 80, 92, 66].map((w, i) => (
                <span key={i} className={cn('h-[2px] rounded-full', on ? 'bg-accent/50' : 'bg-ink/15')} style={{ width: `${w}%` }} />
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
