import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { SitePage } from '../src/models/SitePage.js'
import { buildSitePageDefaults } from '../src/cms/migrate/generateSitePageDefaults.js'
import { fillMissing, validateSitePageContent } from '../src/cms/sitePageShape.js'
import REGISTRY from '../src/cms/sitePageDefaults.json' with { type: 'json' }

let app
beforeEach(() => {
  app = createApp()
})

async function tokenFor(role) {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: role, email: `${role}+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role })
  return jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })
}
const admin = async () => ({ Authorization: `Bearer ${await tokenFor('admin')}` })
const member = async () => ({ Authorization: `Bearer ${await tokenFor('Member')}` })

const A = '/api/admin/cms/site-pages'
const PUB = '/api/cms/site-pages'
const clone = (o) => JSON.parse(JSON.stringify(o))
const DEFAULTS = (key) => clone(REGISTRY[key].defaults)
const getAdmin = (h, key) => request(app).get(`${A}/${key}`).set(h)
const save = (h, key, content, rev) => request(app).patch(`${A}/${key}`).set(h).send({ content, ...(rev != null ? { rev } : {}) })
const publish = (h, key) => request(app).post(`${A}/${key}/publish`).set(h)
const discard = (h, key) => request(app).post(`${A}/${key}/discard`).set(h)
const pub = (key) => request(app).get(`${PUB}/${key}`)

describe('site pages — generated defaults', () => {
  it('sitePageDefaults.json is up to date with client/src/cms/sitePageRegistry.js (run `npm run cms:site-pages`)', async () => {
    expect(REGISTRY).toEqual(await buildSitePageDefaults())
  })
})

describe('site pages — shape rules', () => {
  const d = () => DEFAULTS('tarification')

  it('accepts the unchanged defaults and a reworded text / changed price', () => {
    expect(validateSitePageContent(d(), d()).issues).toEqual([])
    const c = d()
    c.hero.title = 'Nouveau titre'
    c.tiers[0].rate = 95
    const r = validateSitePageContent(d(), c)
    expect(r.issues).toEqual([])
    expect(r.content.tiers[0].rate).toBe(95)
  })

  it('rejects structure changes: extra/unknown key, added/removed list item, wrong type', () => {
    const extra = d(); extra.hero.sneaky = 'x'
    expect(validateSitePageContent(d(), extra).issues[0]).toMatchObject({ path: 'hero.sneaky' })
    const added = d(); added.faq.push({ question: 'q', answer: 'a' })
    expect(validateSitePageContent(d(), added).issues[0].path).toBe('faq')
    const removed = d(); removed.tiers.pop()
    expect(validateSitePageContent(d(), removed).issues[0].path).toBe('tiers')
    const typed = d(); typed.tiers[0].rate = '90'
    expect(validateSitePageContent(d(), typed).issues[0].path).toBe('tiers.0.rate')
    const missing = d(); delete missing.hero
    expect(validateSitePageContent(d(), missing).issues.length).toBeGreaterThan(0)
  })

  it('design tokens (id/type/color/featured…) cannot change', () => {
    const c = d(); c.tiers[1].featured = false; c.tiers[0].id = 'x'; c.why.blocks[0].type = 'list'; c.why.color = 'rose'
    const paths = validateSitePageContent(d(), c).issues.map((i) => i.path).sort()
    expect(paths).toEqual(['tiers.0.id', 'tiers.1.featured', 'why.blocks.0.type', 'why.color'])
  })

  it('a non-empty text cannot be emptied; numbers must be sane; very long text is refused', () => {
    const c = d(); c.hero.title = '   '; c.tiers[0].rate = -1; c.intro.text = 'x'.repeat(7000)
    const paths = validateSitePageContent(d(), c).issues.map((i) => i.path).sort()
    expect(paths).toEqual(['hero.title', 'intro.text', 'tiers.0.rate'])
  })

  it('links must be site paths / http(s) / mailto / tel; script-like schemes are refused anywhere', () => {
    for (const ok of ['/contact', 'https://example.com/x', 'mailto:a@b.fr', 'tel:+33412100606', '#top']) {
      const c = d(); c.cta.primaryCta.to = ok
      expect(validateSitePageContent(d(), c).issues).toEqual([])
    }
    for (const bad of ['javascript:alert(1)', ' JavaScript:alert(1)', 'data:text/html,x', '//evil.com', 'contact']) {
      const c = d(); c.cta.primaryCta.to = bad
      expect(validateSitePageContent(d(), c).issues.length, bad).toBeGreaterThan(0)
    }
    const c = d(); c.hero.title = 'javascript:alert(1)'
    expect(validateSitePageContent(d(), c).issues[0].path).toBe('hero.title')
  })

  it('fillMissing completes an older document from the defaults and never throws', () => {
    const old = d(); delete old.hero.badge; delete old.ctaImage; old.faq = []
    const filled = fillMissing(d(), old)
    expect(filled.hero.badge).toBe(d().hero.badge)
    expect(filled.ctaImage).toEqual(d().ctaImage)
    expect(filled.faq).toEqual(d().faq)
    expect(fillMissing(d(), null)).toEqual(d())
  })
})

describe('site pages — Accueil, AtooSavoir, Autodiagnostic, Boutique, hubs', () => {
  it('every page validates its own defaults and accepts a reworded heading', () => {
    for (const key of Object.keys(REGISTRY)) {
      expect(validateSitePageContent(DEFAULTS(key), DEFAULTS(key)).issues, key).toEqual([])
    }
    const c = DEFAULTS('accueil'); c.hero.title = 'Nouveau titre'; c.cta.heading = 'Autre titre'
    expect(validateSitePageContent(DEFAULTS('accueil'), c).issues).toEqual([])
  })

  it('autodiagnostic scoring (scores, thresholds, levels) is design, not content', () => {
    const c = DEFAULTS('autodiagnostic')
    c.quiz.questions[0].options[0].score = 0
    c.quiz.tiers[0].min = 1
    c.quiz.tiers[1].level = 'red'
    const paths = validateSitePageContent(DEFAULTS('autodiagnostic'), c).issues.map((i) => i.path).sort()
    expect(paths).toEqual(['quiz.questions.0.options.0.score', 'quiz.tiers.0.min', 'quiz.tiers.1.level'])
    const ok = DEFAULTS('autodiagnostic'); ok.quiz.questions[0].question = 'Une autre question ?'; ok.quiz.questions[0].options[0].label = 'Toujours'
    expect(validateSitePageContent(DEFAULTS('autodiagnostic'), ok).issues).toEqual([])
  })

  it('hub pages and the CGV carry the bundled markdown as their default text', () => {
    for (const key of ['hub-services', 'hub-nos-services-pv', 'hub-communication-cse', 'hub-formations-elus-cse-agree', 'hub-tarif-redaction-pv-cse', 'hub-guides-livres-blancs-cse']) {
      const d = DEFAULTS(key)
      expect(d.title, key).toBeTruthy()
      expect(d.badge, key).toBeTruthy()
      expect(d.markdown.length, key).toBeGreaterThan(500)
    }
    expect(DEFAULTS('atoosavoir-cgv').markdown).toContain('Conditions')
    expect(REGISTRY['hub-communication-cse'].defaults.fragmentsIntro.fragments).toHaveLength(4)
  })

  it('markdown text may be long (a whole page) but still refuses script-like links and runaway length', () => {
    const d = () => DEFAULTS('hub-nos-services-pv')
    const long = d(); long.markdown = `${long.markdown}\n\n${'Un paragraphe de plus. '.repeat(500)}`
    expect(long.markdown.length).toBeGreaterThan(6000)
    expect(validateSitePageContent(d(), long).issues).toEqual([])
    const huge = d(); huge.markdown = 'x'.repeat(60001)
    expect(validateSitePageContent(d(), huge).issues[0].path).toBe('markdown')
    for (const bad of ['[clic](javascript:alert(1))', '![x](data:text/html,x)', '[clic]( JavaScript:alert(1))']) {
      const c = d(); c.markdown = `${c.markdown}\n\n${bad}`
      expect(validateSitePageContent(d(), c).issues[0], bad).toMatchObject({ path: 'markdown' })
    }
    const ok = d(); ok.markdown = `${ok.markdown}\n\n[Contact](/contact) et [site](https://example.com)`
    expect(validateSitePageContent(d(), ok).issues).toEqual([])
  })

  it('the communication hub text-only fragments intro keeps its fixed shape', () => {
    const d = () => DEFAULTS('hub-communication-cse')
    const c = d(); c.fragmentsIntro.fragments[0].text = 'Texte modifié'
    expect(validateSitePageContent(d(), c).issues).toEqual([])
    const bad = d(); bad.fragmentsIntro.fragments.pop()
    expect(validateSitePageContent(d(), bad).issues[0].path).toBe('fragmentsIntro.fragments')
  })

  it('an edited + published hub page is served to the public', async () => {
    const h = await admin()
    const c = DEFAULTS('hub-services'); c.title = 'Services — titre édité'; c.markdown = `${c.markdown}\n\nParagraphe ajouté.`
    expect((await save(h, 'hub-services', c, 0)).status).toBe(200)
    expect((await pub('hub-services')).body.content.title).toBe(DEFAULTS('hub-services').title) // draft saved, not published: public still shows the built-in text
    expect((await publish(h, 'hub-services')).status).toBe(200)
    expect((await pub('hub-services')).body.content).toMatchObject({ title: 'Services — titre édité' })
  })
})

