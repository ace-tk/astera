import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'

const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgb(17 24 39 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 24 39 / 0.06) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
}

/** Small corner ticks that read as a technical/editorial frame rather than
 * a plain rounded box — pure decoration, no text, so there's nothing here
 * that could read as invented content. */
function FrameCorners() {
  return (
    <>
      <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 rounded-tl-2xl border-l border-t border-ink/25 sm:h-5 sm:w-5" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 rounded-tr-2xl border-r border-t border-ink/25 sm:h-5 sm:w-5" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 rounded-bl-2xl border-b border-l border-ink/25 sm:h-5 sm:w-5" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 rounded-br-2xl border-b border-r border-ink/25 sm:h-5 sm:w-5" aria-hidden="true" />
    </>
  )
}

/**
 * A centered eyebrow/heading/lead directly above a rounded, shadowed
 * <video> player, the whole thing sitting inside one compact editorial
 * frame (grid wash + corner ticks + a single border) so the video reads as
 * an intentional anchor rather than an element floating in empty space —
 * reusable across the ported ATOOPV pages, currently only Accueil.
 */
export default function VideoSection({ eyebrow, heading, lead, video, cta }) {
  return (
    <section className="relative py-10 sm:py-12">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[2rem] border border-ink/8 bg-card/40 px-5 py-8 sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 mask-fade-b" style={GRID_STYLE} aria-hidden="true" />
          <FrameCorners />

          <div className="relative">
            <Reveal className="mx-auto max-w-2xl text-center">
              {eyebrow && (
                <span className="eyebrow justify-center">
                  <span className="h-px w-8 bg-ink/30" /> {eyebrow}
                </span>
              )}
              {heading && (
                <h2 className="mt-4 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
                  {heading}
                </h2>
              )}
              {lead && <p className="mt-3 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
            </Reveal>

            <Reveal
              delay={0.1}
              className="group mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-ink/10 bg-black shadow-float transition-all duration-500 hover:border-royal/30 hover:shadow-lift"
            >
              <div className="transition-transform duration-500 ease-out group-hover:scale-[1.008]">
                <video controls preload="metadata" poster={video.poster} className="block w-full">
                  <source src={video.src} type="video/mp4" />
                  Votre navigateur ne prend pas en charge la lecture de vidéos.
                </video>
              </div>
            </Reveal>

            {cta && (
              <Reveal delay={0.15} className="mt-6 flex justify-center">
                {cta.to.startsWith('http') ? (
                  <Button as="a" href={cta.to} target="_blank" rel="noopener noreferrer" variant="soft">
                    {cta.label}
                  </Button>
                ) : (
                  <Button as={Link} to={cta.to} variant="soft">
                    {cta.label}
                  </Button>
                )}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
