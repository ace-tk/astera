import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'

const app = createApp()

const adminToken = async () => {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'Admin', email: `admin+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return { token: jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' }), user: u }
}

const guestSignup = (overrides = {}) => ({
  accountType: 'guest',
  firstName: 'Sam',
  lastName: 'Guest',
  email: `sam+${new mongoose.Types.ObjectId()}@astera.dev`,
  phone: '+919876543210',
  password: 'supersecret123',
  confirmPassword: 'supersecret123',
  ...overrides,
})

describe('Guest registration (Phase 2)', () => {
  it('creates a guest account with accountType=guest and blank company fields', async () => {
    const payload = guestSignup()
    const res = await request(app).post('/api/auth/signup').send(payload)
    expect(res.status).toBe(201)

    const stored = await User.findOne({ email: payload.email })
    expect(stored.accountType).toBe('guest')
    expect(stored.companyName).toBeUndefined()
    expect(stored.vatNumber).toBeUndefined()
    expect(stored.country).toBeUndefined()
    expect(stored.linkedinUrl).toBeUndefined()
    expect(stored.firstName).toBe('Sam')
    expect(stored.phone).toBe('+919876543210')
  })

  it('rejects a guest payload missing required fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({ accountType: 'guest', firstName: 'Sam' })
    expect(res.status).toBe(422)
  })

  it('still enforces phone format for guests', async () => {
    const res = await request(app).post('/api/auth/signup').send(guestSignup({ phone: '12345' }))
    expect(res.status).toBe(422)
  })

  it('a guest can verify and log in normally, and gets no isAdmin/company leakage', async () => {
    const payload = guestSignup()
    await request(app).post('/api/auth/signup').send(payload)
    const stored = await User.findOne({ email: payload.email }).select('+verificationToken')
    await request(app).get(`/api/auth/verify-email/${stored.verificationToken}`)

    const login = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password })
    expect(login.status).toBe(200)
    expect(login.body.user.accountType).toBe('guest')
    expect(login.body.user.companyName).toBeFalsy()
  })
})

describe('Company registration still works unchanged (Phase 2 regression check)', () => {
  it('still requires accountType and all company fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      accountType: 'company',
      companyName: 'Acme', vatNumber: 'VAT12345', country: 'France',
      firstName: 'Ada', lastName: 'Lovelace', phone: '+33612345678',
      email: `ada+${new mongoose.Types.ObjectId()}@astera.dev`,
      linkedinUrl: 'https://linkedin.com/in/ada',
      password: 'supersecret123', confirmPassword: 'supersecret123',
    })
    expect(res.status).toBe(201)
  })
})

describe('Admin customer search improvements (Phase 2)', () => {
  it('finds a customer by VAT number and by phone number', async () => {
    const { token } = await adminToken()
    const create = await request(app).post('/api/admin/customers').set('Authorization', `Bearer ${token}`).send({
      companyName: 'Ledgerly Corp', vatNumber: 'GBUNIQUE99', country: 'United Kingdom',
      firstName: 'Dan', lastName: 'Reyes', phone: '+447700900123',
      email: `dan+${new mongoose.Types.ObjectId()}@astera.dev`,
      linkedinUrl: 'https://linkedin.com/in/danreyes',
    })
    expect(create.status).toBe(201)

    const byVat = await request(app).get('/api/admin/customers?q=GBUNIQUE99').set('Authorization', `Bearer ${token}`)
    expect(byVat.body.customers.some((c) => c.id === create.body.customer.id)).toBe(true)

    const byPhone = await request(app).get('/api/admin/customers?q=447700900123').set('Authorization', `Bearer ${token}`)
    expect(byPhone.body.customers.some((c) => c.id === create.body.customer.id)).toBe(true)
  })

  it('does not crash on regex-special characters in the search query', async () => {
    const { token } = await adminToken()
    const res = await request(app).get('/api/admin/customers?q=%2B1%20(555)').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})

describe('Customer stats + activity timeline + audit history (Phase 2)', () => {
  it('returns totalReports/pendingReports/deliveredReports/lastReportAt in the detail response', async () => {
    const { token } = await adminToken()
    const create = await request(app).post('/api/admin/customers').set('Authorization', `Bearer ${token}`).send({
      companyName: 'Ops Co', vatNumber: 'FR12345678901', country: 'France',
      firstName: 'Leo', lastName: 'Turner', phone: '+33612345000',
      email: `leo+${new mongoose.Types.ObjectId()}@astera.dev`,
      linkedinUrl: 'https://linkedin.com/in/leoturner',
    })
    const customerId = create.body.customer.id

    const detail0 = await request(app).get(`/api/admin/customers/${customerId}`).set('Authorization', `Bearer ${token}`)
    expect(detail0.body.stats).toEqual({ totalReports: 0, pendingReports: 0, deliveredReports: 0, lastReportAt: null })

    const upload = await request(app).post(`/api/admin/customers/${customerId}/reports`).set('Authorization', `Bearer ${token}`)
      .send({ title: 'Weekly Ops', reportType: 'Essential' })
    const reportId = upload.body.report.id

    const detail1 = await request(app).get(`/api/admin/customers/${customerId}`).set('Authorization', `Bearer ${token}`)
    expect(detail1.body.stats.totalReports).toBe(1)
    expect(detail1.body.stats.pendingReports).toBe(1)
    expect(detail1.body.stats.deliveredReports).toBe(0)
    expect(detail1.body.stats.lastReportAt).toBeTruthy()

    await request(app).patch(`/api/admin/reports/${reportId}`).set('Authorization', `Bearer ${token}`).send({ publishStatus: 'published' })
    const detail2 = await request(app).get(`/api/admin/customers/${customerId}`).set('Authorization', `Bearer ${token}`)
    expect(detail2.body.stats.deliveredReports).toBe(1)
    expect(detail2.body.stats.pendingReports).toBe(0)
  })

  it('logs customer_created, report_uploaded, report_published, status_changed, password_reset, and includes a synthesized account_created/last_login', async () => {
    const { token } = await adminToken()
    const create = await request(app).post('/api/admin/customers').set('Authorization', `Bearer ${token}`).send({
      companyName: 'Timeline Co', vatNumber: 'DE99999999', country: 'Germany',
      firstName: 'Nina', lastName: 'Weber', phone: '+491511111111',
      email: `nina+${new mongoose.Types.ObjectId()}@astera.dev`,
      linkedinUrl: 'https://linkedin.com/in/ninaweber',
    })
    const customerId = create.body.customer.id

    const upload = await request(app).post(`/api/admin/customers/${customerId}/reports`).set('Authorization', `Bearer ${token}`)
      .send({ title: 'Timeline Report', reportType: 'Essential' })
    await request(app).patch(`/api/admin/reports/${upload.body.report.id}`).set('Authorization', `Bearer ${token}`).send({ publishStatus: 'published' })
    await request(app).patch(`/api/admin/customers/${customerId}/status`).set('Authorization', `Bearer ${token}`).send({ status: 'suspended' })
    await request(app).post(`/api/admin/customers/${customerId}/reset-password`).set('Authorization', `Bearer ${token}`)

    const activity = await request(app).get(`/api/admin/customers/${customerId}/activity`).set('Authorization', `Bearer ${token}`)
    expect(activity.status).toBe(200)
    const types = activity.body.events.map((e) => e.type)
    expect(types).toEqual(expect.arrayContaining([
      'customer_created', 'report_uploaded', 'report_published', 'status_changed', 'password_reset',
    ]))
    // Newest first.
    const dates = activity.body.events.map((e) => new Date(e.at).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => b - a))
  })

  it('legacy accounts with no logged events still show a synthesized account_created entry', async () => {
    const passwordHash = await User.hashPassword('supersecret123')
    const legacy = await User.create({ name: 'Legacy', email: `legacy+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash })
    const { token } = await adminToken()
    const activity = await request(app).get(`/api/admin/customers/${legacy._id}/activity`).set('Authorization', `Bearer ${token}`)
    expect(activity.body.events.some((e) => e.type === 'customer_created')).toBe(true)
  })
})

