import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'

// A real in-memory Mongo is connected by test/setup.js, so these tests exercise
// the true persistence + ownership path. Each user is a fresh ObjectId identity.
const app = createApp()
const tokenFor = (id) => jwt.sign({ sub: id }, env.jwtSecret, { expiresIn: '1h' })
const newUser = () => {
  const id = new mongoose.Types.ObjectId().toString()
  return { id, token: tokenFor(id) }
}
const SAMPLE =
  'Maya: We decided to ship the billing rewrite.\nDan: I am worried it might slip.\nSam: I will send the metrics by Fri.'

describe('health & meta', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('sets secure headers (helmet)', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['content-security-policy']).toBeTruthy()
  })

  it('returns 404 JSON for an unknown route', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/not found/i)
  })
})

describe('reports — reads require auth and are owner-scoped', () => {
  it('rejects an unauthenticated GET /api/reports with 401', async () => {
    const res = await request(app).get('/api/reports')
    expect(res.status).toBe(401)
  })

  it('returns only the caller’s own reports (empty for a fresh account)', async () => {
    const { token } = newUser()
    const res = await request(app).get('/api/reports').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.reports).toEqual([])
  })
})

describe('reports — writes are protected', () => {
  it('rejects an unauthenticated POST /api/reports with 401', async () => {
    const res = await request(app).post('/api/reports').send({ title: 'x', transcript: 'hi' })
    expect(res.status).toBe(401)
  })

  it('rejects a bad token with 401', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ title: 'x', transcript: 'hi' })
    expect(res.status).toBe(401)
  })

  it('rejects an empty upload (no transcript, no file) with 422', async () => {
    const { token } = newUser()
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No transcript here' })
    expect(res.status).toBe(422)
  })

  it('generates and persists a report for a valid authenticated request', async () => {
    const { token } = newUser()
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Weekly sync', transcript: SAMPLE })
    expect(res.status).toBe(201)
    expect(res.body.report.title).toBe('Weekly sync')
    expect(res.body.report.id).toBeTruthy()
    expect(res.body.report.engine).toBe('heuristic')
    expect(res.body.report.dna).toBeTruthy()
    // heuristic extraction found the cues
    expect(res.body.report.metrics.decisions).toBeGreaterThanOrEqual(1)
  })

  it('accepts a transcript uploaded as a text file', async () => {
    const { token } = newUser()
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'From file')
      .attach('media', Buffer.from(SAMPLE), { filename: 'meeting.txt', contentType: 'text/plain' })
    expect(res.status).toBe(201)
    expect(res.body.report.source.fileName).toBe('meeting.txt')
    expect(res.body.report.metrics.decisions).toBeGreaterThanOrEqual(1)
  })
})

describe('reports — full lifecycle & ownership isolation', () => {
  it('persists across requests, edits, and deletes — scoped to the owner', async () => {
    const alice = newUser()
    const bob = newUser()

    // Alice creates a report
    const created = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ title: 'Alice roadmap', transcript: SAMPLE })
    expect(created.status).toBe(201)
    const id = created.body.report.id

    // …and can list & fetch it back (persistence)
    const list = await request(app).get('/api/reports').set('Authorization', `Bearer ${alice.token}`)
    expect(list.body.reports).toHaveLength(1)
    const got = await request(app).get(`/api/reports/${id}`).set('Authorization', `Bearer ${alice.token}`)
    expect(got.status).toBe(200)
    expect(got.body.report.title).toBe('Alice roadmap')

    // Bob cannot see or fetch Alice's report (ownership isolation)
    const bobList = await request(app).get('/api/reports').set('Authorization', `Bearer ${bob.token}`)
    expect(bobList.body.reports).toEqual([])
    const bobGet = await request(app).get(`/api/reports/${id}`).set('Authorization', `Bearer ${bob.token}`)
    expect(bobGet.status).toBe(404)

    // Bob cannot edit or delete it either
    expect((await request(app).patch(`/api/reports/${id}`).set('Authorization', `Bearer ${bob.token}`).send({ title: 'hijack' })).status).toBe(404)
    expect((await request(app).delete(`/api/reports/${id}`).set('Authorization', `Bearer ${bob.token}`)).status).toBe(404)

    // Alice edits it (Review Mode) — change persists
    const patched = await request(app)
      .patch(`/api/reports/${id}`)
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ title: 'Alice roadmap v2', priority: 'high', notes: 'follow up Monday' })
    expect(patched.status).toBe(200)
    expect(patched.body.report.title).toBe('Alice roadmap v2')
    expect(patched.body.report.priority).toBe('high')
    const reGot = await request(app).get(`/api/reports/${id}`).set('Authorization', `Bearer ${alice.token}`)
    expect(reGot.body.report.notes).toBe('follow up Monday')

    // Alice deletes it — gone
    const del = await request(app).delete(`/api/reports/${id}`).set('Authorization', `Bearer ${alice.token}`)
    expect(del.status).toBe(200)
    const afterList = await request(app).get('/api/reports').set('Authorization', `Bearer ${alice.token}`)
    expect(afterList.body.reports).toEqual([])
  })
})

describe('auth validation', () => {
  it('rejects a malformed login with 422', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' })
    expect(res.status).toBe(422)
  })

  it('requires a token for GET /api/auth/me', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
