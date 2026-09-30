import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'

let app
beforeEach(() => {
  app = createApp()
})

async function makeUser(password = 'supersecret123') {
  const passwordHash = await User.hashPassword(password)
  const user = await User.create({ name: 'Jane', email: `jane+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash })
  const token = jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: '1h' })
  return { user, headers: { Authorization: `Bearer ${token}` } }
}

const change = (h, body) => request(app).post('/api/auth/change-password').set(h).send(body)
const login = (email, password) => request(app).post('/api/auth/login').send({ email, password })

describe('self-service password change', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/auth/change-password').send({ currentPassword: 'a', newPassword: 'newpassword1', confirmNewPassword: 'newpassword1' })
    expect(res.status).toBe(401)
  })

  it('rejects a wrong current password (400, never 401 — a 401 here would trip the app-wide session-expiry logout), and the old password still works afterwards', async () => {
    const { user, headers } = await makeUser('supersecret123')
    const res = await change(headers, { currentPassword: 'wrong-password', newPassword: 'newpassword1', confirmNewPassword: 'newpassword1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/incorrect/i)
    expect((await login(user.email, 'supersecret123')).status).toBe(200)
  })

  it('rejects a new password shorter than 8 characters', async () => {
    const { headers } = await makeUser('supersecret123')
    const res = await change(headers, { currentPassword: 'supersecret123', newPassword: 'short', confirmNewPassword: 'short' })
    expect(res.status).toBe(422)
  })

  it('rejects a mismatched confirmation', async () => {
    const { headers } = await makeUser('supersecret123')
    const res = await change(headers, { currentPassword: 'supersecret123', newPassword: 'newpassword1', confirmNewPassword: 'somethingElse1' })
    expect(res.status).toBe(422)
    expect(res.body.issues.fieldErrors.confirmNewPassword).toBeTruthy()
  })

  it('changes the password: old password stops working, new one logs in', async () => {
    const { user, headers } = await makeUser('supersecret123')
    const res = await change(headers, { currentPassword: 'supersecret123', newPassword: 'newpassword1', confirmNewPassword: 'newpassword1' })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)

    expect((await login(user.email, 'supersecret123')).status).toBe(401)
    expect((await login(user.email, 'newpassword1')).status).toBe(200)
  })

  it('does not require the CURRENT password to also be 8+ chars (only the new one)', async () => {
    // A legacy account could in theory have a short stored password; changing AWAY from
    // it must still work as long as the NEW password meets today's rule.
    const { headers } = await makeUser('short1')
    const res = await change(headers, { currentPassword: 'short1', newPassword: 'newpassword1', confirmNewPassword: 'newpassword1' })
    expect(res.status).toBe(200)
  })
})
