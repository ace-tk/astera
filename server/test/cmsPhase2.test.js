import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Page } from '../src/models/Page.js'
import { Menu } from '../src/models/Menu.js'
import { SectionNav } from '../src/models/SectionNav.js'
import { fixedItems, withEntries } from './fixedMenusFixture.js'

let app
beforeEach(() => { app = createApp() })

async function adminHeader() {
  const passwordHash = await User.hashPassword('supersecret123')
  const u = await User.create({ name: 'admin', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash, role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}
const B = '/api/admin/cms'
const route = (r) => ({ type: 'route', route: r })
const pageLink = (id) => ({ type: 'page', pageId: id })

const entry = (id, label, link) => ({ id, label, link })

// The main menus are FIXED: these are the real menus / groups from the built-in navigation.
const ELUS = 'formations-des-elus'
const DROIT = 'droit-pratique'
const FORMULES = 'nos-formules'
const SEED_ENTRIES = {
  [`formations/${ELUS}`]: [entry('e1', 'Formation économique', route('/services/training/formation-economique-elus-cse')), entry('e2', 'Trésorier du CSE', route('/services/training/formation-cse-tresorier'))],
  [`formations/${DROIT}`]: [entry('e3', 'Droit social', route('/services/training/formation-droit-social-contrat-travail'))],
  [`pv/${FORMULES}`]: [entry('p1', 'PV à l’acte', route('/services/drafting/redaction-pv-cse-a-lacte'))],
}
const PLAIN_ABOUT = { id: 'a-propos', label: 'À propos', kind: 'link', enabled: true, link: route('/atoopv/a-propos') }
const PV_CTA = { tone: 'dark', eyebrow: 'Devis en 24 h', title: 'Votre PV relu et livré sous 5 jours.', buttonLabel: 'Demander un devis', link: route('/atoopv/tarification') }
const seed = () => fixedItems(SEED_ENTRIES, { pv: { cta: PV_CTA } })
const initMenu = (h, items = seed()) => request(app).post(`${B}/menus/main/initialize`).set(h).send({ items })

const saveMenu = (h, items, rev) => request(app).patch(`${B}/menus/main`).set(h).send({ items, ...(rev != null ? { rev } : {}) })
const publishMenu = (h) => request(app).post(`${B}/menus/main/publish`).set(h)
const liveMenu = async () => (await request(app).get('/api/cms/menus/main')).body.menu
const nav = async () => (await request(app).get('/api/cms/navigation')).body

async function createPage(h, body) {
  const res = await request(app).post(`${B}/pages`).set(h).send({ templateKey: 'service-article', section: 'training', slug: 'formation-d', title: 'Formation D', ...body })
  return res
}
const publishPage = (h, id) => request(app).post(`${B}/pages/${id}/publish`).set(h)
const patchPage = (h, id, body) => request(app).patch(`${B}/pages/${id}`).set(h).send(body)

describe('approved templates', () => {
  it('Ressources Article is a second approved template with its own fixed path and section', async () => {
    const h = await adminHeader()
    const ok = await createPage(h, { templateKey: 'ressources-article', section: 'ressources', slug: 'nouvel-article', title: 'Nouvel article' })
    expect(ok.status).toBe(201)
    expect(ok.body.page.path).toBe('/atoopv/ressources/nouvel-article')
    expect(ok.body.page.draft.content.badge).toBe('Ressources')
    // a service section is not a section of the Ressources template (and vice-versa)
    expect((await createPage(h, { templateKey: 'ressources-article', section: 'training', slug: 'x', title: 'x' })).status).toBe(422)
    expect((await createPage(h, { templateKey: 'service-article', section: 'ressources', slug: 'y', title: 'y' })).status).toBe(422)
    // the fixed veille route can never be shadowed by a page
    expect((await createPage(h, { templateKey: 'ressources-article', section: 'ressources', slug: 'veille-juridique-cse', title: 'z' })).status).toBe(409)
  })

  it('there is no "custom" template or layout option', async () => {
    const h = await adminHeader()
    for (const templateKey of ['custom', 'custom-page', 'listing-hub', 'legal-document', 'blog-post']) {
      expect((await createPage(h, { templateKey })).status, templateKey).toBe(422)
    }
  })

  it('labels are limited to what the template declares', async () => {
    const h = await adminHeader()
    const svc = await createPage(h, { tags: ['veille-juridique'] })
    expect(svc.status).toBe(422)
    const res = await createPage(h, { templateKey: 'ressources-article', section: 'ressources', slug: 'v1', title: 'V1', tags: ['veille-juridique'] })
    expect(res.status).toBe(201)
    expect(res.body.page.tags).toEqual(['veille-juridique'])
    expect((await createPage(h, { templateKey: 'ressources-article', section: 'ressources', slug: 'v2', title: 'V2', tags: ['made-up'] })).status).toBe(422)
  })
})

describe('menus — fixed structure, editable content', () => {
  it('imports the built-in navigation once, and never overwrites', async () => {
    const h = await adminHeader()
    const init = await initMenu(h)
    expect(init.status).toBe(200)
    expect(init.body.menu.hasUnpublishedChanges).toBe(false)
    const again = await initMenu(h)
    expect(again.status).toBe(409)
    expect(again.body.code).toBe('MENU_NOT_EMPTY')
    // public output preserves labels, groups and their order
    const m = await liveMenu()
    expect(m.items.map((i) => i.label)).toEqual(['Procès-verbal', 'Formations', 'AtooSavoir', 'Ressources', 'Blog', 'À propos'])
    const f = m.items.find((i) => i.id === 'formations')
    expect(f).toMatchObject({ kind: 'mega', visual: 'formations', color: 'royal' })
    expect(f.groups.map((g) => g.heading)).toEqual(['Formations des élus', 'Droit & pratique'])
    expect(f.groups[0].entries.map((e) => e.label)).toEqual(['Formation économique', 'Trésorier du CSE'])
    expect(m.items[0].cta).toMatchObject({ eyebrow: 'Devis en 24 h', buttonHref: '/atoopv/tarification' })
  })

  it('lets an admin edit what is INSIDE the menus (links, mobile list, panel texts): draft first, live on publish', async () => {
    const h = await adminHeader()
    await initMenu(h)
    let edited = withEntries(seed(), 'formations', ELUS, [entry('e2', 'Trésorier du CSE (renommé)', route('/services/training/formation-cse-tresorier')), entry('e1', 'Formation économique', route('/services/training/formation-economique-elus-cse'))])
    edited = edited.map((it) => (it.id === 'pv' ? { ...it, mobile: [entry('m1', 'PV à l’acte', route('/services/drafting/redaction-pv-cse-a-lacte'))], cta: { ...PV_CTA, title: 'Nouveau texte' } } : it))
    expect((await saveMenu(h, edited)).status).toBe(200)
    // live is untouched until publish
    const before = await liveMenu()
    expect(before.items.find((i) => i.id === 'formations').groups[0].entries[0].label).toBe('Formation économique')
    await publishMenu(h)
    const m = await liveMenu()
    expect(m.items.find((i) => i.id === 'formations').groups[0].entries.map((e) => e.label)).toEqual(['Trésorier du CSE (renommé)', 'Formation économique']) // reordered + renamed
    expect(m.items.find((i) => i.id === 'pv')).toMatchObject({ cta: { title: 'Nouveau texte' }, mobile: [{ label: 'PV à l’acte' }] })
    // the structure is exactly as before
    expect(m.items.map((i) => i.id)).toEqual(['pv', 'formations', 'atoosavoir', 'ressources', 'blog', 'a-propos'])
    expect(m.items.find((i) => i.id === 'formations').groups.map((g) => g.heading)).toEqual(['Formations des élus', 'Droit & pratique'])
  })

  it('refuses every attempt to change the menus themselves, and keeps the saved menu unchanged', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const items = seed()
    const idx = (id) => items.findIndex((i) => i.id === id)
    const put = (id, part) => items.map((it) => (it.id === id ? { ...it, ...part } : it))
    const attempts = {
      'add a 7th menu': [...items, { id: 'nouveau', label: 'Nouveau', kind: 'link', enabled: true, link: route('/nouveau') }],
      'remove a menu': items.filter((i) => i.id !== 'blog'),
      'reorder the menus': [items[1], items[0], ...items.slice(2)],
      'rename a menu': put('formations', { label: 'Nos formations' }),
      'switch a menu off': put('pv', { enabled: false }),
      'turn a mega menu into a link': put('formations', { kind: 'link', groups: [] }),
      'turn a link into a mega menu': put('a-propos', { kind: 'mega', groups: [{ id: 'g', heading: 'G', entries: [] }] }),
      'recolour a menu': put('pv', { color: 'coral' }),
      'change the illustration': put('formations', { visual: 'blog' }),
      'change the address the menu goes to': put('pv', { link: route('/autre') }),
      'add a group': put('formations', { groups: [...items[idx('formations')].groups, { id: 'extra', heading: 'Extra', entries: [] }] }),
      'remove a group': put('formations', { groups: items[idx('formations')].groups.slice(1) }),
      'reorder the groups': put('formations', { groups: [...items[idx('formations')].groups].reverse() }),
      'rename a group heading': put('formations', { groups: items[idx('formations')].groups.map((g, i) => (i === 0 ? { ...g, heading: 'Autre titre' } : g)) }),
      'remove the call-to-action panel': put('pv', { cta: undefined }),
      'restyle the call-to-action panel': put('pv', { cta: { ...PV_CTA, tone: 'light' } }),
      'add a side panel to a menu without one': put('formations', { cities: { heading: 'H', label: 'L', linkLabel: 'V', link: route('/x') } }),
    }
    for (const [what, next] of Object.entries(attempts)) {
      const res = await saveMenu(h, next)
      expect(res.status, what).toBe(422)
      expect(['MENU_STRUCTURE_LOCKED', 'MENU_LIMIT', 'VALIDATION_FAILED'], what).toContain(res.body.code)
    }
    const after = (await request(app).get(`${B}/menus/main`).set(h)).body.menu
    expect(after.draft.items.map((i) => i.id)).toEqual(['pv', 'formations', 'atoosavoir', 'ressources', 'blog', 'a-propos'])
    expect(after.draft.items.find((i) => i.id === 'formations').label).toBe('Formations')
    expect(after.hasUnpublishedChanges).toBe(false)
  })

  it('the 7-item ceiling is still enforced (MENU_LIMIT) — the fixed set is 6, and Story stays in the site code', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const eight = [...seed(), { id: 'x7', label: 'X7', kind: 'link', enabled: true, link: route('/x7') }, { id: 'x8', label: 'X8', kind: 'link', enabled: true, link: route('/x8') }]
    const res = await saveMenu(h, eight)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('MENU_LIMIT')
  })

  it('cannot start a menu from scratch: it must be imported from the built-in menu first, and only the fixed set is accepted', async () => {
    const h = await adminHeader()
    const early = await saveMenu(h, seed())
    expect(early.status).toBe(409)
    expect(early.body.code).toBe('MENU_NOT_INITIALIZED')
    const custom = await initMenu(h, [PLAIN_ABOUT])
    expect(custom.status).toBe(422)
    expect(custom.body.code).toBe('MENU_STRUCTURE_LOCKED')
    expect((await request(app).get(`${B}/menus/main`).set(h)).body.menu.draft.items).toEqual([])
    expect((await initMenu(h)).status).toBe(200)
  })

  it('publishing re-checks the structure, so a tampered draft can never go live', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const menu = await Menu.findOne({ key: 'main' })
    menu.draft.items = menu.draft.items.filter((i) => i.id !== 'blog')
    menu.markModified('draft')
    await menu.save()
    const res = await publishMenu(h)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('MENU_STRUCTURE_LOCKED')
    expect((await liveMenu()).items.map((i) => i.id)).toContain('blog')
  })

  it('discard restores the live menu into the draft', async () => {
    const h = await adminHeader()
    await initMenu(h)
    await saveMenu(h, withEntries(seed(), 'formations', ELUS, []))
    const res = await request(app).post(`${B}/menus/main/discard`).set(h)
    expect(res.body.menu.draft.items.find((i) => i.id === 'formations').groups[0].entries.map((e) => e.label)).toEqual(['Formation économique', 'Trésorier du CSE'])
  })

  it('the skeleton matches the website\'s built-in navigation (regenerate with `npm run cms:fixed-menus` if this fails)', async () => {
    const { buildFixedMenus } = await import('../src/cms/migrate/generateFixedMenus.js')
    const { FIXED_MENUS } = await import('../src/cms/fixedMenus.js')
    expect(JSON.parse(JSON.stringify(await buildFixedMenus()))).toEqual(JSON.parse(JSON.stringify(FIXED_MENUS)))
  })
})

