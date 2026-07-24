import Reveal from '@/components/ui/Reveal'

/** A centered heading above a wrapping row of chips — reusable for any "tags/sectors/industries" style block. */
export default function ChipCloud({ eyebrow, heading, items }) {
  return (
    <div>
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
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex flex-wrap justify-center gap-2.5">
        {items.map((item) => (
          <span key={item} className="chip text-sm text-ink/70">
            {item}
          </span>
        ))}
      </Reveal>
    </div>
  )
}
