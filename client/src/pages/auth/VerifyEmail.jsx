import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { verifyEmailRequest } from '@/services/auth'
import Button from '@/components/ui/Button'
import AuthShell from './AuthShell'

/** Public — the link emailed on signup lands here. No auth required. */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('pending') // pending | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    verifyEmailRequest(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  if (status === 'pending') {
    return (
      <AuthShell eyebrow="One moment" title="Verifying your email…">
        <div className="flex justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AuthShell>
    )
  }

  if (status === 'success') {
    return (
      <AuthShell eyebrow="Verified" title="Your email is confirmed">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted">Your account is now active. You can sign in.</p>
          <Button as={Link} to="/login" variant="accent" size="lg" className="mt-7 w-full">
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="Link issue" title="This link is invalid or expired">
      <div className="flex flex-col items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-coral/10 text-coral">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          This verification link is no longer valid. Try signing in — you can request a new link from there.
        </p>
        <Button as={Link} to="/login" variant="accent" size="lg" className="mt-7 w-full">
          Go to sign in
        </Button>
      </div>
    </AuthShell>
  )
}
