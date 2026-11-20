import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { SitePage } from '../src/models/SitePage.js'

let app
beforeEach(() => { app = createApp() })

describe('GET /api/cms/dates (public)', () => {
  it('is empty before anything was published, and needs no login', async () => {
    const res = await request(app).get('/api/cms/dates')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ sitePages: {}, homeHero: null, footer: null, legalPages: null })
  })

  it('returns the publish date of each edited site page (never the draft state)', async () => {
    await SitePage.create({ key: 'tarification', publishedAt: new Date('2026-11-10T08:00:00Z'), draft: { content: { a: 1 } }, live: { content: { a: 1 } } })
    await SitePage.create({ key: 'contact', draft: { content: null }, live: { content: null } }) // never published: no date
    const res = await request(app).get('/api/cms/dates')
    expect(res.body.sitePages).toEqual({ tarification: '2026-11-10T08:00:00.000Z' })
  })
})
