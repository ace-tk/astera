// Isolated API for browser tests of the CMS: an IN-MEMORY MongoDB only — it never connects to the
// database configured in .env. Prints nothing secret; writes an admin token to the OS temp dir.
//
//   node scripts/e2e-stack.mjs            (API on :5052, allows the Vite dev server on :5198)
//   Also seeds one published plain-text blog post, /blog/article-existant.
//   Accounts: e2e-admin@astera.dev, client-a@astera.dev, client-b@astera.dev — all with password supersecret123
//
// Then, in client/:  VITE_API_URL=http://localhost:5052/api npx vite --port 5198
//                    npm run test:cms-parity
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PORT = Number(process.env.E2E_API_PORT || 5052)
process.env.CLIENT_URL = process.env.E2E_CLIENT_URLS || 'http://localhost:5198'
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/never-used' // even if something tried, it would not reach a real database

const { MongoMemoryServer } = await import('mongodb-memory-server')
const { default: mongoose } = await import('mongoose')
const { default: jwt } = await import('jsonwebtoken')
const mongod = await MongoMemoryServer.create()
await mongoose.connect(mongod.getUri())
const { createApp } = await import('../src/app.js')
const { env } = await import('../src/config/env.js')
const { User } = await import('../src/models/User.js')

const admin = await User.create({ name: 'E2E Admin', email: 'e2e-admin@astera.dev', passwordHash: await User.hashPassword('supersecret123'), role: 'admin' })
// Two customer accounts for the Client Reports test (password for all E2E accounts: supersecret123).
for (const n of ['A', 'B']) await User.create({ name: `Client ${n}`, email: `client-${n.toLowerCase()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123'), role: 'Member', companyName: `Company ${n}` })
// One EXISTING-style blog post (published, plain text, an external image) to compare new posts against.
const { Blog } = await import('../src/models/Blog.js')
await Blog.create({
  title: 'Article existant', slug: 'article-existant', excerpt: 'Un article publié avant le CMS.', content: 'Première ligne\nSeconde ligne\n\nUn autre paragraphe.',
  imageUrl: 'http://localhost:5198/atoopv-media/hero-salle-reunion.webp', author: 'ATOOPV Team', featured: true, published: true, everPublished: true, publishedAt: new Date('2026-01-10T10:00:00Z'),
})
fs.writeFileSync(path.join(os.tmpdir(), 'atoopv-e2e-token.txt'), jwt.sign({ sub: String(admin._id) }, env.jwtSecret, { expiresIn: '6h' }))

// The API's global limiter (120 requests/min) is per app instance; a long browser run would trip it, so the
// sandbox swaps in a fresh instance every 15 s. (Production code is untouched.)
let app = createApp()
setInterval(() => { app = createApp() }, 15_000).unref()
http.createServer((req, res) => app(req, res)).listen(PORT, () => console.log(`E2E API ready on :${PORT} (in-memory database)`))
process.on('SIGTERM', async () => { await mongoose.disconnect(); await mongod.stop(); process.exit(0) })