describe('pages in the mega menu (automatic)', () => {
  const setup = async (h) => initMenu(h)
  const groupLabels = async (menuId, groupId) =>
    (await liveMenu()).items.find((i) => i.id === menuId)?.groups.find((g) => g.id === groupId)?.entries.map((e) => e.label) || []

  it('a new page placed in a group appears in that group once published — and only then', async () => {
    const h = await adminHeader()
    await setup(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: ELUS } })).body.page
    expect(await groupLabels('formations', ELUS)).toEqual(['Formation économique', 'Trésorier du CSE']) // draft: hidden
    await publishPage(h, page.id)
    expect(await groupLabels('formations', ELUS)).toEqual(['Formation économique', 'Trésorier du CSE', 'Formation D']) // appended, others untouched
    // the other groups are unaffected
    expect(await groupLabels('formations', DROIT)).toEqual(['Droit social'])
    const live = (await liveMenu()).items.find((i) => i.id === 'formations')
    expect(live.groups.map((g) => g.heading)).toEqual(['Formations des élus', 'Droit & pratique']) // grouping preserved
    const entry = live.groups[0].entries.at(-1)
    expect(entry.href).toBe('/services/training/formation-d')
  })

  it('unpublish, archive and restore add and remove it automatically', async () => {
    const h = await adminHeader()
    await setup(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: ELUS }, publish: true })).body.page
    expect(await groupLabels('formations', ELUS)).toContain('Formation D')
    await request(app).post(`${B}/pages/${page.id}/unpublish`).set(h)
    expect(await groupLabels('formations', ELUS)).not.toContain('Formation D')
    await publishPage(h, page.id)
    expect(await groupLabels('formations', ELUS)).toContain('Formation D')
    await request(app).delete(`${B}/pages/${page.id}`).set(h)
    expect(await groupLabels('formations', ELUS)).not.toContain('Formation D')
    await request(app).post(`${B}/pages/${page.id}/restore`).set(h)
    await publishPage(h, page.id)
    expect(await groupLabels('formations', ELUS)).toContain('Formation D') // placement survived the archive
  })

  it('uses the navigation label if there is one, else the title, and follows renames', async () => {
    const h = await adminHeader()
    await setup(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: DROIT }, publish: true, navLabel: 'FD court' })).body.page
    expect(await groupLabels('formations', DROIT)).toContain('FD court')
    await patchPage(h, page.id, { navLabel: '' })
    expect(await groupLabels('formations', DROIT)).toContain('Formation D')
  })

  it('placement can be moved between groups and menus, or removed', async () => {
    const h = await adminHeader()
    await setup(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: ELUS }, publish: true })).body.page
    await patchPage(h, page.id, { menu: { menuId: 'formations', groupId: DROIT } })
    expect(await groupLabels('formations', ELUS)).not.toContain('Formation D')
    expect(await groupLabels('formations', DROIT)).toContain('Formation D')
    await patchPage(h, page.id, { menu: { menuId: 'pv', groupId: FORMULES } })
    expect(await groupLabels('pv', FORMULES)).toContain('Formation D')
    await patchPage(h, page.id, { menu: null })
    expect(await groupLabels('pv', FORMULES)).not.toContain('Formation D')
  })

  it('rejects placement in a menu, group or plain-link menu that does not exist — and creates nothing', async () => {
    const h = await adminHeader()
    await setup(h)
    for (const menu of [{ menuId: 'nope', groupId: ELUS }, { menuId: 'formations', groupId: 'nope' }, { menuId: 'a-propos', groupId: 'x' }]) {
      expect((await createPage(h, { menu })).status, JSON.stringify(menu)).toBe(422)
    }
    expect(await Page.countDocuments()).toBe(0)
  })

  it('explicit page entries (curated order) are honoured, and hide when unpublished', async () => {
    const h = await adminHeader()
    const a = (await createPage(h, { slug: 'fa', title: 'FA', publish: true })).body.page
    const b = (await createPage(h, { slug: 'fb', title: 'FB', publish: true })).body.page
    const items = withEntries(seed(), 'formations', ELUS, [entry('x1', '', pageLink(b.id)), entry('x2', 'Statique', route('/services/training')), entry('x3', 'A renommé', pageLink(a.id))])
    await initMenu(h); await saveMenu(h, items); await publishMenu(h)
    expect(await groupLabels('formations', ELUS)).toEqual(['FB', 'Statique', 'A renommé'])
    await request(app).post(`${B}/pages/${b.id}/unpublish`).set(h)
    expect(await groupLabels('formations', ELUS)).toEqual(['Statique', 'A renommé'])
  })

  it('every menu keeps its own link (a menu without one is refused, and the address it goes to cannot be changed)', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const noLink = seed().map((it) => { if (it.id !== 'formations') return it; const c = { ...it }; delete c.link; return c })
    expect((await saveMenu(h, noLink)).status).toBe(422)
    const gp = (await createPage(h, { slug: 'fx', title: 'FX' })).body.page
    const toPage = seed().map((it) => (it.id === 'formations' ? { ...it, link: pageLink(gp.id) } : it))
    const res = await saveMenu(h, toPage)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('MENU_STRUCTURE_LOCKED')
  })

  it('a mega menu with nothing left to show degrades to a plain link instead of an empty panel', async () => {
    const h = await adminHeader()
    const p = (await createPage(h, { publish: true })).body.page
    await initMenu(h, fixedItems())
    await saveMenu(h, withEntries(fixedItems(), 'formations', ELUS, [entry('x', '', pageLink(p.id))])); await publishMenu(h)
    expect((await liveMenu()).items.find((i) => i.id === 'formations').kind).toBe('mega')
    await request(app).post(`${B}/pages/${p.id}/unpublish`).set(h)
    const after = await liveMenu()
    expect(after.items.find((i) => i.id === 'formations')).toMatchObject({ kind: 'link', href: '/services/training' })
  })

  it('publishing menu edits never disturbs pages placed in a group (groups cannot be removed, so placements stay valid)', async () => {
    const h = await adminHeader()
    await setup(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: ELUS }, publish: true })).body.page
    // usage numbers are available in the menu screen
    const counts = (await request(app).get(`${B}/menus/main`).set(h)).body.menu.placements
    expect(counts.formations).toEqual({ total: 1, groups: { [ELUS]: 1 } })
    await saveMenu(h, withEntries(seed(), 'formations', DROIT, [])); await publishMenu(h)
    const after = await Page.findById(page.id)
    expect(after.status).toBe('published')
    expect(after.menu).toMatchObject({ menuId: 'formations', groupId: ELUS })
    expect(await groupLabels('formations', ELUS)).toContain('Formation D')
  })
})

