// Browser test of the Blog CMS, through the real login form and screens:
//   Admin → Content → Blog → write / edit → save draft → preview → publish → public Blog page + homepage card
//   → unpublish; drafts never replace live content; the existing Blog design is unchanged.
//
//   (server)  node scripts/e2e-stack.mjs                                  fresh in-memory API on :5052
//   (client)  VITE_API_URL=http://localhost:5052/api npx vite --port 5198
//   (client)  npm run test:blog-cms
import { chromium } from 'playwright'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://localhost:5198'
const API = process.env.E2E_API || 'http://localhost:5052/api'
const OUT = path.join(os.tmpdir(), 'atoopv-blog-cms')
fs.mkdirSync(OUT, { recursive: true })
const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

// A real 640x360 PNG (a solid colour), so the cover image has the public card's 16:9 shape.
import zlib from 'node:zlib'
function makePng(w, h, rgb) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]) }
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: w }, () => rgb).flat())])
  const raw = Buffer.concat(Array.from({ length: h }, () => row))
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const COVER = makePng(640, 360, [52, 96, 220])

const browser = await chromium.launch()
const errors = []
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
await ctx.addInitScript(() => localStorage.setItem('astera:onboarded', '1'))
const admin = await ctx.newPage()
admin.on('pageerror', (e) => errors.push(String(e)))
await admin.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await admin.getByPlaceholder('you@company.com').fill('e2e-admin@astera.dev')
await admin.locator('input[type="password"]').fill('supersecret123')
await admin.getByRole('button', { name: 'Sign in' }).click()
await admin.waitForURL(/\/app/, { timeout: 20000 })
const token = await admin.evaluate(() => localStorage.getItem('astera:token'))
const auth = { Authorization: `Bearer ${token}` }
const pub = await ctx.newPage()
pub.on('pageerror', (e) => errors.push(String(e)))

// The page's design, without content or inline styles: the classes of every structural part.
const designOf = () => {
  const cls = (el) => (el ? el.getAttribute('class') : null)
  const art = document.querySelector('article')
  if (!art) return { missing: true }
  return {
    back: cls(document.querySelector('a[href="/#blog"]')),
    eyebrow: cls(art.querySelector('span.eyebrow')),
    h1: cls(art.querySelector('h1')),
    lead: cls(art.querySelector('h1 + p')),
    imageBox: cls(art.querySelector('h1 + p + div')),
    image: cls(art.querySelector('img')),
    imageLoaded: (art.querySelector('img')?.naturalWidth || 0) > 0,
    imageSrc: art.querySelector('img')?.getAttribute('src'),
    eyebrowText: art.querySelector('span.eyebrow')?.textContent,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  }
}
const publicView = async (url, w = 1440) => {
  await pub.setViewportSize({ width: w, height: 1000 })
  await pub.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
  await pub.waitForTimeout(w < 500 ? 1800 : 700)
  return pub.evaluate(designOf)
}
const notFound = () => pub.getByText('This post couldn’t be found.').count()
const shellKeys = ['back', 'eyebrow', 'h1', 'lead', 'imageBox', 'image']
const sameShell = (a, b) => shellKeys.filter((k) => a[k] !== b[k])

/* ============================ the sidebar & list ============================ */
await admin.goto(`${BASE}/app/admin/blog`, { waitUntil: 'networkidle' })
const contentLinks = await admin.locator('a[href^="/app/admin/cms/"], a[href="/app/admin/blog"]').allInnerTexts()
check('admin: Content has Pages, Menus and Blog', ['Pages', 'Menus', 'Blog'].every((l) => contentLinks.map((t) => t.trim()).includes(l)), contentLinks.map((t) => t.trim()).join(' | '))
await admin.getByRole('heading', { name: 'Blog', exact: true }).waitFor()
const legacyRow = admin.locator('li', { hasText: 'Article existant' })
check('admin: the existing blog post is listed as Published', (await legacyRow.getByText('Published').count()) === 1)
await admin.screenshot({ path: `${OUT}/admin_blog_list.png` })

/* ================== the existing post's public design (reference) ================== */
const legacy = await publicView('/blog/article-existant')
check('public: the existing post renders (plain text, external image)', !legacy.missing && legacy.imageLoaded, JSON.stringify({ eyebrow: legacy.eyebrowText }))
await pub.screenshot({ path: `${OUT}/public_existing_post.png` })

