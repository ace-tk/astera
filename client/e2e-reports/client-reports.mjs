// Browser test of the Client Reports flow, through the real login form and screens:
//   admin uploads a PDF for Client A → Client A sees and opens it → Client B cannot see or open it →
//   visitors are rejected → removal ends access.
//
//   (server)  node scripts/e2e-stack.mjs                                  in-memory API on :5052 (fresh each run)
//   (client)  VITE_API_URL=http://localhost:5052/api npx vite --port 5198
//   (client)  npm run test:client-reports
import { chromium } from 'playwright'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const BASE = process.env.E2E_BASE || 'http://localhost:5198'
const API = process.env.E2E_API || 'http://localhost:5052/api'
const OUT = path.join(os.tmpdir(), 'atoopv-client-reports')
fs.mkdirSync(OUT, { recursive: true })
const PASSWORD = 'supersecret123'

const results = []
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`) }

// A small but valid one-page PDF (with a correct cross-reference table).
function makePdf(text) {
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  const stream = `BT /F1 18 Tf 30 100 Td (${text}) Tj ET`
  objs[3] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  let out = '%PDF-1.4\n'
  const offsets = []
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out)
}
const PDF_A = makePdf('Confidential report for Client A')

const browser = await chromium.launch()
const errors = []
async function session(email, viewport = { width: 1440, height: 1000 }) {
  const ctx = await browser.newContext({ viewport })
  await ctx.addInitScript(() => localStorage.setItem('astera:onboarded', '1'))
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder('you@company.com').fill(email)
  await page.locator('input[type="password"]').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL(/\/app/, { timeout: 20000 })
  const token = await page.evaluate(() => localStorage.getItem('astera:token'))
  return { ctx, page, token, auth: { Authorization: `Bearer ${token}` } }
}
const blobStartsWithPdf = (page) => page.evaluate(async () => {
  const src = document.querySelector('iframe')?.src || ''
  if (!src.startsWith('blob:')) return { src: src.slice(0, 20), ok: false }
  const buf = new Uint8Array(await (await fetch(src)).arrayBuffer())
  return { src: 'blob:', ok: String.fromCharCode(...buf.slice(0, 5)) === '%PDF-', size: buf.length }
})

/* ============================== ADMIN ============================== */
const admin = await session('e2e-admin@astera.dev')
check('admin: signed in through the login form', admin.page.url().includes('/app'))
await admin.page.goto(`${BASE}/app/admin/customers`, { waitUntil: 'networkidle' })
check('admin: the Clients (Customers) list shows Client A and Client B', (await admin.page.getByText('Company A').count()) >= 1 && (await admin.page.getByText('Company B').count()) >= 1)
await admin.page.locator('tr', { hasText: 'Company A' }).getByRole('link', { name: 'Open' }).click()
await admin.page.waitForURL(/\/app\/admin\/customers\/[a-f0-9]{24}/)
const clientAId = admin.page.url().match(/customers\/([a-f0-9]{24})/)[1]
await admin.page.getByRole('heading', { name: 'Client Reports' }).waitFor()
check('admin: the selected client’s page has a Client Reports section, empty at first', (await admin.page.getByText('No PDF reports uploaded for this client yet.').count()) === 1)

// wrong file type is caught in the form (the server checks again)
await admin.page.getByRole('button', { name: 'Upload PDF' }).click()
await admin.page.getByLabel('PDF file').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
check('admin: a non-PDF file is refused in the form with a clear message', (await admin.page.getByRole('alert').innerText()).includes('Only PDF files'))
check('admin: the report was not created by that attempt', (await (await admin.page.request.get(`${API}/admin/customers/${clientAId}/client-reports`, { headers: admin.auth })).json()).reports.length === 0)

// a fake .pdf (right name, wrong bytes) gets past the form but is rejected by the server
await admin.page.getByLabel('PDF file').setInputFiles({ name: 'fake.pdf', mimeType: 'application/pdf', buffer: Buffer.from('this is not a pdf') })
await admin.page.getByRole('button', { name: 'Save report' }).click()
await admin.page.getByText('Only PDF files can be uploaded.').first().waitFor()
check('admin: a fake PDF is rejected by the server and shown to the admin', (await (await admin.page.request.get(`${API}/admin/customers/${clientAId}/client-reports`, { headers: admin.auth })).json()).reports.length === 0)

// the real upload
await admin.page.getByLabel('Report name').fill('Rapport A — mars 2026')
await admin.page.getByLabel('PDF file').setInputFiles({ name: 'rapport-a.pdf', mimeType: 'application/pdf', buffer: PDF_A })
await admin.page.getByRole('button', { name: 'Save report' }).click()
await admin.page.getByText('Rapport A — mars 2026').first().waitFor()
const row = admin.page.locator('li', { hasText: 'Rapport A — mars 2026' })
check('admin: the uploaded report appears with its name, upload date, size, View and Remove', (await row.getByText(/Uploaded .* · \d+ KB/).count()) === 1 && (await row.getByRole('button', { name: 'View' }).count()) === 1 && (await row.getByRole('button', { name: /Remove/ }).count()) === 1, await row.innerText().then((t) => t.replace(/\s+/g, ' ')))
await admin.page.screenshot({ path: `${OUT}/admin_customer_reports.png` })
const adminList = (await (await admin.page.request.get(`${API}/admin/customers/${clientAId}/client-reports`, { headers: admin.auth })).json()).reports
const reportId = adminList[0].id
check('admin: the API stores it against Client A only', adminList.length === 1 && adminList[0].client === clientAId)

await row.getByRole('button', { name: 'View' }).click()
await admin.page.locator('iframe').waitFor()
await admin.page.waitForTimeout(800)
const adminBlob = await blobStartsWithPdf(admin.page)
check('admin: View opens the PDF in an in-app viewer', adminBlob.ok && adminBlob.size === PDF_A.length, JSON.stringify(adminBlob))
await admin.page.keyboard.press('Escape')

// the existing customer screens are untouched
check('admin: the customer’s existing Reports (AI reports) section is still there', (await admin.page.getByRole('heading', { name: 'Reports', exact: true }).count()) === 1 && (await admin.page.getByRole('button', { name: 'Upload Report' }).count()) === 1)

// unknown client
await admin.page.goto(`${BASE}/app/admin/customers/${'0'.repeat(24)}`, { waitUntil: 'networkidle' })
check('admin: a missing client shows "Customer not found" (no upload possible)', (await admin.page.getByText('Customer not found').count()) === 1)
const missing = await admin.page.request.post(`${API}/admin/customers/${'0'.repeat(24)}/client-reports`, { headers: admin.auth, multipart: { file: { name: 'r.pdf', mimeType: 'application/pdf', buffer: PDF_A } } })
check('admin: the API rejects an upload for a client that does not exist (404)', missing.status() === 404)

/* ============================== CLIENT A ============================== */
const a = await session('client-a@astera.dev')
const cr = a.page.locator('a[href="/app/client-reports"]')
await cr.first().waitFor()
const rp = a.page.locator('a[href="/app/reports"]')
check('client A: the sidebar has Client Reports, next to the existing Reports', (await cr.count()) >= 1 && (await rp.count()) >= 1, `${(await cr.first().innerText()).trim()} / ${(await rp.first().innerText()).trim()}`)
await a.page.getByRole('link', { name: 'Client Reports' }).click()
await a.page.getByRole('heading', { name: 'Client Reports' }).waitFor()
const card = a.page.locator('div', { hasText: 'Rapport A — mars 2026' }).filter({ has: a.page.getByRole('link', { name: 'View' }) }).last()
await card.waitFor()
check('client A: sees their report with its title, upload date and a View button', (await card.getByText(/Uploaded /).count()) === 1 && (await card.getByRole('link', { name: 'View' }).count()) === 1)
await a.page.screenshot({ path: `${OUT}/client_a_reports.png` })

const fileResponse = a.page.waitForResponse((r) => r.url().includes(`/client-reports/${reportId}/file`))
await card.getByRole('link', { name: 'View' }).click()
await a.page.waitForURL(new RegExp(`/app/client-reports/${reportId}`))
const resp = await fileResponse
await a.page.locator('iframe').waitFor()
await a.page.waitForTimeout(800)
check('client A: the file request is authenticated and returns application/pdf, private, not cached', resp.status() === 200 && resp.headers()['content-type'] === 'application/pdf' && resp.headers()['cache-control'] === 'private, no-store' && Boolean(resp.request().headers().authorization))
const aBlob = await blobStartsWithPdf(a.page)
check('client A: View opens the report in the page (viewer shows the real PDF, no download needed)', aBlob.ok && aBlob.size === PDF_A.length, JSON.stringify(aBlob))
check('client A: the viewer page has its title and a way back', (await a.page.getByRole('heading', { name: 'Rapport A — mars 2026' }).count()) === 1 && (await a.page.getByRole('link', { name: 'All reports' }).count()) === 1)
await a.page.screenshot({ path: `${OUT}/client_a_viewer.png` })

await a.page.goto(`${BASE}/app/reports`, { waitUntil: 'networkidle' })
check('client A: the existing Reports page still works', (await a.page.locator('main, body').first().innerText()).length > 50 && a.page.url().endsWith('/app/reports'))

/* ============================== CLIENT B ============================== */
const b = await session('client-b@astera.dev')
await b.page.getByRole('link', { name: 'Client Reports' }).click()
await b.page.getByRole('heading', { name: 'Client Reports' }).waitFor()
await b.page.getByText('No reports have been shared with you yet.').waitFor()
check('client B: does NOT see Client A’s report (empty list)', !(await b.page.locator('body').innerText()).includes('Rapport A'))
const bDirect = await b.page.request.get(`${API}/client-reports/${reportId}/file`, { headers: b.auth })
check('client B: direct API access to Client A’s report id is rejected (404, JSON — never the PDF)', bDirect.status() === 404 && (bDirect.headers()['content-type'] || '').includes('json'))
const bList = await (await b.page.request.get(`${API}/client-reports`, { headers: b.auth })).json()
check('client B: the API list for B contains nothing of A’s', JSON.stringify(bList).includes(reportId) === false && bList.reports.length === 0)
await b.page.goto(`${BASE}/app/client-reports/${reportId}`, { waitUntil: 'networkidle' })
await b.page.getByText('This report is not available.').waitFor()
check('client B: opening A’s report link in the app shows "not available" and no PDF viewer', (await b.page.locator('iframe').count()) === 0)
await b.page.screenshot({ path: `${OUT}/client_b_denied.png` })
const bAdmin = await b.page.request.get(`${API}/admin/client-reports/${reportId}/file`, { headers: b.auth })
check('client B: the admin file endpoint refuses a non-admin (403)', bAdmin.status() === 403)

/* ============================== VISITORS ============================== */
const anon = await (await browser.newContext()).newPage()
const anonEndpoints = [`${API}/client-reports`, `${API}/client-reports/${reportId}/file`, `${API}/admin/client-reports/${reportId}/file`, `${API}/admin/customers/${clientAId}/client-reports`]
const anonStatuses = []
for (const u of anonEndpoints) anonStatuses.push((await anon.request.get(u)).status())
check('visitor: every report endpoint answers 401 without a session', anonStatuses.every((s) => s === 401), anonStatuses.join(','))
await anon.goto(`${BASE}/app/client-reports`, { waitUntil: 'networkidle' })
check('visitor: the Client Reports page redirects to the login', /\/login/.test(anon.url()))

/* ============================== REMOVAL ============================== */
await admin.page.goto(`${BASE}/app/admin/customers/${clientAId}`, { waitUntil: 'networkidle' })
const row2 = admin.page.locator('li', { hasText: 'Rapport A — mars 2026' })
await row2.getByRole('button', { name: /Remove/ }).click()
await admin.page.getByRole('button', { name: 'Remove report' }).click()
await admin.page.getByText('No PDF reports uploaded for this client yet.').waitFor()
await admin.page.getByText('will be deleted and the client', { exact: false }).waitFor({ state: 'detached' }) // the dialog finishes closing
const leftover = await admin.page.getByText('Rapport A — mars 2026').evaluateAll((els) => els.map((e) => `${e.tagName}: ${e.parentElement?.className?.slice(0, 50)} :: ${e.textContent.slice(0, 60)}`))
check('admin: Remove takes the report off the client’s page', leftover.length === 0, leftover.join(' || '))
await a.page.goto(`${BASE}/app/client-reports`, { waitUntil: 'networkidle' })
await a.page.getByText('No reports have been shared with you yet.').waitFor()
check('client A: the removed report is gone from their list', (await a.page.getByText('Rapport A').count()) === 0 && (await a.page.getByRole('link', { name: 'View' }).count()) === 0)
const gone = await a.page.request.get(`${API}/client-reports/${reportId}/file`, { headers: a.auth })
check('client A: the removed report can no longer be opened (404)', gone.status() === 404)
const goneAdmin = await admin.page.request.get(`${API}/admin/client-reports/${reportId}/file`, { headers: admin.auth })
check('admin: the removed file is gone for admins too (404)', goneAdmin.status() === 404)

check('no unexpected browser errors', errors.filter((e) => !/Failed to load resource/.test(e)).length === 0, errors.slice(0, 3).join(' || '))
await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed  (screenshots: ${OUT})`)
process.exit(failed.length ? 1 : 0)
