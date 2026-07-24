import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import { accent } from '@/utils/accent'
import { cn } from '@/utils/cn'

/**
 * A scored, multi-step quiz — question by question with a progress bar,
 * then a results screen (score circle, per-question detail, a lead-capture
 * form). Generic over `questions`/`tiers` so any future ATOOPV diagnostic
 * tool can reuse it instead of duplicating this flow.
 *
 * The source page's lead-capture form doesn't call a real backend either —
 * on submit it just opens /contact/ with the answers as query params. This
 * reproduces that exact client-only behavior against `contactTo` rather
 * than inventing an email-sending API that doesn't exist here.
 */
export default function DiagnosticQuiz({
  badge,
  heading,
  footer,
  footerLink,
  contactTo,
  restartLabel,
  questions,
  tiers,
  resultsCta,
  color = 'royal',
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ prenom: '', email: '', cse: '' })
  const [formError, setFormError] = useState('')

  const a = accent(color)
  const total = questions.length
  const current = questions[index]
  const answered = answers[index] !== -1

  const score = useMemo(
    () => answers.reduce((sum, choice, i) => sum + (choice === -1 ? 0 : questions[i].options[choice].score), 0),
    [answers, questions],
  )
  const maxScore = total * 2
  const tier = tiers.find((t) => score >= t.min) || tiers[tiers.length - 1]
  const tierAccent = accent(tier.color)

  function selectOption(oIndex) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = oIndex
      return next
    })
  }

  function next() {
    if (!answered) return
    if (index < total - 1) setIndex(index + 1)
    else setShowResults(true)
  }

  function back() {
    if (index > 0) setIndex(index - 1)
  }

  function restart() {
    setAnswers(new Array(total).fill(-1))
    setIndex(0)
    setShowResults(false)
    setSubmitted(false)
    setForm({ prenom: '', email: '', cse: '' })
    setFormError('')
  }

  function submit() {
    if (!form.prenom.trim() || !form.email.trim() || !form.email.includes('@')) {
      setFormError('Merci de renseigner votre prénom et une adresse email valide.')
      return
    }
    setFormError('')
    const params = new URLSearchParams({
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      cse: form.cse.trim(),
      score: String(score),
      niveau: tier.level,
    })
    window.open(`${contactTo}?${params.toString()}`, '_blank', 'noopener')
    setSubmitted(true)
  }

  return (
    <Reveal>
      <div className="overflow-hidden rounded-[2rem] border border-ink/8 bg-card shadow-soft">
        <div className="border-b border-ink/8 px-6 py-8 text-center sm:px-10">
          <h2 className="font-display text-2xl font-medium tracking-tight text-balance sm:text-3xl">{heading}</h2>
          {badge && <p className="mt-2 text-sm text-muted">{badge}</p>}
        </div>

        {!showResults && (
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
        )}

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <AnimatePresence mode="wait">
            {!showResults ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Question {index + 1}</p>
                <h3 className="mt-2 font-display text-xl font-medium leading-snug tracking-tight text-balance">{current.question}</h3>
                {current.hint && <p className="mt-3 text-sm leading-relaxed text-muted">{current.hint}</p>}

                <div className="mt-6 space-y-2.5">
                  {current.options.map((opt, i) => {
                    const selected = answers[index] === i
                    return (
                      <button
                        key={opt.label}
                        onClick={() => selectOption(i)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors',
                          selected ? cn(a.border, a.softBg) : 'border-ink/10 hover:border-ink/20 hover:bg-ink/[0.02]',
                        )}
                      >
                        <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', selected ? cn(a.bg, 'border-transparent') : 'border-ink/20')}>
                          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                        <span className="text-ink/85">{opt.label}</span>
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
                  <Button variant="accent" onClick={next} disabled={!answered} className="disabled:opacity-40 disabled:pointer-events-none">
                    {index === total - 1 ? 'Voir mes résultats' : 'Suivant'} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="text-center">
                  <div className={cn('mx-auto grid h-28 w-28 place-items-center rounded-full', tierAccent.softBg)}>
                    <div>
                      <div className={cn('text-center font-display text-4xl font-semibold', tierAccent.text)}>{score}</div>
                      <div className="text-center text-xs text-muted">/ {maxScore}</div>
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-medium tracking-tight">{tier.title}</h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">{tier.text}</p>
                </div>

                <div className="mt-8 divide-y divide-ink/8 rounded-2xl border border-ink/8">
                  <p className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Détail par obligation</p>
                  {questions.map((q, i) => {
                    const opt = q.options[answers[i]]
                    const badgeColor = opt.score === 2 ? 'emerald' : opt.score === 1 ? 'golden' : 'rose'
                    const badgeAccent = accent(badgeColor)
                    const label = opt.score === 2 ? 'Conforme' : opt.score === 1 ? 'Partiel' : 'Non conforme'
                    return (
                      <div key={q.question} className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-sm text-ink/80">{q.question.length > 80 ? `${q.question.slice(0, 80)}…` : q.question}</span>
                        <span className={cn('shrink-0 rounded-full px-3 py-1 text-xs font-medium', badgeAccent.softBg, badgeAccent.text)}>{label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 rounded-2xl border border-ink/8 bg-paper p-6">
                  <h4 className="font-display text-lg font-medium tracking-tight">{resultsCta.heading}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{resultsCta.body}</p>
                  <div className="mt-5 space-y-3">
                    <input
                      value={form.prenom}
                      onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                      placeholder="Votre prénom"
                      className="w-full rounded-xl border border-ink/12 bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
                    />
                    <input
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      type="email"
                      placeholder="Votre email professionnel"
                      className="w-full rounded-xl border border-ink/12 bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
                    />
                    <input
                      value={form.cse}
                      onChange={(e) => setForm((f) => ({ ...f, cse: e.target.value }))}
                      placeholder="Nom de votre entreprise (optionnel)"
                      className="w-full rounded-xl border border-ink/12 bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
                    />
                    {formError && <p className="text-xs text-coral">{formError}</p>}
                    <Button variant="accent" className="w-full" onClick={submit} disabled={submitted}>
                      {submitted ? resultsCta.submittedLabel : resultsCta.submitLabel}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {resultsCta.legalText}{' '}
                    <a href={resultsCta.legalLink.to} target="_blank" rel="noreferrer" className="link-underline text-accent">
                      {resultsCta.legalLink.label}
                    </a>
                    .
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <Button variant="soft" onClick={restart}>
                    <RotateCcw className="h-4 w-4" /> {restartLabel}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {footer && (
          <div className="border-t border-ink/8 px-6 py-4 text-center text-xs text-muted sm:px-10">
            {footer}{' '}
            {footerLink && (
              <a href={footerLink.to} target="_blank" rel="noreferrer" className="link-underline">
                {footerLink.label}
              </a>
            )}
          </div>
        )}
      </div>
    </Reveal>
  )
}