/* ============ edit the EXISTING post: draft never replaces live ============ */
await legacyRow.getByRole('link', { name: 'Edit' }).click()
await admin.getByLabel('Post text').waitFor()
check('admin: an existing post opens in its own plain-text format (no formatting toolbar)', (await admin.getByRole('toolbar', { name: 'Formatting' }).count()) === 0 && (await admin.getByLabel('Post text').evaluate((e) => e.tagName)) === 'TEXTAREA')
await admin.getByLabel('Post text').fill('Première ligne modifiée\nSeconde ligne\n\nUn autre paragraphe.')
await admin.getByLabel('Title').fill('Article existant (modifié)')
await admin.getByRole('button', { name: /Save draft/ }).click()
await admin.getByText('Draft saved').waitFor()
check('admin: saving shows "Published · unpublished changes" (the live post is untouched)', (await admin.getByText('Published · unpublished changes').count()) >= 1)
const stillLive = await (await pub.request.get(`${API}/blog/article-existant`)).json()
check('public: the live post is unchanged after the draft was saved', stillLive.blog.title === 'Article existant' && stillLive.blog.content.startsWith('Première ligne\nSeconde'))
const [previewPage] = await Promise.all([ctx.waitForEvent('page'), admin.getByRole('button', { name: /Preview/ }).click()])
await previewPage.waitForURL(/\/blog\/article-existant\?preview=/, { timeout: 15000 })
await previewPage.waitForLoadState('networkidle')
await previewPage.waitForTimeout(700)
check('preview: shows the edited draft in the same page, with the draft notice', (await previewPage.getByRole('heading', { name: 'Article existant (modifié)' }).count()) === 1 && (await previewPage.getByText('Preview — this is an unpublished draft').count()) === 1)
const prevDesign = await previewPage.evaluate(designOf)
check('preview: uses exactly the same design as the live page', sameShell(prevDesign, legacy).length === 0, sameShell(prevDesign, legacy).join(', '))
await previewPage.close()
const stillLive2 = await (await pub.request.get(`${API}/blog/article-existant`)).json()
check('public: previewing changed nothing live', stillLive2.blog.title === 'Article existant')
await admin.getByRole('button', { name: /Publish changes/ }).click()
await admin.getByText('The post is now live on the website.').waitFor()
const nowLive = await (await pub.request.get(`${API}/blog/article-existant`)).json()
check('public: Publish makes the edit live (and the address is unchanged)', nowLive.blog.title === 'Article existant (modifié)' && nowLive.blog.content.startsWith('Première ligne modifiée'))
const legacyAfter = await publicView('/blog/article-existant')
check('public: the existing post keeps its design after being edited', sameShell(legacyAfter, legacy).length === 0 && legacyAfter.eyebrowText === legacy.eyebrowText, sameShell(legacyAfter, legacy).join(', '))
check('public: it is still shown as plain text with its line breaks', (await pub.locator('article .whitespace-pre-wrap').innerText()).startsWith('Première ligne modifiée\nSeconde ligne'))

/* ============================== a NEW post ============================== */
await admin.goto(`${BASE}/app/admin/blog/new`, { waitUntil: 'networkidle' })
await admin.getByLabel('Title').fill('Le CSE et la veille juridique')
await admin.getByLabel('Summary').fill('Ce qu’il faut retenir pour vos réunions de CSE.')
await admin.getByLabel('Author').fill('Équipe ATOOPV')
await admin.getByLabel('Date shown').fill('2026-03-15')
await admin.getByLabel('Feature on the homepage').check()

await admin.getByRole('button', { name: /Choose image/ }).click()
await admin.getByLabel('Upload an image').setInputFiles({ name: 'couverture.png', mimeType: 'image/png', buffer: COVER })
await admin.getByRole('button', { name: /Change image/ }).waitFor()
check('admin: a new cover image is uploaded to the media library and selected', (await admin.locator('img[src*="/api/media/"]').count()) >= 1)

