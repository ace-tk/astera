import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import Button from '@/components/ui/Button'
import AuthShell from './AuthShell'
import AccountTypeSelector from './AccountTypeSelector'
import GuestRegisterForm from './GuestRegisterForm'
import CompanyRegisterForm from './CompanyRegisterForm'

const COPY = {
  guest: {
    eyebrow: 'Pour commencer',
    title: 'Créez votre compte invité',
    subtitle: 'Juste l’essentiel — vous pouvez commencer à déposer vos réunions tout de suite.',
  },
  company: {
    eyebrow: 'Pour commencer',
    title: 'Créez votre compte ATOOPV',
    subtitle: 'Parlez-nous de votre entreprise — nous configurons votre espace et vous envoyons un lien de vérification.',
  },
}

export default function Register() {
  // Authentication page — must not be indexed.
  usePageMeta({ noindex: true })
  const { register } = useAuth()
  const location = useLocation()
  const from = location.state?.from || '/app'
  const [searchParams] = useSearchParams()
  // Deep link from e.g. the Contact page's "Register as a company" link
  // (/register?type=company) — skips straight past the picker, same form
  // and flow as picking "Company Registration" there manually.
  const initialType = searchParams.get('type') === 'company' ? 'company' : null

  const [accountType, setAccountType] = useState(initialType) // null | 'guest' | 'company'
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
      setError(err.status === 409 ? 'Un compte existe déjà avec cette adresse e-mail.' : err.data?.error || err.message || 'Impossible de créer votre compte.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell eyebrow="Presque fini" title="Vérifiez votre e-mail">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald/10 text-emerald">
            <Mail className="h-7 w-7" />
          </span>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Nous avons envoyé un lien de vérification à <span className="font-medium text-ink">{doneEmail}</span>.
            Cliquez dessus pour activer votre compte, puis connectez-vous.
          </p>
          <Button as={Link} to="/login" variant="accent" size="lg" className="mt-7 w-full">
            Aller à la connexion
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (!accountType) {
    return (
      <AuthShell
        eyebrow="Pour commencer"
        title="Comment allez-vous utiliser ATOOPV ?"
        subtitle="Choisissez l’option qui vous correspond — vous pourrez toujours compléter les informations de votre entreprise plus tard."
        wide
        footer={
          <>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
              Se connecter
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
          Vous avez déjà un compte ?{' '}
          <Link to="/login" state={{ from }} className="link-underline font-medium text-ink">
            Se connecter
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={() => setAccountType(null)}
        className="link-underline mb-6 text-sm font-medium text-muted hover:text-ink"
      >
        ← Choisir un autre type de compte
      </button>

      {accountType === 'guest' ? (
        <GuestRegisterForm onSubmit={handleSubmit} busy={busy} serverError={error} />
      ) : (
        <CompanyRegisterForm onSubmit={handleSubmit} busy={busy} serverError={error} />
      )}
    </AuthShell>
  )
}
