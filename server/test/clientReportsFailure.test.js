import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { ClientReport } from '../src/models/ClientReport.js'

// Storage fails: the upload must report an error and leave no report behind.
vi.mock('../src/services/attachments.js', async (importOriginal) => ({
  ...(await importOriginal()),
  saveAttachment: vi.fn(() => Promise.reject(new Error('GridFS is down'))),
}))

let app
beforeEach(() => { app = createApp() })

describe('Client Reports — failed upload', () => {
  it('answers with a clear error, creates no report, and does not leak the internal reason', async () => {
    const admin = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@x.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
    const client = await User.create({ name: 'c', email: `c+${new mongoose.Types.ObjectId()}@x.dev`, passwordHash: await User.hashPassword('supersecret123') })
    const auth = { Authorization: `Bearer ${jwt.sign({ sub: String(admin._id) }, env.jwtSecret)}` }
    const res = await request(app).post(`/api/admin/customers/${client._id}/client-reports`).set(auth).attach('file', Buffer.from('%PDF-1.4\n%%EOF'), { filename: 'r.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(500)
    expect(res.body.code).toBe('STORAGE_FAILED')
    expect(JSON.stringify(res.body)).not.toMatch(/GridFS|is down/)
    expect(await ClientReport.countDocuments()).toBe(0)
  })
})
