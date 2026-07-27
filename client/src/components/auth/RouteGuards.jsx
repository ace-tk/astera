import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/common/PageLoader'

/**
 * True once the app has navigated away from wherever this guard instance
 * believes it's mounted. App.jsx wraps <Routes> in <AnimatePresence
 * mode="wait"> keyed by pathname, so the outgoing route tree — including
 * this guard — stays mounted (and still subscribed to context) for the
 * duration of its exit transition. If auth state changes during that
 * window, a stale instance would otherwise still act on it: re-firing a
 * <Navigate>-style redirect (its effect has no dependency array, so it
 * refires on every re-render — an infinite loop as react-router keeps
 * reacting to it) and swapping its own rendered output to a different
 * element type mid-exit (e.g. PageLoader in place of the real children),
 * which confuses AnimatePresence about what it's still animating and leaves
 * the transition stuck forever. Checking the real, live browser location
 * (not this instance's own frozen `useLocation()` value) tells a stale
 * instance to just stay out of the way.
 */
function useStale(guardPathname) {
  return typeof window !== 'undefined' && window.location.pathname !== guardPathname
}

/** Redirect once per real auth-state transition — imperatively, with a proper dependency array, and only from the live (non-stale) instance. See useStale above. */
function useRedirect(should, to, options, stale) {
  const navigate = useNavigate()
  useEffect(() => {
    if (should && !stale) navigate(to, options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [should, to])
}

/**
 * Gate a route to signed-in users. While the session is being restored we hold
 * on a loader rather than bouncing to /login (which would flash on refresh).
 * Guests are sent to sign in and returned here afterwards.
 */
export function RequireAuth({ children }) {
  const { isAuthed, isLoading } = useAuth()
  const location = useLocation()
  const stale = useStale(location.pathname)
  const from = location.pathname + location.search
  useRedirect(!isLoading && !isAuthed, '/login', { replace: true, state: { from } }, stale)
  if (stale) return children
  if (isLoading || !isAuthed) return <PageLoader />
  return children
}

/** The inverse — keep authenticated users out of /login and /register. */
export function GuestOnly({ children }) {
  const { isAuthed, isLoading } = useAuth()
  const location = useLocation()
  const stale = useStale(location.pathname)
  const to = location.state?.from || '/app'
  useRedirect(!isLoading && isAuthed, to, { replace: true }, stale)
  if (stale) return children
  if (isLoading || isAuthed) return <PageLoader />
  return children
}

/** Admin-only. Guests go to sign in; signed-in non-admins are sent back to /app. */
export function RequireAdmin({ children }) {
  const { isAuthed, isLoading, user } = useAuth()
  const location = useLocation()
  const stale = useStale(location.pathname)
  const from = location.pathname
  useRedirect(!isLoading && !isAuthed, '/login', { replace: true, state: { from } }, stale)
  useRedirect(!isLoading && isAuthed && !user?.isAdmin, '/app', { replace: true }, stale)
  if (stale) return children
  if (isLoading || !isAuthed || !user?.isAdmin) return <PageLoader />
  return children
}
