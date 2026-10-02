import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { resendVerificationRequest } from '@/services/auth'
import { usePageMeta } from '@/hooks/usePageMeta'
import Button from '@/components/ui/Button'
import AuthShell, { Field } from './AuthShell'

export default function Login() {
  // Authentication page — must not be indexed.
  usePageMeta({ noindex: true })
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const needsVerification = /verify/i.test(error)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResent(false)
    setBusy(true)
    try {
      // Role decides the destination, not wherever the user happened to
      // request /login from — an admin always lands on their dashboard, a
      // customer always lands on their workspace.
      const user = await login(form.email.trim(), form.password)
      navigate(user?.isAdmin ? '/app/admin' : '/app', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'E-mail ou mot de passe incorrect.' : err.message || 'Connexion impossible.')
      setBusy(false)
    }
  }

  const onResend = async () => {
    await resendVerificationRequest(form.email.trim())
    setResent(true)
  }

  return (
    <AuthShell
      eyebrow="Bon retour"
      title="Connexion à votre espace client"
      subtitle="Accédez à vos réunions, rapports et historique."
      footer={
        <>
          Nouveau sur ATOOPV ?{' '}
          <Link to="/register" state={{ from }} className="link-underline font-medium text-ink">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="E-mail"
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="vous@entreprise.com"
        />
        <Field
          label="Mot de passe"
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="••••••••"
        />

        <div className="flex justify-end">
          <Link to="/forgot" className="text-xs text-muted transition-colors hover:text-ink">
            Mot de passe oublié ?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
            {error}
            {needsVerification && !resent && (
              <>
                {' '}
                <button type="button" onClick={onResend} className="link-underline font-medium text-coral">
                  Renvoyer l'e-mail de vérification
                </button>
              </>
            )}
            {needsVerification && resent && <span className="mt-1 block font-medium">E-mail de vérification envoyé — consultez votre boîte de réception.</span>}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full" magnetic={false} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours…
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
