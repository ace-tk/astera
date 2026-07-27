import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/common/PageLoader'

/**
 * Gate a route to signed-in users. While the session is being restored we hold
 * on a loader rather than bouncing to /login (which would flash on refresh).
 * Guests are sent to sign in and returned here afterwards.
 */
export function RequireAuth({ children }) {
  const { isAuthed, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <PageLoader />
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return children
}

/** The inverse — keep authenticated users out of /login and /register. */
export function GuestOnly({ children }) {
  const { isAuthed, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <PageLoader />
  if (isAuthed) return <Navigate to={location.state?.from || '/app'} replace />
  return children
}

/** Admin-only. Guests go to sign in; signed-in non-admins are sent back to /app. */
export function RequireAdmin({ children }) {
  // TEMP — Admin Portal UI review bypass. Dev-build only (import.meta.env.DEV
  // is always false in a production build, so this cannot ship). Remove this
  // block to restore the real guard below once the UI is finalized.
  if (import.meta.env.DEV) return children

  const { isAuthed, isLoading, user } = useAuth()
  const location = useLocation()
  if (isLoading) return <PageLoader />
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!user?.isAdmin) return <Navigate to="/app" replace />
  return children
}
