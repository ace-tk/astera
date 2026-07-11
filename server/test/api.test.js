import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'

// No database is connected in the test env, so controllers take their
// demo/guard paths — exactly what lets us test the security surface in isolation.
const app = createApp()
const token = jwt.sign({ sub: 'test-user' }, env.jwtSecret, { expiresIn: '1h' })

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

describe('reports — reads', () => {
  it('GET /api/reports serves demo data without a database', async () => {
    const res = await request(app).get('/api/reports')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.reports)).toBe(true)
    expect(res.body.reports.length).toBeGreaterThan(0)
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

  it('validates the body with 422 when authenticated but incomplete', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No transcript here' })
    expect(res.status).toBe(422)
    expect(res.body.error).toMatch(/invalid/i)
  })

  it('generates a report for a valid authenticated request', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Weekly sync',
        transcript: 'Maya: We decided to ship the billing rewrite.\nDan: I am worried it might slip.\nSam: I will send the metrics by Fri.',
      })
    expect(res.status).toBe(201)
    expect(res.body.report.title).toBe('Weekly sync')
    // heuristic extraction found the cues
    expect(res.body.report.metrics.decisions).toBeGreaterThanOrEqual(1)
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
