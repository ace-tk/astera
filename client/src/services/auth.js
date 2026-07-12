import { api } from './api'

/**
 * Auth API calls. The backend returns `{ token, user }` on signup/login and
 * `{ user }` on /auth/me. Thin wrappers keep AuthContext readable.
 */
export const signupRequest = (payload) => api.post('/auth/signup', payload)
export const loginRequest = (payload) => api.post('/auth/login', payload)
export const meRequest = () => api.get('/auth/me')
export const updateProfileRequest = (patch) => api.patch('/auth/me', patch)
