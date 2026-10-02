import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import AuthShell from './AuthShell'

/**
 * Honest placeholder — the backend has no password-reset endpoint yet, so we
 * don't pretend to send an email. When the endpoint lands, swap this for the
 * real request-reset form.
 */
export default function ForgotPassword() {
  // Authentication page — must not be indexed.
  usePageMeta({ noindex: true })
  return (
    <AuthShell
      eyebrow="Récupération de compte"
      title="La réinitialisation arrive bientôt"
      subtitle="La réinitialisation en libre-service n’est pas encore disponible. Si vous êtes bloqué, contactez-nous et nous vous aiderons à retrouver l’accès."
      footer={
        <>
          Vous vous en souvenez ?{' '}
          <Link to="/login" className="link-underline font-medium text-ink">
            Retour à la connexion
          </Link>
        </>
      }
    >
      <div className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-paper p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
          <KeyRound className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted">
          Écrivez à <span className="font-medium text-ink">contact@atoopv.com</span> depuis l’adresse e-mail de votre
          compte et nous vous aiderons à retrouver l’accès.
        </p>
      </div>
    </AuthShell>
  )
}
