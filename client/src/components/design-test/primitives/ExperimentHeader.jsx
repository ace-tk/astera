import clsx from 'clsx'
import SectionNumber from './SectionNumber'
import TechnicalLabel from './TechnicalLabel'
import MotionReveal from './MotionReveal'

/**
 * The consistent per-experiment title block: chapter numeral + eyebrow
 * metadata + a masked, line-by-line headline. Every experiment (01–06)
 * opens with this so the set reads as one document rather than six
 * unrelated demos.
 */
export default function ExperimentHeader({ index, total = '06', eyebrow, titleLines = [], titleClassName, className }) {
  return (
    <header className={clsx('relative', className)}>
      <div className="flex items-end justify-between gap-6">
        <SectionNumber value={index} total={total} />
        {eyebrow && <TechnicalLabel className="mb-2 hidden sm:inline-flex">{eyebrow}</TechnicalLabel>}
      </div>
      <h2
        className={clsx(
          'mt-4 font-display leading-[0.96] tracking-tight text-ink',
          titleClassName || 'text-display-sm sm:text-display',
        )}
      >
        {titleLines.map((line, i) => (
          <MotionReveal key={line} delay={i * 0.08}>
            <span className="block">{line}</span>
          </MotionReveal>
        ))}
      </h2>
    </header>
  )
}