const selectInEditor = (word) => admin.evaluate((w) => {
  const root = document.querySelector('.ProseMirror')
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const i = n.textContent.indexOf(w)
    if (i >= 0) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + w.length); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); root.focus(); return true }
  }
  return false
}, word)
const tool = (name) => admin.getByRole('button', { name, exact: true })
await admin.locator('.ProseMirror').click()
await admin.keyboard.type('Un texte avec du gras, un mot souligné et de l’italique.')
await admin.keyboard.press('Enter')
await admin.keyboard.type('Un sous-titre')
await tool('Heading 2').click()
await admin.keyboard.press('Enter')
await admin.keyboard.type('Premier point')
await tool('Bullet list').click()
await admin.keyboard.press('Enter')
await admin.keyboard.type('Second point')
await admin.keyboard.press('Enter')
await admin.keyboard.press('Enter')
await admin.keyboard.type('Une citation importante')
await tool('Quote').click()
await selectInEditor('gras'); await tool('Bold').click()
await selectInEditor('souligné'); await tool('Underline').click()
await selectInEditor('italique'); await tool('Italic').click()
await selectInEditor('texte'); await tool('Link').click()
await admin.getByLabel('Link address').fill('https://example.com')
await admin.getByRole('button', { name: 'Apply' }).click()
const labels = await admin.locator('[role="toolbar"][aria-label="Formatting"] button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')).filter(Boolean))
check('admin: the editor offers exactly the agreed formatting (no font/colour/size/alignment)', JSON.stringify(labels) === JSON.stringify(['Bold', 'Italic', 'Underline', 'Heading 2', 'Heading 3', 'Heading 4', 'Bullet list', 'Numbered list', 'Quote', 'Link', 'Undo', 'Redo']), labels.join(', '))
await admin.getByRole('button', { name: /Markdown/ }).click()
const md = await admin.getByLabel('Post text (Markdown)').inputValue()
check('admin: the text is stored as the whitelisted formatting (bold, italic, underline, H2, list, quote, link)', ['**gras**', '<u>souligné</u>', '*italique*', '## Un sous-titre', '- Premier point', '- Second point', '> Une citation importante', '[texte](https://example.com)'].every((t) => md.includes(t)), JSON.stringify(md).slice(0, 220))
await admin.getByRole('button', { name: /Visual/ }).click()

await admin.getByRole('button', { name: /Save draft/ }).click()
await admin.waitForURL(/\/app\/admin\/blog\/[a-f0-9]{24}/)
const postId = admin.url().match(/blog\/([a-f0-9]{24})/)[1]
const draft = (await (await admin.request.get(`${API}/admin/blogs/${postId}`, { headers: auth })).json()).blog
const slug = draft.slug
check('admin: Save draft creates the post as a draft with an address from the title', draft.status === 'draft' && slug === 'le-cse-et-la-veille-juridique')
check('public: a draft is not visible (page says not found, API 404, no homepage card)', (await (await pub.request.get(`${API}/blog/${slug}`)).status()) === 404 && (await publicView(`/blog/${slug}`)).missing === true && (await notFound()) === 1)
await admin.screenshot({ path: `${OUT}/admin_editor.png` })

const [p2] = await Promise.all([ctx.waitForEvent('page'), admin.getByRole('button', { name: /Preview/ }).click()])
await p2.waitForURL(new RegExp(`/blog/${slug}\\?preview=${postId}`), { timeout: 15000 })
await p2.waitForLoadState('networkidle'); await p2.waitForTimeout(800)
const fmt = await p2.evaluate(() => {
  const md = document.querySelector('article .markdown-article')
  return md && {
    h2: md.querySelector('h2')?.textContent, strong: md.querySelector('strong')?.textContent, em: md.querySelector('em')?.textContent,
    u: md.querySelector('u')?.textContent, underlined: md.querySelector('u') ? getComputedStyle(md.querySelector('u')).textDecorationLine : '',
    li: md.querySelectorAll('ul li').length, quote: md.querySelector('blockquote')?.textContent.trim(), link: md.querySelector('a[href="https://example.com"]')?.textContent,
    raw: /<\/?u>|\*\*|^#/m.test(document.querySelector('article').innerText),
  }
})
check('preview: the formatting renders with the site’s article typography (no raw tags or asterisks)', fmt && fmt.h2 === 'Un sous-titre' && fmt.strong === 'gras' && fmt.em === 'italique' && fmt.u === 'souligné' && fmt.underlined.includes('underline') && fmt.li === 2 && fmt.quote === 'Une citation importante' && fmt.link === 'texte' && !fmt.raw, JSON.stringify(fmt))
const newPreview = await p2.evaluate(designOf)
check('preview: the new post uses exactly the existing Blog design (same as the existing post)', sameShell(newPreview, legacy).length === 0, sameShell(newPreview, legacy).join(', '))
check('preview: the cover image from the media library loads', newPreview.imageLoaded && newPreview.imageSrc.includes('/api/media/'), newPreview.imageSrc)
await p2.screenshot({ path: `${OUT}/preview_new_post.png` })
await p2.close()

await admin.getByRole('button', { name: /^Publish$/ }).click()
await admin.getByText('The post is now live on the website.').waitFor()
const live = await publicView(`/blog/${slug}`)
check('public: after Publish the post opens on the existing Blog route', !live.missing && (await pub.getByRole('heading', { name: 'Le CSE et la veille juridique' }).count()) === 1)
check('public: it has exactly the existing Blog design (same structure as the existing post)', sameShell(live, legacy).length === 0, sameShell(live, legacy).join(', '))
check('public: author and the date set in the admin are shown', /Équipe ATOOPV/.test(live.eyebrowText) && /2026/.test(live.eyebrowText) && /15/.test(live.eyebrowText), live.eyebrowText)
check('public: the cover image loads from the media library', live.imageLoaded && live.imageSrc.startsWith('http://localhost:5052/api/media/'), live.imageSrc)
await pub.screenshot({ path: `${OUT}/public_new_post.png` })

