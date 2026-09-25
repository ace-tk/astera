import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { startSmtpSink } from './smtpSink.js'

// SMTP configured, but nothing is listening on that port yet — i.e. the mail server is down.
const SMTP_PORT = vi.hoisted(() => {
  const port = 30000 + Math.floor(Math.random() * 20000)
  process.env.MAIL_PROVIDER = 'smtp'
  process.env.SMTP_HOST = '127.0.0.1'
  process.env.SMTP_PORT = String(port)
  process.env.SMTP_SECURE = 'false'
  return port
})

const { createApp } = await import('../src/app.js')

const VALID = {
  firstName: 'Christine',
  lastName: 'Lefèvre',
  role: 'Secrétaire',
  company: 'Exemple SA',
  email: 'christine@exemple.fr',
  phone: '06 12 34 56 78',
}

describe('POST /api/contact — when email cannot be delivered, the visitor is told the truth', () => {
  it('502 (not a fake success) when the mail server is unreachable', async () => {
    const res = await request(createApp()).post('/api/contact').send(VALID)
    expect(res.status).toBe(502)
    expect(res.body.ok).toBeUndefined()
    expect(res.body.code).toBe('MAIL_FAILED')
    expect(res.body.error).toMatch(/momentanément indisponible/)
    expect(res.body.error).toContain('contact@atoopv.com') // gives them a fallback way to reach the team
    // No internals leak to the visitor.
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|127\.0\.0\.1|smtp/i)
  })

  it('502 when the mail server accepts the connection but rejects the message', async () => {
    const rejecting = await startSmtpSink(SMTP_PORT, { reject: true })
    try {
      const res = await request(createApp()).post('/api/contact').send(VALID)
      expect(res.status).toBe(502)
      expect(res.body.code).toBe('MAIL_FAILED')
      expect(rejecting.messages).toHaveLength(0)
    } finally {
      await rejecting.close()
    }
  })

  it('recovers: succeeds as soon as the mail server is back', async () => {
    const sink = await startSmtpSink(SMTP_PORT)
    try {
      const res = await request(createApp()).post('/api/contact').send(VALID)
      expect(res.status).toBe(200)
      expect(sink.messages).toHaveLength(1)
    } finally {
      await sink.close()
    }
  })
})
