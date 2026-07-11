import http from 'node:http'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { attachSocket } from './services/socket.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/index.js'

const app = express()
const server = http.createServer(app)

// Realtime pipeline events, shared with controllers via app locals.
const io = attachSocket(server)
app.set('io', io)

// Behind a proxy (Render/Vercel) so rate-limit + secure cookies see real IPs.
app.set('trust proxy', 1)

// Secure headers. The API returns JSON only, so a strict default CSP is fine;
// cross-origin resource policy is relaxed so the SPA on another origin can read.
app.use(
  helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)
app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(mongoSanitize()) // strip $ / . keys → blocks NoSQL operator injection
app.use(morgan(env.isProd ? 'combined' : 'dev'))

// Baseline rate limit on the whole API, with a tighter cap on writes.
app.use('/api', rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }))
app.use('/api/reports', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }))

app.get('/', (req, res) => res.json({ name: 'Astera API', tagline: 'From conversations to clarity.' }))
app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

async function start() {
  await connectDB()
  server.listen(env.port, () => {
    console.log(`\n  Astera API → http://localhost:${env.port}  [${env.nodeEnv}]\n`)
  })
}

start()
