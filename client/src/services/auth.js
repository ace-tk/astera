import { api } from './api'

/**
 * Auth API calls. The backend returns `{ token, user }` on signup/login and
 * `{ user }` on /auth/me. Thin wrappers keep AuthContext readable.
 */
export const signupRequest = (payload) => api.post('/auth/signup', payload)
export const loginRequest = (payload) => api.post('/auth/login', payload)
export const meRequest = () => api.get('/auth/me')
export const updateProfileRequest = (patch) => api.patch('/auth/me', patch)
export const changePasswordRequest = (payload) => api.post('/auth/change-password', payload)
// `file` is a File/Blob from an <input type="file">; the api wrapper sends FormData as multipart automatically.
export const uploadCompanyLogoRequest = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/auth/me/logo', form)
}
export const verifyEmailRequest = (token) => api.get(`/auth/verify-email/${token}`)
export const resendVerificationRequest = (email) => api.post('/auth/resend-verification', { email })
