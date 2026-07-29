import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AmbientBackground from '@/components/landing/AmbientBackground'
import Wordmark from '@/components/common/Wordmark'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'
import { cn } from '@/utils/cn'

/**
 * Shared chrome for the sign-in / sign-up screens. Reuses the landing's ambient
 * field and the existing wordmark so the auth flow feels of a piece with the
 * product — no new design language, just the locked one on a focused canvas.
 * `wide` widens the card for forms with many fields (registration) — same
 * card styling, just more room; Login/ForgotPassword are unaffected.
 */
export default function AuthShell({ eyebrow, title, subtitle, children, footer, wide = false }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-10">
      <AmbientBackground />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" aria-label="ATOOPV home">
          <Wordmark />
        </Link>
        <ThemeSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative w-full rounded-[2rem] border border-ink/8 bg-card/90 p-8 shadow-float backdrop-blur-xl sm:p-10',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-sm text-muted">{subtitle}</p>}

        <div className="mt-8">{children}</div>

        {footer && <div className="mt-7 border-t border-ink/8 pt-5 text-center text-sm text-muted">{footer}</div>}
      </motion.div>
    </main>
  )
}

/** Labelled text field matching the app's input treatment. */
export const Field = forwardRef(function Field(
  { label, id, hint, error, className, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        ref={ref}
        id={id}
        className={
          'h-12 w-full rounded-2xl border bg-paper px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent ' +
          (error ? 'border-coral' : 'border-ink/12 hover:border-ink/25') +
          (className ? ' ' + className : '')
        }
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  )
})