describe('removing pages safely', () => {
  it('lists every reference before a page is unpublished or removed', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const page = (await createPage(h, { menu: { menuId: 'formations', groupId: ELUS }, publish: true })).body.page
    const other = (await createPage(h, { slug: 'autre', title: 'Autre' })).body.page
    await patchPage(h, other.id, { content: { body: `Voir [la formation](${page.path}).` } })
    await request(app).post(`${B}/section-navs/training/initialize`.replace('/section-navs', '/section-navs')).set(h).send({ entries: [entry('s1', '', pageLink(page.id))] })
    const u = (await request(app).get(`${B}/pages/${page.id}/usages`).set(h)).body.usages
    expect(u.menus).toContain('main')
    expect(u.menuPlacements[0].where).toMatch(/Formations › Formations des élus/)
    expect(u.sectionNavs).toEqual(['training'])
    expect(u.pages.map((p) => p.title)).toEqual(['Autre'])
    expect(u.listings).toEqual(['training'])
  })

  it('archiving keeps content, revisions and references; permanent delete strips references', async () => {
    const h = await adminHeader()
    const p = (await createPage(h, { slug: 'jamais' })).body.page
    await initMenu(h, fixedItems())
    await saveMenu(h, withEntries(fixedItems(), 'formations', ELUS, [entry('x', '', pageLink(p.id)), entry('y', 'Autre', route('/y'))])); await publishMenu(h)
    expect((await request(app).delete(`${B}/pages/${p.id}`).query({ permanent: '1' }).set(h)).status).toBe(200)
    const menu = (await request(app).get(`${B}/menus/main`).set(h)).body.menu
    const formations = (v) => v.items.find((i) => i.id === 'formations').groups[0].entries.map((e) => e.id)
    expect(formations(menu.draft)).toEqual(['y'])
    expect(formations(menu.live)).toEqual(['y'])
  })

  it('refuses to permanently delete a page that a menu panel depends on (its call-to-action link)', async () => {
    const h = await adminHeader()
    const p = (await createPage(h, { slug: 'lien' })).body.page
    await initMenu(h, fixedItems())
    expect((await saveMenu(h, fixedItems({}, { pv: { cta: { ...PV_CTA, link: pageLink(p.id) } } }))).status).toBe(200)
    const res = await request(app).delete(`${B}/pages/${p.id}`).query({ permanent: '1' }).set(h)
    expect(res.status).toBe(409)
    expect(res.body.code).toBe('PAGE_IN_USE')
    expect(await Page.countDocuments()).toBe(1)
  })
})

