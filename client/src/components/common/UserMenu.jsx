import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, UserRound, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import Button from '@/components/ui/Button'

/** Two initials from a name, for the avatar. */
const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'U'

/**
 * Top-bar account control. Guests see a "Sign in" entry into the real product;
 * signed-in users get an avatar + name that opens a menu with a profile shortcut
 * and logout. Mirrors the Notifications dropdown so it feels native to the bar.
 */
export default function UserMenu() {
  const { isAuthed, user, logout } = useAuth()
  const navigate = useNavigate()
  const { play } = useSound()
  const [open, setOpen] = useState(false)

  if (!isAuthed) {
    return (
      <Button as={Link} to="/login" size="sm" variant="soft" magnetic={false}>
        Sign in
      </Button>
    )
  }

  const onLogout = () => {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v)
          play(open ? 'close' : 'open')
        }}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-ink/8 bg-card py-1 pl-1 pr-1 text-sm transition-colors hover:border-ink/20 sm:pr-3"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-white">
          {initialsOf(user?.name)}
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium sm:block">{user?.name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-float"
            >
              <div className="border-b border-ink/8 px-4 py-3">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/app/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-ink/[0.04]"
                >
                  <UserRound className="h-4 w-4 text-muted" /> Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/app/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-ink/[0.04]"
                  >
                    <ShieldCheck className="h-4 w-4 text-accent" /> Admin
                  </Link>
                )}
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-coral transition-colors hover:bg-coral/[0.06]"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
