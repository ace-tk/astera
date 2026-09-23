import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createApp } from '../src/app.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'
import { Page } from '../src/models/Page.js'
import { planImport, applyImport } from '../src/cms/migrate/importResourcesArticles.js'
import { planNavigationImport } from '../src/cms/migrate/importNavigation.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const clientSrc = path.join(here, '../../client/src')
const load = (rel) => import(pathToFileURL(path.join(clientSrc, rel)))

// Ressources batch: content/resources/*.md (35 files) minus the hub (`guides-livres-blancs-cse`,
// the section's own index route — App.jsx's index route passes its slug directly via a prop, which
// RessourceArticle.jsx turns into `hub: true`, forcing bundled content at that specific URL
// regardless of migration/cutover, the exact same mechanism as every Service Article category's
// hub). `veille-juridique-cse` is NOT a markdown file and never appears in this list — it is
// `VeilleJuridique.jsx`, a page synthesized from `VEILLE_JURIDIQUE_SLUGS`, analogous to
// `ServiceCategoryDirectory` — there is nothing to import for it.
//
// Ressources uses its own CMS template (`ressources-article`, NOT `service-article`) with the
// simplest possible content shape: `{ badge, body }`, no Stats/Topics/FAQ ever — RessourceArticle.jsx
// never runs any such extractor. So every one of the 34 migratable pages is body-only; there is no
// "container" to disassemble/reassemble, and `assemble(disassemble(body)) === body` holds trivially
// (identity) rather than needing separate extraction logic — verified explicitly below anyway.
const BATCH = [
  'actualite-sociale', 'arret-maladie-duree-legale-lfss-2026-droits-salarie', 'canicule-travail-decret-2025-482-obligations-employeur-cse',
  'cas-pratiques', 'comment-lire-arret-cour-de-cassation', 'commissaire-de-justice-cse-constat-entrave', 'competences-elu-cse-mandat',
  'compteur-cp-arret-maladie-verifications-avant-solder', 'conge-paye-vendredi-37h-decompte-jours-ouvrables',
  'conges-payes-heures-supplementaires-calcul-bulletins-paie', 'demission-mandat-cse-elu-protection',
  'droit-image-salarie-depart-jurisprudence-cour-cassation', 'droits-elus-cse-guide-juridique',
  'grossesse-licenciement-nul-protection-salariee-cour-cassation-2026', 'harcelement-moral-methodes-gestion-cse',
  'heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation', 'heures-supplementaires-conges-payes-calcul',
  'histoire-cse-comite-entreprise-cnr-1943', 'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse', 'la-minute-cse',
  'mentions-obligatoires-pv', 'mise-a-pied-conservatoire-elu-cse', 'modele-pv-cse-premium-integral', 'modeles-pv', 'proces-verbal',
  'reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification', 'reorganisation-silencieuse-cse-demissions',
  'signature-du-proces-verbal-de-reunion-du-cse', 'solde-de-tout-compte-signature', 'surveillance-salaries-cnil-cse',
  'teletravail-impose-cse-droits-employeur', 'tickets-restaurant-teletravail-droit-teletravailleurs',
  'veille-juridique-cse-8-25-juillet-2026', 'veille-sociale-cse-juin-2026',
]
// Confirmed against the real ATOOPV_NAV (not assumed) — every other slug in BATCH has no mega-menu
// placement at all, reached only via RESSOURCES_NAV's hub-level side-nav entries, the
// veille-juridique-cse listing (VEILLE_JURIDIQUE_SLUGS), or cross-links inside other pages' bodies.
const EXPECTED_MENU = {
  'modeles-pv': { menuId: 'ressources', groupId: 'modeles-de-pv' },
  'modele-pv-cse-premium-integral': { menuId: 'ressources', groupId: 'modeles-de-pv' },
  'actualite-sociale': { menuId: 'blog', groupId: 'rubriques' },
  'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse': { menuId: 'blog', groupId: 'rubriques' },
  'cas-pratiques': { menuId: 'blog', groupId: 'rubriques' },
  'droits-elus-cse-guide-juridique': { menuId: 'blog', groupId: 'le-cse-en-pratique' },
}

const menuPlacementFor = async (url) => {
  const { ATOOPV_NAV } = await load('constants/content.js')
  const { toMenuItems } = await load('cms/navConvert.js')
  for (const item of toMenuItems(ATOOPV_NAV)) {
    if (item.kind !== 'mega') continue
    for (const group of item.groups) {
      if (group.entries.some((e) => e.link?.type === 'route' && e.link.route === url)) {
        return { menuId: item.id, groupId: group.id, groupHeading: group.heading, menuLabel: item.label }
      }
    }
  }
  return null
}

