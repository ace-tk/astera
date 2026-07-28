import { motion } from 'framer-motion'
import { JOURNEY } from '@/constants/content'
import { accent } from '@/utils/accent'
import Glyph from '@/components/ui/Glyph'
import Reveal from '@/components/ui/Reveal'

function StageCard({ stage, index, showConnector = false }) {
  const a = accent(stage.color)

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full rounded-[1.6rem] border border-ink/8 bg-card/95 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-6"
    >
      {showConnector ? (
        <div className="pointer-events-none absolute right-[-0.75rem] top-1/2 z-10 hidden h-3 w-6 -translate-y-1/2 lg:block" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-ink/0 via-ink/25 to-ink/0" />
          <span className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[4px] ${a.bg}`} />
          <span className={`absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full ${a.bg}`} />
        </div>
      ) : null}
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${a.softBg} ${a.text}`}>
          <Glyph name={stage.glyph} size={24} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.7rem] uppercase tracking-[0.26em] text-muted">0{index + 1}</p>
          <h3 className="mt-1 font-display text-xl font-medium tracking-tight text-ink">{stage.title}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">{stage.body}</p>
    </motion.article>
  )
}

export default function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden py-section">
      <div className="shell">
        <Reveal className="text-center">
          <span className="eyebrow justify-center">How it works</span>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-sm font-medium leading-[1.06] tracking-tight text-balance">
            One recording in. A whole story out.
          </h2>
        </Reveal>

        <div className="mt-10 lg:mt-14">
          <div className="hidden lg:block">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-4 lg:grid-cols-4">
                {JOURNEY.slice(0, 4).map((stage, index) => (
                  <div key={stage.key} className="relative">
                    <StageCard stage={stage} index={index} showConnector={index < 3} />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {JOURNEY.slice(4).map((stage, index) => (
                  <div key={stage.key} className="relative">
                    <StageCard stage={stage} index={index + 4} showConnector={index < 2} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {JOURNEY.map((stage, index) => (
              <StageCard key={stage.key} stage={stage} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