describe('side navigation, previous/next and listings data', () => {
  const TRAINING = [
    entry('t0', 'Formations', route('/services/training')),
    entry('t1', 'Formation économique — 5 jours', route('/services/training/formation-economique-elus-cse')),
    entry('t2', 'Trésorier du CSE', route('/services/training/formation-cse-tresorier')),
  ].map((e, i) => (i === 0 ? { ...e, end: true } : e))

  it('with no imported list, published section pages are returned for the site to append to its built-in list', async () => {
    const h = await adminHeader()
    const a = (await createPage(h, { slug: 'fa', title: 'FA', publish: true })).body.page
    await createPage(h, { slug: 'draft-only', title: 'Draft' })
    const n = (await nav()).sections.training
    expect(n.configured).toBe(false)
    expect(n.entries).toEqual([{ label: 'FA', to: a.path }])
    expect((await nav()).sections.guides.entries).toEqual([]) // other sections unaffected
  })

  it('after import, the saved order rules and new published pages are appended', async () => {
    const h = await adminHeader()
    expect((await request(app).post(`${B}/section-navs/training/initialize`).set(h).send({ entries: TRAINING })).status).toBe(200)
    expect((await request(app).post(`${B}/section-navs/training/initialize`).set(h).send({ entries: TRAINING })).status).toBe(409)
    const p = (await createPage(h, { slug: 'fd', title: 'Formation D', publish: true })).body.page
    let n = (await nav()).sections.training
    expect(n.configured).toBe(true)
    expect(n.entries.map((e) => e.label)).toEqual(['Formations', 'Formation économique — 5 jours', 'Trésorier du CSE', 'Formation D'])
    expect(n.entries[0].end).toBe(true)

    // Reorder: put the new page second, save as draft (live unchanged), publish.
    const reordered = [TRAINING[0], entry('t9', '', pageLink(p.id)), TRAINING[1], TRAINING[2]]
    await request(app).patch(`${B}/section-navs/training`).set(h).send({ entries: reordered })
    expect((await nav()).sections.training.entries.map((e) => e.label)).toEqual(['Formations', 'Formation économique — 5 jours', 'Trésorier du CSE', 'Formation D'])
    await request(app).post(`${B}/section-navs/training/publish`).set(h)
    n = (await nav()).sections.training
    expect(n.entries.map((e) => e.label)).toEqual(['Formations', 'Formation D', 'Formation économique — 5 jours', 'Trésorier du CSE'])
    // unpublishing removes it from the list (and therefore from prev/next)
    await request(app).post(`${B}/pages/${p.id}/unpublish`).set(h)
    expect((await nav()).sections.training.entries.map((e) => e.label)).toEqual(['Formations', 'Formation économique — 5 jours', 'Trésorier du CSE'])
  })

  it('a page that is hidden from navigation (showInNav off) is not appended', async () => {
    const h = await adminHeader()
    const p = (await createPage(h, { publish: true })).body.page
    await patchPage(h, p.id, { showInNav: false })
    expect((await nav()).sections.training.entries).toEqual([])
  })

  it('pages set to a lower order come first among the appended pages', async () => {
    const h = await adminHeader()
    const a = (await createPage(h, { slug: 'fa', title: 'FA', publish: true })).body.page
    const b = (await createPage(h, { slug: 'fb', title: 'FB', publish: true })).body.page
    await patchPage(h, b.id, { order: -1 })
    expect((await nav()).sections.training.entries.map((e) => e.label)).toEqual(['FB', 'FA'])
    void a
  })

  it('validates section navigation (unknown section, duplicate ids, bad links)', async () => {
    const h = await adminHeader()
    expect((await request(app).post(`${B}/section-navs/nowhere/initialize`).set(h).send({ entries: [] })).status).toBe(404)
    expect((await request(app).post(`${B}/section-navs/training/initialize`).set(h).send({ entries: [TRAINING[0], TRAINING[0]] })).status).toBe(422)
    expect((await request(app).post(`${B}/section-navs/training/initialize`).set(h).send({ entries: [entry('x', '', route('/y'))] })).status).toBe(422) // route needs a label
    expect((await request(app).post(`${B}/section-navs/training/initialize`).set(h).send({ entries: [entry('x', 'L', { type: 'external', url: 'https://e.com' })] })).status).toBe(422)
    expect((await request(app).post(`${B}/section-navs/training/publish`).set(h)).status).toBe(409) // not imported yet
  })
})