describe('site pages — access control', () => {
  it('admin endpoints reject anonymous (401) and non-admin (403); the public endpoint needs no auth', async () => {
    expect((await request(app).get(`${A}/tarification`)).status).toBe(401)
    const m = await member()
    expect((await getAdmin(m, 'tarification')).status).toBe(403)
    expect((await save(m, 'tarification', DEFAULTS('tarification'))).status).toBe(403)
    expect((await publish(m, 'tarification')).status).toBe(403)
    expect((await discard(m, 'tarification')).status).toBe(403)
    expect((await pub('tarification')).status).toBe(200)
  })

  it('an unknown page key is a 404 on every endpoint', async () => {
    const h = await admin()
    expect((await getAdmin(h, 'nope')).status).toBe(404)
    expect((await save(h, 'nope', {})).status).toBe(404)
    expect((await pub('nope')).status).toBe(404)
    expect((await pub('__proto__')).status).toBe(404)
  })
})

describe('site pages — nothing stored until an admin edits', () => {
  it('reading never creates a document; the admin sees the built-in content and the public gets null', async () => {
    const h = await admin()
    const res = await getAdmin(h, 'a-propos')
    expect(res.status).toBe(200)
    expect(res.body.sitePage.draft.content).toEqual(DEFAULTS('a-propos'))
    expect(res.body.sitePage.live.content).toEqual(DEFAULTS('a-propos'))
    expect(res.body.sitePage).toMatchObject({ rev: 0, hasUnpublishedChanges: false, edited: false })
    expect((await pub('a-propos')).body).toEqual({ content: null })
    expect(await SitePage.countDocuments()).toBe(0)
  })

  it('the list endpoint reports all pages with their status', async () => {
    const h = await admin()
    const res = await request(app).get(A).set(h)
    expect(res.body.pages.map((p) => p.key)).toEqual(Object.keys(REGISTRY))
    expect(Object.keys(REGISTRY)).toEqual(expect.arrayContaining([
      'accueil', 'atoosavoir', 'atoosavoir-exemple', 'atoosavoir-cgv', 'autodiagnostic', 'boutique', 'veille-juridique',
      'hub-services', 'hub-nos-services-pv', 'hub-communication-cse', 'hub-formations-elus-cse-agree', 'hub-tarif-redaction-pv-cse', 'hub-guides-livres-blancs-cse',
    ]))
    expect(res.body.pages.every((p) => p.edited === false && p.hasUnpublishedChanges === false)).toBe(true)
  })
})

