import { describe, it, expect, afterAll, vi } from 'vitest'
import request from 'supertest'
import net from 'node:net'

// A mail server that ACCEPTS the connection and then says nothing at all (no SMTP greeting) —
// the situation in which a valid contact request used to leave the form on "sending".
const SMTP_PORT = vi.hoisted(() => {
  const port = 30000 + Math.floor(Math.random() * 20000)
  process.env.MAIL_PROVIDER = 'smtp'
  process.env.SMTP_HOST = '127.0.0.1'
  process.env.SMTP_PORT = String(port)
  process.env.SMTP_SECURE = 'false'
  process.env.CONTACT_MAIL_DEADLINE_MS = '500'
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

const sockets = new Set()
const silent = net.createServer((s) => { sockets.add(s); s.on('close', () => sockets.delete(s)) })
await new Promise((r) => silent.listen(SMTP_PORT, '127.0.0.1', r))
afterAll(async () => {
  for (const s of sockets) s.destroy()
  await new Promise((r) => silent.close(r))
})

describe('POST /api/contact — a stalled mail server cannot hold the request open', () => {
  it('answers within the deadline with 502 MAIL_TIMEOUT (never a fake success, no internals)', async () => {
    const started = Date.now()
    const res = await request(createApp()).post('/api/contact').send(VALID)
    const took = Date.now() - started
    expect(res.status).toBe(502)
    expect(res.body.code).toBe('MAIL_TIMEOUT')
    expect(res.body.ok).toBeUndefined()
    expect(res.body.error).toContain('contact@atoopv.com')
    expect(JSON.stringify(res.body)).not.toMatch(/127\.0\.0\.1|smtp|ms/i)
    expect(took).toBeLessThan(3000)
  })
})
