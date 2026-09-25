import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'
import { startSmtpSink, parseRaw } from './smtpSink.js'

// env.js reads process.env once at import, so the SMTP target must be set before anything imports it.
const SMTP_PORT = vi.hoisted(() => {
  const port = 30000 + Math.floor(Math.random() * 20000)
  process.env.MAIL_PROVIDER = 'smtp'
  process.env.SMTP_HOST = '127.0.0.1'
  process.env.SMTP_PORT = String(port)
  process.env.SMTP_SECURE = 'false'
  process.env.MAIL_FROM = 'ATOOPV <no-reply@atoopv.com>'
  delete process.env.CONTACT_TO_EMAIL // exercise the default recipient
  return port
})

const { createApp } = await import('../src/app.js')

const VALID = {
  firstName: 'Christine',
  lastName: 'Lefèvre',
  role: 'Secrétaire',
  company: 'Société Générale d’Exemple',
  email: 'christine.lefevre@exemple.fr',
  phone: '06 12 34 56 78',
  companySize: '11 — 49 salariés',
  electedCount: 'Moins de 8',
  meetingDuration: 'Moins de 2 heures',
  hasRecording: 'Oui — audio ou vidéo disponible',
  message: 'Bonjour,\nNous cherchons un rédacteur de PV.',
}

let sink
beforeAll(async () => {
  sink = await startSmtpSink(SMTP_PORT)
})
afterAll(async () => {
  await sink.close()
})

describe('POST /api/contact — delivery through a real SMTP connection', () => {
  const app = createApp()

  it('sends the enquiry to contact@atoopv.com with Reply-To set to the visitor, and only then says ok', async () => {
    const before = sink.messages.length
    const res = await request(app).post('/api/contact').send({
      ...VALID,
      message: 'Bonjour <script>alert(1)</script> & merci',
    })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })

    expect(sink.messages).toHaveLength(before + 1)
    const msg = sink.messages.at(-1)
    expect(msg.to.join(' ')).toContain('<contact@atoopv.com>')
    const { headers, body, html, text } = parseRaw(msg.raw)
    expect(headers.from[0]).toContain('no-reply@atoopv.com')
    expect(headers.to[0]).toBe('contact@atoopv.com')
    expect(headers['reply-to']).toHaveLength(1)
    expect(headers['reply-to'][0]).toContain('christine.lefevre@exemple.fr')
    expect(headers.subject[0]).toContain('Société Générale d’Exemple')
    expect(body).toContain('Lefèvre')
    expect(body).toContain('06 12 34 56 78')
    // The visitor's text is HTML-escaped in the HTML part - never rendered as markup...
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toMatch(/<script/i)
    // ...while the plain-text alternative (never rendered as HTML) carries it verbatim.
    expect(text).toContain('<script>alert(1)</script>')
  })

  it('cannot be used for header injection (CR/LF in a name never becomes a header)', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...VALID, firstName: 'Jean\r\nBcc: evil@attacker.example', company: 'Acme\r\nX-Injected: 1' })
    expect(res.status).toBe(200)
    const { headerText } = parseRaw(sink.messages.at(-1).raw)
    expect(headerText).not.toMatch(/^Bcc:/im)
    expect(headerText).not.toMatch(/^X-Injected:/im)
    expect(sink.messages.at(-1).to).toHaveLength(1)
  })

  it('rejects an email address containing a line break', async () => {
    const before = sink.messages.length
    const res = await request(app).post('/api/contact').send({ ...VALID, email: 'a@b.fr\r\nBcc: evil@attacker.example' })
    // The break is stripped to a space, which is not a valid address.
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors.email).toBe('Format email invalide.')
    expect(sink.messages).toHaveLength(before)
  })
})

describe('POST /api/contact — server-side validation (nothing is sent)', () => {
  const app = createApp()

  it('returns French field errors for an empty submission', async () => {
    const before = sink.messages.length
    const res = await request(app).post('/api/contact').send({})
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toEqual({
      firstName: 'Le prénom est requis.',
      lastName: 'Le nom est requis.',
      role: 'Sélectionnez votre fonction.',
      company: "Le nom de l'entreprise est requis.",
      email: "L'email professionnel est requis.",
      phone: 'Le téléphone est requis.',
    })
    expect(sink.messages).toHaveLength(before)
  })

  it('validates email format and phone length', async () => {
    const res = await request(app).post('/api/contact').send({ ...VALID, email: 'not-an-email', phone: '123' })
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors).toEqual({ email: 'Format email invalide.', phone: 'Numéro de téléphone invalide.' })
  })

  it('treats non-string / oversized values as invalid instead of crashing', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ ...VALID, firstName: { $ne: null }, message: 'x'.repeat(5001) })
    expect(res.status).toBe(400)
    expect(res.body.fieldErrors.firstName).toBe('Le prénom est requis.')
    expect(res.body.fieldErrors.message).toMatch(/trop long/i)
  })
})

describe('POST /api/contact — abuse protection', () => {
  it('rate-limits a single client after 5 requests', async () => {
    const app = createApp() // fresh limiter store
    for (let i = 0; i < 5; i++) expect((await request(app).post('/api/contact').send({})).status).toBe(400)
    const res = await request(app).post('/api/contact').send(VALID)
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch(/Trop de demandes/)
  })
})
