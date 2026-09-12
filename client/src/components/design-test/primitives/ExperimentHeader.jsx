import clsx from 'clsx'
import SectionNumber from './SectionNumber'
import TechnicalLabel from './TechnicalLabel'
import MotionReveal from './MotionReveal'

/**
 * The consistent per-experiment title block: chapter numeral + eyebrow
 * metadata + a masked, line-by-line headline. Every experiment (01–06)
 * opens with this so the set reads as one document rather than six
 * unrelated demos.
 *
 * `hideEyebrow` is opt-in and off by default, so every /design-test caller
 * keeps its "EXPERIMENT / NN" label exactly as-is — only a caller that
 * explicitly needs to drop just that label (not the chapter numeral, not
 * the title) passes it true.
 */
export default function ExperimentHeader({ index, total = '13', eyebrow, hideEyebrow = false, titleLines = [], titleClassName, className }) {
  return (
    <header className={clsx('relative', className)}>
      <div className="flex items-end justify-between gap-6">
        <SectionNumber value={index} total={total} />
        {eyebrow && !hideEyebrow && <TechnicalLabel className="mb-2 hidden sm:inline-flex">{eyebrow}</TechnicalLabel>}
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