describe('site pages — draft / publish / discard', () => {
  const edited = () => { const c = DEFAULTS('tarification'); c.tiers[0].rate = 99; c.hero.title = 'Titre modifié'; return c }

  it('a draft is invisible to the public until published, then the public gets exactly that content', async () => {
    const h = await admin()
    const s = await save(h, 'tarification', edited(), 0)
    expect(s.status).toBe(200)
    expect(s.body.sitePage.hasUnpublishedChanges).toBe(true)
    expect((await pub('tarification')).body).toEqual({ content: DEFAULTS('tarification') }) // doc seeded with defaults as live

    const p = await publish(h, 'tarification')
    expect(p.body.sitePage.hasUnpublishedChanges).toBe(false)
    const live = (await pub('tarification')).body.content
    expect(live.hero.title).toBe('Titre modifié')
    expect(live.tiers[0].rate).toBe(99)
    expect(live).not.toHaveProperty('draft')
  })

  it('discard puts the draft back to the live content', async () => {
    const h = await admin()
    await save(h, 'tarification', edited(), 0)
    const d = await discard(h, 'tarification')
    expect(d.body.sitePage.draft.content).toEqual(DEFAULTS('tarification'))
    expect(d.body.sitePage.hasUnpublishedChanges).toBe(false)
  })

  it('an invalid save is a 422 with the problem paths and stores nothing', async () => {
    const h = await admin()
    const c = DEFAULTS('tarification'); c.tiers[0].rate = 'cher'; c.faq.pop()
    const res = await save(h, 'tarification', c, 0)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('VALIDATION_FAILED')
    expect(res.body.issues.map((i) => i.path).sort()).toEqual(['faq', 'tiers.0.rate'])
    expect(await SitePage.countDocuments()).toBe(0)
  })

  it('a stale revision is a 409; the pages are independent of each other', async () => {
    const h = await admin()
    const first = await save(h, 'tarification', edited(), 0)
    const second = await save(h, 'tarification', edited(), first.body.sitePage.rev)
    expect(second.status).toBe(200)
    expect((await save(h, 'tarification', edited(), first.body.sitePage.rev)).status).toBe(409)
    expect((await pub('contact')).body).toEqual({ content: null })
    expect((await getAdmin(h, 'contact')).body.sitePage.edited).toBe(false)
  })

  it('a document saved before a field existed is completed from the defaults for the admin', async () => {
    const h = await admin()
    await save(h, 'tarification', edited(), 0)
    const doc = await SitePage.findOne({ key: 'tarification' })
    delete doc.draft.content.ctaImage
    doc.markModified('draft')
    await doc.save()
    const res = await getAdmin(h, 'tarification')
    expect(res.body.sitePage.draft.content.ctaImage).toEqual(DEFAULTS('tarification').ctaImage)
  })
})

describe('site pages — all three pages round-trip their own defaults', () => {
  it.each(['tarification', 'a-propos', 'contact'])('%s: defaults validate, save and publish unchanged', async (key) => {
    const h = await admin()
    expect((await save(h, key, DEFAULTS(key), 0)).status).toBe(200)
    expect((await publish(h, key)).status).toBe(200)
    expect((await pub(key)).body.content).toEqual(DEFAULTS(key))
  })
})
