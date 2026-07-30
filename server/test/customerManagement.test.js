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
  return jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })
}

const validSignup = (overrides = {}) => ({
  accountType: 'company',
  companyName: 'Acme Inc',
  vatNumber: 'VAT12345',
  country: 'United States',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '+14155550123',
  email: `jane+${new mongoose.Types.ObjectId()}@astera.dev`,
  linkedinUrl: 'https://www.linkedin.com/in/janedoe',
  password: 'supersecret123',
  confirmPassword: 'supersecret123',
  ...overrides,
})

describe('signup — full registration + email verification gate', () => {
  it('rejects incomplete/invalid fields with 422', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'not-an-email', password: 'short' })
    expect(res.status).toBe(422)
  })

  it('rejects a mismatched confirmPassword', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup({ confirmPassword: 'different12345' }))
    expect(res.status).toBe(422)
  })

  it('rejects an invalid LinkedIn URL', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup({ linkedinUrl: 'https://example.com/janedoe' }))
    expect(res.status).toBe(422)
  })

  it('rejects an invalid phone number', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup({ phone: '5551234' }))
    expect(res.status).toBe(422)
  })

  it('creates an unverified account and returns no token', async () => {
    const res = await request(app).post('/api/auth/signup').send(validSignup())
    expect(res.status).toBe(201)
    expect(res.body.token).toBeUndefined()
  })

  it('rejects a duplicate email with 409', async () => {
    const payload = validSignup()
    await request(app).post('/api/auth/signup').send(payload)
    const res = await request(app).post('/api/auth/signup').send(payload)
    expect(res.status).toBe(409)
  })

  it('blocks login before verification, then allows it after verifying', async () => {
    const payload = validSignup()
    await request(app).post('/api/auth/signup').send(payload)

    const blocked = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password })
    expect(blocked.status).toBe(403)
    expect(blocked.body.error).toMatch(/verify/i)

    // Read the token straight from the DB (email delivery isn't exercised here).
    const stored = await User.findOne({ email: payload.email }).select('+verificationToken')
    const verify = await request(app).get(`/api/auth/verify-email/${stored.verificationToken}`)
    expect(verify.status).toBe(200)

    const allowed = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password })
    expect(allowed.status).toBe(200)
    expect(allowed.body.token).toBeTruthy()
    expect(allowed.body.user.emailVerified).toBe(true)
  })

  it('rejects an invalid/expired verification token', async () => {
    const res = await request(app).get('/api/auth/verify-email/not-a-real-token')
    expect(res.status).toBe(400)
  })

  it('blocks login for a suspended account', async () => {
    const passwordHash = await User.hashPassword('supersecret123')
    const u = await User.create({
      name: 'Suspended', email: `sus+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, status: 'suspended',
    })
    const res = await request(app).post('/api/auth/login').send({ email: u.email, password: 'supersecret123' })
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/suspended/i)
  })

  it('pre-existing accounts (no emailVerified/status stored) still log in — the backward-compat guarantee', async () => {
    // Simulate a legacy document the way it existed before this feature: no
    // emailVerified/status field written at all.
    const passwordHash = await User.hashPassword('supersecret123')
    const legacy = await User.collection.insertOne({
      name: 'Legacy User', email: `legacy+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash,
      workspace: 'Personal', role: 'Member', theme: 'light', plan: 'studio', createdAt: new Date(), updatedAt: new Date(),
    })
    const doc = await User.findById(legacy.insertedId)
    const res = await request(app).post('/api/auth/login').send({ email: doc.email, password: 'supersecret123' })
    expect(res.status).toBe(200)
    expect(res.body.user.emailVerified).toBe(true)
  })
})

describe('resend-verification', () => {
  it('does not reveal whether an account exists', async () => {
    const res = await request(app).post('/api/auth/resend-verification').send({ email: 'nobody@astera.dev' })
    expect(res.status).toBe(200)
  })
})

