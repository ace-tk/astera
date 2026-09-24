import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

/**
 * Homepage quick-qualifying questionnaire. Same interaction language as
 * PVSimulator's instance-type pills (rounded-full toggle, selected = solid
 * accent fill) and the same progress-bar/"Question X / Total" card shape
 * already established by DiagnosticQuiz — but purpose-built to be shorter
 * and to end by handing off to the real Contact page instead of a separate
 * inline lead-capture form: each answer feeds a structured summary line, all
 * four are joined into one message and passed as a single `message` query
 * param, which Contact.jsx reads once on mount to prefill its own existing
 * "Message (optionnel)" field, then strips from the URL. No new form, no
 * new submission endpoint — this only ever hands off to the existing one.
 */
export default function QuickDiagnostic({ eyebrow, heading, subtitle, questions, contactTo = '/atoopv/contact', color = 'royal' }) {
  const navigate = useNavigate()
  const a = accent(color)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(null))

  const total = questions.length
  const current = questions[index]
  const answered = answers[index] !== null

  function selectOption(value) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function back() {
    if (index > 0) setIndex(index - 1)
  }

  function next() {
    if (!answered) return
    if (index < total - 1) {
      setIndex(index + 1)
      return
    }
    const message = questions.map((q, i) => `${q.summaryLabel} : ${answers[i]}`).join('\n')
    navigate(`${contactTo}?source=diagnostic&message=${encodeURIComponent(message)}`)
  }

  return (
    <section id="diagnostic-rapide" className="relative py-10 sm:py-12">
      <div className="shell">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">{eyebrow}</span>
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-balance sm:text-3xl">{heading}</h2>
            {subtitle && <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted text-pretty">{subtitle}</p>}
          </div>

          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[2rem] border border-ink/8 bg-card shadow-soft">
            <div className="px-6 pt-6 sm:px-10">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink/8">
                <motion.div
                  className={cn('h-full rounded-full', a.bg)}
                  animate={{ width: `${((index + 1) / total) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-muted">
                Question {index + 1} / {total}
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-display text-xl font-medium leading-snug tracking-tight text-balance">{current.question}</h3>

                  <div className="mt-6 flex flex-wrap gap-2.5" role="group" aria-label={current.question}>
                    {current.options.map((opt) => {
                      const selected = answers[index] === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => selectOption(opt.value)}
                          className={cn(
                            'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
                            selected ? cn(a.bg, 'border-transparent text-white') : 'border-ink/12 text-ink/75 hover:border-ink/25 hover:text-ink',
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3">
                    {index > 0 ? (
                      <Button variant="ghost" onClick={back}>
                        <ArrowLeft className="h-4 w-4" /> Précédent
                      </Button>
                    ) : (
                      <span />
                    )}
                    <Button variant="accent" onClick={next} disabled={!answered} className="disabled:pointer-events-none disabled:opacity-40">
                      {index === total - 1 ? 'Voir ma recommandation' : 'Suivant'} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