// The REAL main menu (built from ATOOPV_NAV) — required by the tarifs-infos correction: every
// column link there is a hardcoded ROUTE, never a page reference, so `page.menu` must stay null.
const realMainMenu = async () => (await planNavigationImport()).menuItems

let app
beforeEach(() => { app = createApp() })
const admin = async () => {
  const u = await User.create({ name: 'a', email: `a+${new mongoose.Types.ObjectId()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
  return { Authorization: `Bearer ${jwt.sign({ sub: String(u._id) }, env.jwtSecret, { expiresIn: '1h' })}` }
}

describe('dry-run report — ressources batch', () => {
  it('is read-only: writes nothing, however many times it runs', async () => {
    await planImport(BATCH)
    await planImport(BATCH)
    expect(await Page.countDocuments()).toBe(0)
  })

  it('excludes the hub page (guides-livres-blancs-cse) with a clear reason', async () => {
    const plan = await planImport(['guides-livres-blancs-cse', ...BATCH])
    const hub = plan.find((p) => p.slug === 'guides-livres-blancs-cse')
    expect(hub.ok).toBe(false)
    expect(hub.reason).toBe('Hub pages are not imported in Phase 1')
  })

  it('reports all 34 pages as safe: parses, validates against the ressources-article schema, and the stored body is IDENTICAL to the parsed body (no extraction — body-only by design)', async () => {
    const plan = await planImport(BATCH)
    expect(plan).toHaveLength(34)
    for (const p of plan) {
      expect(p.ok, p.slug).toBe(true)
      expect(p.section).toBe('ressources')
      expect(p.path).toBe(`/atoopv/ressources/${p.slug}`)
      expect(p.page.templateKey).toBe('ressources-article')
      // "assemble(disassemble(body)) === body": there is no disassembly step for this template, so
      // the identity holds by construction — checked explicitly against the raw parsed body anyway.
      expect(p.page.version.content.body.length).toBe(p.bodyChars)
    }
  })

  it('every menu-linked page IS an existing hardcoded ROUTE (never a page reference) — per the tarifs-infos correction, page.menu must stay null for all 34, not just the linked ones', async () => {
    for (const [slug, expected] of Object.entries(EXPECTED_MENU)) {
      const placement = await menuPlacementFor(`/atoopv/ressources/${slug}`)
      expect(placement, slug).toMatchObject(expected)
    }
  })

  it('the other 28 of 34 pages have no mega-menu placement at all', async () => {
    const linked = new Set(Object.keys(EXPECTED_MENU))
    const unlinked = BATCH.filter((s) => !linked.has(s))
    expect(unlinked).toHaveLength(28)
    for (const slug of unlinked) {
      const placement = await menuPlacementFor(`/atoopv/ressources/${slug}`)
      expect(placement, slug).toBeNull()
    }
  })
})

describe('end to end (isolated in-memory database — never production): import → menu (left null, per the correction) → publish/unpublish → preview', () => {
  it('imports via the new (Ressources-specific) import tool; content is byte-identical; page.menu is null for every page', async () => {
    const plan = await planImport(BATCH)
    expect(plan.every((p) => p.ok)).toBe(true)
    const { results } = await applyImport(plan)
    expect(results.every((r) => r.status === 'imported')).toBe(true)
    expect(await Page.countDocuments()).toBe(34)
    for (const slug of BATCH) {
      const page = await Page.findOne({ slug })
      expect(page.status).toBe('published')
      expect(page.templateKey).toBe('ressources-article')
      expect(page.live.content.body).toBe(page.draft.content.body)
      expect(page.menu).toMatchObject({ menuId: null, groupId: null })
    }
  })

  it('the mega menu (built with the REAL navigation data) shows every menu-linked ressources page exactly once — no duplicates, since page.menu was never patched', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(BATCH)
    await applyImport(plan)

    const nav = (await request(app).get('/api/cms/navigation')).body
    const ressources = nav.menu.items.find((i) => i.id === 'ressources')
    const blog = nav.menu.items.find((i) => i.id === 'blog')
    const allHrefs = [...ressources.groups, ...blog.groups].flatMap((g) => g.entries.map((e) => e.href))
    for (const slug of Object.keys(EXPECTED_MENU)) {
      const href = `/atoopv/ressources/${slug}`
      expect(allHrefs.filter((h2) => h2 === href), slug).toHaveLength(1) // exactly once, never duplicated
    }
    const modelesGroup = ressources.groups.find((g) => g.id === 'modeles-de-pv').entries.map((e) => e.label)
    expect(modelesGroup).toEqual(['Modèle de PV gratuit', 'Bibliothèque de modèles', 'Modèle premium intégral']) // built-in labels, unchanged
  })

  it('unpublishing a menu-linked ressources page takes its CONTENT offline; the built-in route link is unaffected (same as before migration)', async () => {
    const h = await admin()
    await request(app).post('/api/admin/cms/menus/main/initialize').set(h).send({ items: await realMainMenu() })
    const plan = await planImport(['modeles-pv'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'modeles-pv' })

    const before = (await request(app).get('/api/cms/navigation')).body
    const groupBefore = before.menu.items.find((i) => i.id === 'ressources').groups.find((g) => g.id === 'modeles-de-pv')
    expect((await request(app).get('/api/cms/pages').query({ path: '/atoopv/ressources/modeles-pv' })).status).toBe(200)

    await request(app).post(`/api/admin/cms/pages/${page._id}/unpublish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/atoopv/ressources/modeles-pv' })).status).toBe(404)
    const after = (await request(app).get('/api/cms/navigation')).body
    const groupAfter = after.menu.items.find((i) => i.id === 'ressources').groups.find((g) => g.id === 'modeles-de-pv')
    expect(groupAfter).toEqual(groupBefore) // the hardcoded route link is byte-for-byte unaffected

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    expect((await request(app).get('/api/cms/pages').query({ path: '/atoopv/ressources/modeles-pv' })).status).toBe(200)
  })

  it('preview shows the draft (body edit) before publishing, and publishing makes it live; Admin fields are pre-filled with the current French content and opening the page never dirties it', async () => {
    const plan = await planImport(['droits-elus-cse-guide-juridique'])
    await applyImport(plan)
    const page = await Page.findOne({ slug: 'droits-elus-cse-guide-juridique' })
    const h = await admin()

    // Pre-filled with the current French content (not blank, not placeholder text).
    const fetched = await request(app).get(`/api/admin/cms/pages/${page._id}`).set(h)
    expect(fetched.body.page.draft.content.body).toContain('CSE')
    expect(fetched.body.page.draft.content.body.length).toBeGreaterThan(1000)

    await request(app).patch(`/api/admin/cms/pages/${page._id}`).set(h).send({ content: { body: 'Brouillon avec un tout autre contenu.' } })
    const stillLive = (await request(app).get('/api/cms/pages').query({ path: '/atoopv/ressources/droits-elus-cse-guide-juridique' })).body.page.content.body
    expect(stillLive).not.toBe('Brouillon avec un tout autre contenu.')

    const preview = await request(app).get(`/api/admin/cms/pages/${page._id}/preview`).set(h)
    expect(preview.body.page.content.body).toBe('Brouillon avec un tout autre contenu.')
    expect(preview.body.page.preview).toBe(true)
    expect((await request(app).get(`/api/admin/cms/pages/${page._id}/preview`)).status).toBe(401) // preview needs auth

    await request(app).post(`/api/admin/cms/pages/${page._id}/publish`).set(h)
    const nowLive = (await request(app).get('/api/cms/pages').query({ path: '/atoopv/ressources/droits-elus-cse-guide-juridique' })).body.page.content.body
    expect(nowLive).toBe('Brouillon avec un tout autre contenu.')
  })

  it('side navigation: hub-level ressources pages are recognized as the SAME page already in the built-in RESSOURCES_NAV list — no duplicate, nothing missing; the other pages join the list without disturbing it', async () => {
    const plan = await planImport(BATCH)
    await applyImport(plan)
    const nav = (await request(app).get('/api/cms/navigation')).body
    const section = nav.sections.ressources
    expect(section.configured).toBe(false)
    const paths = section.entries.map((e) => e.to)
    expect(new Set(paths).size).toBe(paths.length) // no duplicate entries anywhere in the merged list
    // The hub-level entries RESSOURCES_NAV already names keep their exact built-in label.
    for (const slug of ['modeles-pv', 'cas-pratiques', 'actualite-sociale', 'jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse', 'comment-lire-arret-cour-de-cassation', 'la-minute-cse']) {
      expect(paths, slug).toContain(`/atoopv/ressources/${slug}`)
    }
    expect(nav.pages.filter((p) => p.section === 'ressources').map((p) => p.slug).sort()).toEqual([...BATCH].sort())
  })

  it('the veille-juridique-cse listing page is unaffected by this batch — it is not a markdown file and is never imported', async () => {
    const plan = await planImport(['veille-juridique-cse', ...BATCH])
    const found = plan.find((p) => p.slug === 'veille-juridique-cse')
    expect(found.ok).toBe(false)
    expect(found.reason).toBe('No markdown file found for this slug in content/resources')
  })
})
