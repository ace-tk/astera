import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import AuthShell, { Field } from './AuthShell'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.status === 409 ? 'An account with that email already exists.' : err.message || 'Could not create your account.')
      setBusy(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your ATOOPV account"
      subtitle="Upload real meetings and get reports that are yours — saved and waiting when you return."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label="Name"
          id="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Ada Lovelace"
        />
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
          autoComplete="new-password"
          required
          value={form.password}
          onChange={set('password')}
          hint="At least 8 characters."
          placeholder="••••••••"
        />

        {error && (
          <p role="alert" className="rounded-2xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-sm text-coral">
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" size="lg" className="w-full" magnetic={false} disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Just exploring?{' '}
        <Link to="/app" className="link-underline font-medium text-ink">
          Continue to the demo
        </Link>
      </p>
    </AuthShell>
  )
}