describe('public navigation payload', () => {
  it('bundles menu, side navigation and a light page index — published pages only', async () => {
    const h = await adminHeader()
    const empty = await nav()
    expect(empty.menu).toBeNull() // nothing imported: the site keeps its built-in menu
    expect(empty.pages).toEqual([])

    await initMenu(h)
    const pub = (await createPage(h, { templateKey: 'ressources-article', section: 'ressources', slug: 'veille-un', title: 'Veille un', tags: ['veille-juridique'], content: { body: 'Un **résumé** court.' }, publish: true })).body.page
    await createPage(h, { slug: 'brouillon', title: 'Brouillon' })
    const n = await nav()
    expect(n.menu.items.map((i) => i.id)).toEqual(['pv', 'formations', 'atoosavoir', 'ressources', 'blog', 'a-propos'])
    expect(n.pages.map((p) => p.slug)).toEqual(['veille-un'])
    expect(n.pages[0]).toMatchObject({ section: 'ressources', tags: ['veille-juridique'], excerpt: 'Un résumé court.', path: pub.path })
    expect(Object.keys(n.sections).sort()).toEqual(['by-city', 'communication', 'drafting', 'guides', 'ressources', 'tarifs-infos', 'training'])
  })

  it('never leaks drafts, unpublished or archived pages anywhere', async () => {
    const h = await adminHeader()
    await initMenu(h)
    const place = { menuId: 'formations', groupId: ELUS }
    const draft = (await createPage(h, { slug: 'd1', title: 'D1', menu: place })).body.page
    const off = (await createPage(h, { slug: 'd2', title: 'D2', menu: place, publish: true })).body.page
    const gone = (await createPage(h, { slug: 'd3', title: 'D3', menu: place, publish: true })).body.page
    await request(app).post(`${B}/pages/${off.id}/unpublish`).set(h)
    await request(app).delete(`${B}/pages/${gone.id}`).set(h)
    const text = JSON.stringify(await nav())
    for (const p of [draft, off, gone]) {
      expect(text).not.toContain(p.slug)
      expect(text).not.toContain(p.title)
    }
  })

  it('serves conditional requests (unchanged navigation = cheap 304)', async () => {
    const first = await request(app).get('/api/cms/navigation')
    expect(first.headers['cache-control']).toBe('public, max-age=0, must-revalidate')
    const second = await request(app).get('/api/cms/navigation').set('If-None-Match', first.headers.etag)
    expect(second.status).toBe(304)
  })
})

describe('admin-only', () => {
  it('menu, placement and section-navigation writes need an admin', async () => {
    const member = { Authorization: `Bearer ${jwt.sign({ sub: String((await User.create({ name: 'm', email: `m+${new mongoose.Types.ObjectId()}@x.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'Member' }))._id) }, env.jwtSecret)}` }
    for (const [method, path] of [['post', `${B}/menus/main/initialize`], ['patch', `${B}/menus/main`], ['post', `${B}/menus/main/publish`], ['post', `${B}/menus/main/discard`], ['get', `${B}/section-navs`], ['patch', `${B}/section-navs/training`], ['post', `${B}/section-navs/training/initialize`]]) {
      expect((await request(app)[method](path).set(member).send({ items: [], entries: [] })).status, `${method} ${path}`).toBe(403)
    }
    void Menu; void SectionNav
  })
})