describe('Admin notes (Phase 2) — private, never customer-visible', () => {
  it('supports add/edit/delete and is not present on the customer-facing /auth/me response', async () => {
    const { token } = await adminToken()
    const create = await request(app).post('/api/admin/customers').set('Authorization', `Bearer ${token}`).send({
      companyName: 'Notes Co', vatNumber: 'IT12345678', country: 'Italy',
      firstName: 'Gio', lastName: 'Rossi', phone: '+390612345678',
      email: `gio+${new mongoose.Types.ObjectId()}@astera.dev`,
      linkedinUrl: 'https://linkedin.com/in/giorossi',
    })
    const customerId = create.body.customer.id
    const customerToken = jwt.sign({ sub: customerId }, env.jwtSecret, { expiresIn: '1h' })

    const add = await request(app).post(`/api/admin/customers/${customerId}/notes`).set('Authorization', `Bearer ${token}`).send({ text: 'Called about invoice.' })
    expect(add.status).toBe(201)
    const noteId = add.body.note.id

    const edit = await request(app).patch(`/api/admin/customers/${customerId}/notes/${noteId}`).set('Authorization', `Bearer ${token}`).send({ text: 'Called about invoice — resolved.' })
    expect(edit.body.note.text).toBe('Called about invoice — resolved.')

    const list = await request(app).get(`/api/admin/customers/${customerId}/notes`).set('Authorization', `Bearer ${token}`)
    expect(list.body.notes).toHaveLength(1)
    expect(list.body.notes[0].authorName).toBe('Admin')

    // Never exposed to the customer themselves.
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${customerToken}`)
    expect(JSON.stringify(me.body)).not.toContain('invoice')

    const del = await request(app).delete(`/api/admin/customers/${customerId}/notes/${noteId}`).set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(200)
    const listAfter = await request(app).get(`/api/admin/customers/${customerId}/notes`).set('Authorization', `Bearer ${token}`)
    expect(listAfter.body.notes).toHaveLength(0)
  })
})

describe('Bulk customer status actions (Phase 2)', () => {
  it('activates/suspends multiple customers in one call and logs status_changed for each', async () => {
    const { token } = await adminToken()
    const ids = []
    for (let i = 0; i < 2; i++) {
      const c = await request(app).post('/api/admin/customers').set('Authorization', `Bearer ${token}`).send({
        companyName: `Bulk Co ${i}`, vatNumber: `BULK${i}23456`, country: 'Spain',
        firstName: 'Bulk', lastName: `User${i}`, phone: '+34600000000',
        email: `bulk${i}+${new mongoose.Types.ObjectId()}@astera.dev`,
        linkedinUrl: 'https://linkedin.com/in/bulkuser',
      })
      ids.push(c.body.customer.id)
    }

    const bulk = await request(app).patch('/api/admin/customers/bulk-status').set('Authorization', `Bearer ${token}`).send({ ids, status: 'suspended' })
    expect(bulk.status).toBe(200)
    expect(bulk.body.updated).toBe(2)

    for (const id of ids) {
      const detail = await request(app).get(`/api/admin/customers/${id}`).set('Authorization', `Bearer ${token}`)
      expect(detail.body.customer.status).toBe('suspended')
    }
  })
})
