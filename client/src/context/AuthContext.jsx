import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { setAuthToken, onUnauthorized } from '@/services/api'
import { signupRequest, loginRequest, meRequest } from '@/services/auth'

const AuthContext = createContext(null)
const TOKEN_KEY = 'astera:token'

const readToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

/**
 * The real-product session. Holds the JWT (persisted to localStorage) and the
 * current user, restores the session on load via /auth/me, and exposes
 * login/register/logout. Demo mode never touches this — a guest here simply has
 * no user, and the app falls back to the seeded demo experience.
 *
 * `status`: 'loading' while restoring, then 'authed' or 'guest'.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken)
  const [user, setUser] = useState(null)
  // Only 'loading' when we actually have a token to verify on boot.
  const [status, setStatus] = useState(() => (readToken() ? 'loading' : 'guest'))
  const tokenRef = useRef(token)

  // Persist the token and keep the API client in sync — every request attaches
  // it automatically once set here.
  const persistToken = useCallback((next) => {
    tokenRef.current = next
    setToken(next)
    setAuthToken(next)
    try {
      if (next) window.localStorage.setItem(TOKEN_KEY, next)
      else window.localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* storage may be unavailable (private mode) — session still works in-memory */
    }
  }, [])

  const clearSession = useCallback(() => {
    persistToken(null)
    setUser(null)
    setStatus('guest')
  }, [persistToken])

  const applyAuth = useCallback(
    ({ token: t, user: u }) => {
      persistToken(t)
      setUser(u)
      setStatus('authed')
      return u
    },
    [persistToken],
  )

  // On mount: push any stored token into the API client, then verify it.
  useEffect(() => {
    setAuthToken(tokenRef.current)
    if (!tokenRef.current) return
    let active = true
    meRequest()
      .then(({ user: u }) => {
        if (!active) return
        setUser(u)
        setStatus('authed')
      })
      .catch(() => {
        if (active) clearSession()
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // An expired/invalid session (401 on an authenticated request) logs out.
  useEffect(() => onUnauthorized(clearSession), [clearSession])

  const login = useCallback(async (email, password) => applyAuth(await loginRequest({ email, password })), [applyAuth])
  // Signup no longer returns a session — the account must be email-verified
  // before it can log in, so this just submits the form and lets the caller
  // show a "check your email" confirmation instead of navigating into the app.
  const register = useCallback(async (payload) => signupRequest(payload), [])
  const logout = useCallback(() => clearSession(), [clearSession])
  const refresh = useCallback(async () => {
    const { user: u } = await meRequest()
    setUser(u)
    return u
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthed: status === 'authed',
      isLoading: status === 'loading',
      login,
      register,
      logout,
      refresh,
      setUser,
    }),
    [user, token, status, login, register, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
