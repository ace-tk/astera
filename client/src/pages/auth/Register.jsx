import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import AuthShell from './AuthShell'
import AccountTypeSelector from './AccountTypeSelector'
import GuestRegisterForm from './GuestRegisterForm'
import CompanyRegisterForm from './CompanyRegisterForm'

const COPY = {
  guest: {
    eyebrow: 'Get started',
    title: 'Create your guest account',
    subtitle: 'Just the essentials — you can start uploading meetings right away.',
  },
  company: {
    eyebrow: 'Get started',
    title: 'Create your ATOOPV account',
    subtitle: 'Tell us about your business — we’ll set up your workspace and send a verification link.',
  },
}

export default function Register() {
  const { register } = useAuth()
  const location = useLocation()
  const from = location.state?.from || '/app'

  const [accountType, setAccountType] = useState(null) // null | 'guest' | 'company'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [doneEmail, setDoneEmail] = useState('')

  const handleSubmit = async (payload) => {
    setError('')
    setBusy(true)
    try {
      await register(payload)
      setDoneEmail(payload.email)
      setDone(true)
    } catch (err) {
      setError(err.status === 409 ? 'An account with that email already exists.' : err.data?.error || err.message || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell eyebrow="Almost there" title="Check your email">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
            <Mail className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            We sent a verification link to <span className="font-medium text-ink">{doneEmail}</span>. Click it to
            activate your account, then sign in.
          </p>
          <Button as={Link} to="/login" variant="accent" size="lg" className="mt-7 w-full">
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (!accountType) {
    return (
      <AuthShell
        eyebrow="Get started"
        title="How will you use ATOOPV?"
        subtitle="Pick the option that fits — you can always add company details later."
        wide
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
              Sign in
            </Link>
          </>
        }
      >
        <AccountTypeSelector onSelect={setAccountType} />
      </AuthShell>
    )
  }

  const copy = COPY[accountType]

  return (
    <AuthShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      wide
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
            Sign in
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={() => setAccountType(null)}
        className="link-underline mb-6 text-sm font-medium text-muted hover:text-ink"
      >
        ← Choose a different account type
      </button>

      {accountType === 'guest' ? (
        <GuestRegisterForm onSubmit={handleSubmit} busy={busy} serverError={error} />
      ) : (
        <CompanyRegisterForm onSubmit={handleSubmit} busy={busy} serverError={error} />
      )}
    </AuthShell>
  )
}
