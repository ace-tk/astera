import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import AuthShell from './AuthShell'

/**
 * Honest placeholder — the backend has no password-reset endpoint yet, so we
 * don't pretend to send an email. When the endpoint lands, swap this for the
 * real request-reset form.
 */
export default function ForgotPassword() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Password reset is on the way"
      subtitle="Self-serve reset isn’t wired up in this build yet. If you’re locked out, reach the team and we’ll restore access."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/login" className="link-underline font-medium text-ink">
            Back to sign in
          </Link>
        </>
      }
    >
      <div className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-paper p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <KeyRound className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted">
          Email <span className="font-medium text-ink">support@astera.app</span> from your account address and we’ll help
          you back in.
        </p>
      </div>
    </AuthShell>
  )
}
