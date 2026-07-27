import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import AuthShell, { Field } from './AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // Role decides the destination, not wherever the user happened to
      // request /login from — an admin always lands on their dashboard, a
      // customer always lands on their workspace.
      const user = await login(form.email.trim(), form.password)
      navigate(user?.isAdmin ? '/app/admin' : '/app', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? 'Incorrect email or password.' : err.message || 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to ATOOPV"
      subtitle="Access your own meetings, reports, and history."
      footer={
        <>
          New to ATOOPV?{' '}
          <Link to="/register" state={{ from }} className="link-underline font-medium text-ink">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@company.com"
        />
        <Field
          label="Password"
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
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full" magnetic={false} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
