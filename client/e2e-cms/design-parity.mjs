// Browser test: a NEW page created through the admin Add page form must render with the EXISTING frontend
// design of its section — compared against an existing page of the same design (same content, other slug) —
// on desktop and mobile, in preview and published, in the mega menu, and disappear again when unpublished.
//
//   (server)  node scripts/e2e-stack.mjs                                  in-memory API on :5052
//   (client)  VITE_API_URL=http://localhost:5052/api npx vite --port 5198
//   (client)  npm run test:cms-parity
//
// Needs a FRESH stack (the fixed menu is imported through the admin screen at the start).
import { chromium } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const BASE = process.env.E2E_BASE || 'http://localhost:5198'
const API = process.env.E2E_API || 'http://localhost:5052/api'
const CONTENT = path.resolve(here, '../../content')
const { parseContentFile } = await import('../src/utils/contentMarkdown.js')
const token = fs.readFileSync(path.join(os.tmpdir(), 'atoopv-e2e-token.txt'), 'utf8').trim()
const auth = { Authorization: `Bearer ${token}` }
const OUT = path.join(os.tmpdir(), 'atoopv-cms-parity')
fs.mkdirSync(OUT, { recursive: true })

// section → the existing page of the SAME design used as the reference (chosen without slug-specific extras where one exists)
const SECTIONS = [
  { key: 'drafting', label: 'Rédaction PV', menuLabel: 'Procès-verbal', dir: 'drafting', ref: 'externaliser-pv-cse', base: '/services/drafting', badge: 'Services' },
  { key: 'by-city', label: 'Par ville', menuLabel: 'Procès-verbal', dir: 'by-city', ref: 'redaction-pv-cse-annecy', base: '/services/by-city', badge: 'Services' },
  { key: 'tarifs-infos', label: 'Tarifs & Infos', menuLabel: 'Procès-verbal', dir: 'tarifs-infos', ref: 'redacteur-pv-cse', base: '/services/tarifs-infos', badge: 'Services' },
  { key: 'training', label: 'Formations', menuLabel: 'Formations', dir: 'training', ref: 'formation-droit-social-contrat-travail', base: '/services/training', badge: 'Services', slugSpecific: true },
  { key: 'communication', label: 'Communication', menuLabel: 'Formations', dir: 'communication', ref: 'newsletter-actucse', base: '/services/communication', badge: 'Services' },
  { key: 'guides', label: 'Guides pratiques', menuLabel: 'Ressources', dir: 'guides', ref: 'approbation-pv-cse', base: '/services/guides', badge: 'Services' },
  { key: 'ressources', label: 'Ressources', menuLabel: 'Ressources', dir: 'resources', ref: 'cas-pratiques', base: '/atoopv/ressources', badge: 'Ressources' },
  // A leaf article is not in Ressources' side navigation (only hub pages are), whereas a new page is appended to it.
  { key: 'ressources', label: 'Ressources', menuLabel: 'Ressources', dir: 'resources', ref: 'canicule-travail-decret-2025-482-obligations-employeur-cse', base: '/atoopv/ressources', badge: 'Ressources', leafNotInNav: true },
]
const SRC = path.resolve(here, '../src/components')
const tokensIn = (file) => new Set(fs.readFileSync(`${SRC}/${file}`, 'utf8').split(/[\s"'`{}()]+/))
const allIn = (classStrings, file) => { const t = tokensIn(file); return classStrings.every((c) => c.split(' ').every((tok) => t.has(tok))) }

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

// Runs in the browser: the page's design, split into regions, without any inline style / animation state.
const signature = () => {
  const walk = (n) => {
    if (n.nodeType === 3) return n.textContent.replace(/\s+/g, ' ').trim()
    if (n.nodeType !== 1 || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(n.tagName)) return ''
    const cls = (n.getAttribute('class') || '').split(/\s+/).filter(Boolean).sort().join('.')
    return `<${n.tagName.toLowerCase()}${cls ? '.' + cls : ''}${n.getAttribute('href') ? '@' + n.getAttribute('href') : ''}${n.getAttribute('src') ? '#' + n.getAttribute('src') : ''}>${[...n.childNodes].map(walk).join('')}</>`
  }
  const uniq = (root) => (root ? [...new Set([...root.querySelectorAll('[class]')].map((e) => e.getAttribute('class').split(/\s+/).sort().join(' ')))].sort() : [])
  const grid = document.querySelector('main > div.relative > .shell > .grid')
  if (!grid) return { error: 'no article grid on this page' }
  const wrap = grid.closest('div.relative')
  const kids = [...grid.children]
  const col = kids[1]
  const pager = col.querySelector(':scope > nav[aria-label="Category pages"]')
  const article = [...col.children].filter((c) => c !== pager)
  const shell = grid.parentElement
  return {
    hero: walk(wrap.previousElementSibling),
    background: [...wrap.children].filter((c) => c !== shell).map(walk).join(''),
    shellClass: shell.className,
    gridClass: grid.className,
    colClass: col.className,
    navTag: kids[0].tagName,
    navShell: `${kids[0].tagName}.${kids[0].className}|${kids[0].querySelector('ul,ol')?.className || ''}`,
    navClasses: uniq(kids[0]),
    article: article.map(walk).join(''),
    articleClasses: [...new Set(article.flatMap((a) => uniq(a)))].sort(),
    rail: kids.length > 2 ? walk(kids[2]) : null,
    railClasses: kids.length > 2 ? uniq(kids[2]) : [],
    pagination: pager ? pager.className : null,
    h1: document.querySelector('h1')?.innerText,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }
}
const diffKeys = (a, b, skip = []) => Object.keys(a).filter((k) => !skip.includes(k) && JSON.stringify(a[k]) !== JSON.stringify(b[k]))

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
await ctx.addInitScript((t) => { localStorage.setItem('astera:token', t); localStorage.setItem('astera:onboarded', '1') }, token)
const admin = await ctx.newPage()
const errors = []
admin.on('pageerror', (e) => errors.push(String(e)))
const view = await ctx.newPage()
view.on('pageerror', (e) => errors.push(String(e)))

async function open(page, url, w = 1440, h = 1000, sig = true) {
  await page.setViewportSize({ width: w, height: h })
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  if (!sig) { await page.waitForTimeout(500); return null }
  await page.waitForSelector('main > div.relative > .shell > .grid', { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(w < 500 ? 2000 : 500) // decorative confetti can briefly widen the page while it settles
  return page.evaluate(signature)
}

/* ---- the fixed menu must exist before pages can be placed in it ---- */
await admin.goto(`${BASE}/app/admin/cms/menus`, { waitUntil: 'networkidle' })
await admin.getByRole('button', { name: 'Import the built-in menu' }).click()
await admin.getByRole('heading', { name: 'Main menus' }).waitFor()

/* ---- what the Add page form shows ---- */
await admin.goto(`${BASE}/app/admin/cms/pages/new`, { waitUntil: 'networkidle' })
await admin.getByRole('radio').first().waitFor()
const radios = await admin.getByRole('radio').allTextContents()
const groupsShown = await admin.locator('[role="radiogroup"] p').allTextContents()
check('Add page lists the 7 existing sections, grouped by menu', radios.length === 7 && JSON.stringify(groupsShown) === JSON.stringify(['Procès-verbal', 'Formations', 'Ressources']), `${groupsShown.join(' / ')}; ${radios.map((r) => r.split('/')[0]).join(' | ')}`)
const formText = await admin.locator('main, form').first().innerText()
check('no template names / custom-design options are shown to the admin', !/Service Article|Ressources Article|template|custom|page builder|new layout/i.test(formText))
await admin.screenshot({ path: `${OUT}/add_page_sections.png` })

let first = true
for (const S of SECTIONS) {
  console.log(`\n=== ${S.label} (${S.key}) — reference: ${S.base}/${S.ref} ===`)
  const raw = fs.readFileSync(`${CONTENT}/${S.dir}/${S.ref}.md`, 'utf8')
  const ref = parseContentFile(raw, `${S.ref}.md`, 'S')
  const slug = `parite-${S.ref}`.slice(0, 90)
  const path = `${S.base}/${slug}`

  /* ---- Admin → Add page → section → name → content → draft ---- */
  await admin.goto(`${BASE}/app/admin/cms/pages/new`, { waitUntil: 'networkidle' })
  await admin.getByRole('radio', { name: new RegExp(`^${S.label.replace(/[&]/g, '\\$&')}`) }).click()
  check(`${S.key}: hero label starts as on existing pages ("${S.badge}")`, (await admin.getByLabel('Hero label').inputValue()) === S.badge)
  await admin.getByPlaceholder('e.g. Formation aux nouvelles obligations du CSE').fill(ref.title)
  await admin.locator('input.font-mono').first().fill(slug)
  check(`${S.key}: address shown to the admin is the section's existing route`, (await admin.locator('span.font-mono').filter({ hasText: path }).count()) >= 1, path)
  const menuSel = admin.locator('select[aria-label="Main menu"]')
  check(`${S.key}: menu suggested from the section (${S.menuLabel})`, (await menuSel.locator('option:checked').innerText()) === S.menuLabel)
  await admin.locator('select[aria-label="Menu group"]').selectOption({ index: 1 })
  await admin.getByRole('button', { name: /Markdown/ }).click()
  await admin.getByLabel('Article body (Markdown)').fill(ref.body)
  await admin.getByRole('radio', { name: /Save as draft/ }).click()
  await admin.getByRole('button', { name: 'Create draft page' }).click()
  await Promise.race([
    admin.waitForURL(/\/app\/admin\/cms\/pages\/[a-f0-9]{24}/, { timeout: 20000 }),
    admin.getByRole('alert').first().waitFor({ timeout: 20000 }),
  ])
  if (!/pages\/[a-f0-9]{24}/.test(admin.url())) { check(`${S.key}: draft created`, false, await admin.getByRole('alert').first().innerText()); continue }
  const id = admin.url().match(/pages\/([a-f0-9]{24})/)[1]
  check(`${S.key}: draft created at the section's route`, (await (await admin.request.get(`${API}/admin/cms/pages/${id}`, { headers: auth })).json()).page.path === path)
  check(`${S.key}: draft is not public`, (await admin.request.get(`${API}/cms/pages?path=${encodeURIComponent(path)}`)).status() === 404)

  /* ---- Preview: the editor's own Preview button opens the draft at the page's public address ---- */
  const [popup] = await Promise.all([ctx.waitForEvent('page'), admin.getByRole('button', { name: /^Preview/ }).click()])
  await popup.waitForURL(new RegExp(`${path.replace(/[/.]/g, '\\$&')}\\?preview=${id}`), { timeout: 15000 })
  check(`${S.key}: the Preview button opens the page at its own address in preview mode`, popup.url().includes(`${path}?preview=${id}`), popup.url().replace(BASE, ''))
  await popup.close()

  /* ---- Preview (draft) ---- */
  const prev = await open(view, `${path}?preview=${id}`)
  check(`${S.key}: preview renders the article design`, !prev.error, prev.error || '')
  if (prev.error) continue

  /* ---- Publish (editor button) ---- */
  await admin.getByRole('button', { name: /^Publish/ }).first().click()
  await admin.getByText('The page is now live.', { exact: false }).waitFor()

  /* ---- Public ---- */
  const live = await open(view, path)
  check(`${S.key}: public URL resolves to the article design`, !live.error && live.h1 === ref.title, live.error || live.h1)
  const pv = diffKeys(prev, live, ['navClasses', 'pagination', 'overflow'])
  check(`${S.key}: preview and published use the same design`, pv.length === 0, pv.join(', '))

  /* ---- Parity with the existing page of the same design ---- */
  const existing = await open(view, `${S.base}/${S.ref}`)
  check(`${S.key}: reference page renders (${S.ref})`, !existing.error && existing.h1 === ref.title)
  check(`${S.key}: while published, the section's side navigation links to it`, (await view.locator(`main a[href="${path}"]`).count()) >= 1)
  const navKeys = S.leafNotInNav ? ['navClasses', 'pagination'] : []
  const shellDiff = diffKeys(live, existing, ['article', 'articleClasses', 'rail', 'railClasses', 'h1', 'overflow', 'navShell', ...navKeys])
  shellDiff.push(...diffKeys(live, existing).filter((k) => k === 'navShell'))
  check(`${S.key}: hero, background, layout grid, navigation style and pagination are identical to the existing page`, shellDiff.length === 0, shellDiff.join(', '))
  if (S.slugSpecific) {
    const builtInOnly = existing.articleClasses.filter((c) => !live.articleClasses.includes(c))
    const cmsOnly = live.articleClasses.filter((c) => !existing.articleClasses.includes(c))
    console.log(`INFO  ${S.key}: article column differs by ${builtInOnly.length} class strings only on the built-in page and ${cmsOnly.length} only on the CMS page`)
    check(`${S.key}: built-in-only styling is the slug-keyed FormationTopics component (existing page ${S.ref} shows its topics visual)`, allIn(builtInOnly, 'atoopv/FormationTopics.jsx'), builtInOnly.join(' | '))
    check(`${S.key}: CMS-only styling is the article's own icon-heading rows (existing MarkdownArticle) — nothing new`, allIn(cmsOnly, 'atoopv/MarkdownArticle.jsx'), cmsOnly.join(' | '))
  } else {
    const artDiff = diffKeys(live, existing, ['hero', 'background', 'shellClass', 'gridClass', 'colClass', 'navTag', 'navShell', 'navClasses', 'pagination', 'h1', 'overflow'])
    check(`${S.key}: article body, right rail, typography and spacing are identical (same content ⇒ same DOM)`, artDiff.length === 0, artDiff.join(', '))
  }
  if (S.leafNotInNav) {
    const onlyNav = diffKeys(live, existing).filter((k) => k !== 'overflow')
    check(`${S.key}: against a leaf article the ONLY differences are side-navigation membership (active item + previous/next), not design`, onlyNav.every((k) => ['navClasses', 'pagination'].includes(k)) && onlyNav.length > 0, onlyNav.join(', '))
  }
  await view.screenshot({ path: `${OUT}/${S.key}_new_desktop${S.leafNotInNav ? '_leaf' : ''}.png` })
  await open(view, `${S.base}/${S.ref}`)
  await view.screenshot({ path: `${OUT}/${S.key}_existing_desktop${S.leafNotInNav ? '_leaf' : ''}.png` })

  /* ---- Mobile ---- */
  const liveM = await open(view, path, 390, 844)
  const existingM = await open(view, `${S.base}/${S.ref}`, 390, 844)
  const mobDiff = diffKeys(liveM, existingM, [...(S.slugSpecific ? ['article', 'articleClasses', 'rail', 'railClasses'] : []), ...(S.leafNotInNav ? ['navClasses', 'pagination'] : []), 'overflow'])
  check(`${S.key}: mobile — same design as the existing page`, mobDiff.length === 0, mobDiff.join(', '))
  check(`${S.key}: mobile — new page has no horizontal overflow`, !liveM.overflow || existingM.overflow, `new=${liveM.overflow} existing=${existingM.overflow}`)
  await open(view, path, 390, 844)
  await view.screenshot({ path: `${OUT}/${S.key}_new_mobile${S.leafNotInNav ? '_leaf' : ''}.png` })

  /* ---- Mega menu placement (desktop + mobile) ---- */
  const needle = ref.title.slice(0, 22)
  await open(view, '/atoopv', 1440, 1000, false)
  await view.locator('header a[aria-expanded]', { hasText: S.menuLabel }).first().hover()
  await view.waitForTimeout(600)
  check(`${S.key}: appears in the "${S.menuLabel}" mega menu`, (await view.locator(`header a[href="${path}"]`).count()) >= 1)
  await view.setViewportSize({ width: 390, height: 844 })
  await view.goto(`${BASE}/atoopv`, { waitUntil: 'networkidle' })
  await view.locator('header button[aria-label="Menu"]').first().click()
  await view.locator(`header button[aria-label$="${S.menuLabel}"]`).first().click()
  await view.waitForTimeout(500)
  check(`${S.key}: appears in the mobile "${S.menuLabel}" menu`, (await view.locator(`header a[href="${path}"]`).count()) >= 1)

  /* ---- Unpublish ---- */
  if (first) {
    await admin.getByRole('button', { name: /More actions/ }).click()
    await admin.getByRole('menuitem', { name: 'Unpublish' }).click()
    await admin.getByRole('button', { name: /^Unpublish/ }).last().click()
    await admin.waitForTimeout(800)
    first = false
  } else {
    await admin.request.post(`${API}/admin/cms/pages/${id}/unpublish`, { headers: auth })
  }
  check(`${S.key}: unpublished — public API no longer serves it`, (await admin.request.get(`${API}/cms/pages?path=${encodeURIComponent(path)}`)).status() === 404)
  await open(view, '/atoopv', 1440, 1000, false)
  await view.locator('header a[aria-expanded]', { hasText: S.menuLabel }).first().hover()
  await view.waitForTimeout(600)
  check(`${S.key}: unpublished — gone from the desktop mega menu`, (await view.locator(`header a[href="${path}"]`).count()) === 0)
  await view.setViewportSize({ width: 390, height: 844 })
  await view.goto(`${BASE}/atoopv`, { waitUntil: 'networkidle' })
  await view.locator('header button[aria-label="Menu"]').first().click()
  await view.locator(`header button[aria-label$="${S.menuLabel}"]`).first().click()
  await view.waitForTimeout(500)
  check(`${S.key}: unpublished — gone from the mobile menu`, (await view.locator(`header a[href="${path}"]`).count()) === 0)
  await open(view, `${S.base}/${S.ref}`)
  check(`${S.key}: unpublished — gone from the section's side navigation`, (await view.locator(`main a[href="${path}"]`).count()) === 0)
  await view.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await view.waitForTimeout(600)
  check(`${S.key}: unpublished — the old URL no longer shows the page`, !new URL(view.url()).pathname.endsWith(slug))
}

check('no unexpected browser errors', errors.filter((e) => !/Failed to load resource|404/.test(e)).length === 0, errors.slice(0, 3).join(' || '))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)
