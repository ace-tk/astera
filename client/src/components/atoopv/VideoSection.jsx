import { Link } from 'react-router-dom'
import Reveal from '@/components/ui/Reveal'
import Button from '@/components/ui/Button'

/** A centered eyebrow/heading/lead above a rounded, shadowed <video> player — reusable across the ported ATOOPV pages. */
export default function VideoSection({ eyebrow, heading, lead, video, cta }) {
  return (
    <section className="relative py-14 sm:py-16">
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="eyebrow justify-center">
              <span className="h-px w-8 bg-ink/30" /> {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-5 font-display text-2xl font-medium leading-tight tracking-tight text-balance sm:text-3xl">
              {heading}
            </h2>
          )}
          {lead && <p className="mt-4 text-base leading-relaxed text-muted text-pretty">{lead}</p>}
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-ink/8 bg-black shadow-float">
          <video controls preload="metadata" poster={video.poster} className="block w-full">
            <source src={video.src} type="video/mp4" />
            Votre navigateur ne prend pas en charge la lecture de vidéos.
          </video>
        </Reveal>

        {cta && (
          <Reveal delay={0.15} className="mt-8 flex justify-center">
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
    </section>
  )
}