describe('admin — customer management', () => {
  it('requires admin', async () => {
    expect((await request(app).get('/api/admin/customers')).status).toBe(401)
  })

  it('creates a verified customer, lists/searches/paginates, and shows the detail with report count', async () => {
    const token = await adminToken()

    const create = await request(app)
      .post('/api/admin/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Northwind Traders', vatNumber: 'GB123456789', country: 'United Kingdom',
        firstName: 'Priya', lastName: 'Sharma', phone: '+442071234567',
        email: `priya+${new mongoose.Types.ObjectId()}@astera.dev`,
        linkedinUrl: 'https://linkedin.com/in/priyasharma',
      })
    expect(create.status).toBe(201)
    expect(create.body.customer.emailVerified).toBe(true) // admin-created defaults to verified
    expect(create.body.customer.invitedByAdmin).toBe(true)
    const customerId = create.body.customer.id

    const list = await request(app).get('/api/admin/customers?q=Northwind').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.customers.some((c) => c.id === customerId)).toBe(true)
    expect(list.body.total).toBeGreaterThanOrEqual(1)

    const detail = await request(app).get(`/api/admin/customers/${customerId}`).set('Authorization', `Bearer ${token}`)
    expect(detail.status).toBe(200)
    expect(detail.body.customer.companyName).toBe('Northwind Traders')
    expect(detail.body.reports).toEqual([])
  })

  it('suspends and re-activates a customer without touching their reports', async () => {
    const token = await adminToken()
    const create = await request(app)
      .post('/api/admin/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Ledgerly', vatNumber: 'DE987654321', country: 'Germany',
        firstName: 'Dan', lastName: 'Reyes', phone: '+4915123456789',
        email: `dan+${new mongoose.Types.ObjectId()}@astera.dev`,
        linkedinUrl: 'https://linkedin.com/in/danreyes',
      })
    const customerId = create.body.customer.id

    const suspend = await request(app)
      .patch(`/api/admin/customers/${customerId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'suspended' })
    expect(suspend.status).toBe(200)
    expect(suspend.body.customer.status).toBe('suspended')

    const reactivate = await request(app)
      .patch(`/api/admin/customers/${customerId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'active' })
    expect(reactivate.body.customer.status).toBe('active')
  })

  it('uploads a report to a customer, publishes it, and it appears in the customer’s own Reports', async () => {
    const token = await adminToken()
    const create = await request(app)
      .post('/api/admin/customers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Ops Co', vatNumber: 'FR12345678901', country: 'France',
        firstName: 'Leo', lastName: 'Turner', phone: '+33612345678',
        email: `leo+${new mongoose.Types.ObjectId()}@astera.dev`,
        linkedinUrl: 'https://linkedin.com/in/leoturner',
      })
    const customerId = create.body.customer.id
    const customerToken = jwt.sign({ sub: customerId }, env.jwtSecret, { expiresIn: '1h' })

    const upload = await request(app)
      .post(`/api/admin/customers/${customerId}/reports`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ops Weekly — Official Minutes', reportType: 'Essential', headline: 'Ops synced on Q3 priorities.' })
    expect(upload.status).toBe(201)
    expect(upload.body.report.publishStatus).toBe('draft')
    const reportId = upload.body.report.id

    // Draft — not visible to the customer yet.
    const preList = await request(app).get('/api/reports').set('Authorization', `Bearer ${customerToken}`)
    expect(preList.body.reports.some((r) => r.id === reportId)).toBe(false)

    const publish = await request(app)
      .patch(`/api/admin/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ publishStatus: 'published' })
    expect(publish.status).toBe(200)

    const postList = await request(app).get('/api/reports').set('Authorization', `Bearer ${customerToken}`)
    expect(postList.body.reports.some((r) => r.id === reportId)).toBe(true)
  })

  it('excludes admins from the customers list', async () => {
    const token = await adminToken()
    const list = await request(app).get('/api/admin/customers').set('Authorization', `Bearer ${token}`)
    expect(list.body.customers.every((c) => c.isAdmin !== true)).toBe(true)
  })
})
