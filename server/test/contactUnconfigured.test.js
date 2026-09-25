import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

// No provider configured: mail would only be logged. The contact form must NOT report success.
vi.hoisted(() => {
  process.env.MAIL_PROVIDER = 'log'
  delete process.env.SMTP_HOST
  delete process.env.RESEND_API_KEY
})

const { createApp } = await import('../src/app.js')

describe('POST /api/contact — mail provider not configured', () => {
  it('returns 503 instead of pretending the message was sent', async () => {
    const res = await request(createApp()).post('/api/contact').send({
      firstName: 'A',
      lastName: 'B',
      role: 'Secrétaire',
      company: 'C',
      email: 'a@b.fr',
      phone: '0612345678',
    })
    expect(res.status).toBe(503)
    expect(res.body.ok).toBeUndefined()
    expect(res.body.code).toBe('MAIL_UNAVAILABLE')
  })

  it('still validates first (400 beats 503)', async () => {
    const res = await request(createApp()).post('/api/contact').send({})
    expect(res.status).toBe(400)
  })
})