const mobile = await publicView(`/blog/${slug}`, 390)
check('public (mobile): the new post has the same design and no horizontal overflow', sameShell(mobile, (await publicView('/blog/article-existant', 390))).length === 0 && !mobile.overflow)
await pub.screenshot({ path: `${OUT}/public_new_post_mobile.png` })

// homepage card (the existing Blog section)
await pub.setViewportSize({ width: 1440, height: 1000 })
await pub.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await pub.waitForTimeout(800)
const card = pub.locator('section#blog')
check('public: the homepage Blog card shows the featured new post in its existing design', (await card.getByText('Le CSE et la veille juridique').count()) === 1 && (await card.locator('a[href="/blog/' + slug + '"]').count()) === 1)
await card.scrollIntoViewIfNeeded()
await pub.waitForTimeout(1200) // the card image is lazy-loaded once it is on screen
const cardImg = await card.locator('img').evaluate((i) => ({ src: i.getAttribute('src'), ok: i.naturalWidth > 0 }))
check('public: the card image comes from the media library too', cardImg.ok && cardImg.src.includes('/api/media/'), cardImg.src)

/* ===================== drafts never replace live; unpublish ===================== */
await admin.getByLabel('Title').fill('Titre modifié en brouillon')
await admin.getByRole('button', { name: /Save draft/ }).click()
await admin.getByText('Draft saved').waitFor()
check('public: a saved draft edit does not change the live title', (await (await pub.request.get(`${API}/blog/${slug}`)).json()).blog.title === 'Le CSE et la veille juridique')
await admin.getByRole('button', { name: 'Discard changes' }).click()
await admin.getByRole('button', { name: 'Discard changes' }).last().click()
await admin.getByText('Changes discarded').waitFor()
check('admin: Discard changes returns to the published version', (await admin.getByLabel('Title').inputValue()) === 'Le CSE et la veille juridique')

await admin.getByRole('button', { name: 'Unpublish' }).first().click()
await admin.getByRole('button', { name: 'Unpublish' }).last().click()
await admin.getByText('Unpublished', { exact: true }).first().waitFor()
check('public: Unpublish takes the post offline (API 404, page not found)', (await (await pub.request.get(`${API}/blog/${slug}`)).status()) === 404 && (await publicView(`/blog/${slug}`)).missing === true && (await notFound()) === 1)
await pub.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await pub.waitForTimeout(600)
check('public: the homepage card no longer shows it (falls back to the other featured post)', (await pub.locator('section#blog').getByText('Le CSE et la veille juridique').count()) === 0 && (await pub.locator('section#blog').getByText('Article existant (modifié)').count()) === 1)
check('admin: an unpublished post keeps its text and cannot be deleted', (await admin.getByRole('button', { name: 'Delete post' }).count()) === 0 && (await admin.getByLabel('Title').inputValue()) === 'Le CSE et la veille juridique')
const direct = await admin.request.delete(`${API}/admin/blogs/${postId}`, { headers: auth })
check('admin: the API also refuses to delete a once-published post (409)', direct.status() === 409)

// a never-published draft may be deleted
await admin.goto(`${BASE}/app/admin/blog/new`, { waitUntil: 'networkidle' })
await admin.getByLabel('Title').fill('Brouillon à supprimer')
await admin.getByRole('button', { name: /Save draft/ }).click()
await admin.waitForURL(/\/app\/admin\/blog\/[a-f0-9]{24}/)
await admin.getByRole('button', { name: 'Delete post' }).click()
await admin.getByRole('button', { name: 'Delete post' }).last().click()
await admin.waitForURL(/\/app\/admin\/blog$/)
check('admin: a never-published draft can be deleted', (await admin.getByText('Brouillon à supprimer').count()) === 0)

// visitors / non-admins
const anon = await (await browser.newContext()).newPage()
const statuses = []
for (const [m, u] of [['get', `${API}/admin/blogs`], ['get', `${API}/admin/blogs/${postId}/preview`], ['post', `${API}/admin/blogs/${postId}/publish`]]) statuses.push((await anon.request[m](u)).status())
check('visitors cannot use any admin Blog endpoint (401)', statuses.every((s) => s === 401), statuses.join(','))

check('no unexpected browser errors', errors.filter((e) => !/Failed to load resource/.test(e)).length === 0, errors.slice(0, 3).join(' || '))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed  (screenshots: ${OUT})`)
process.exit(failed.length ? 1 : 0)
