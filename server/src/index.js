import http from 'node:http'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env, assertEnv } from './config/env.js'
import { connectDB } from './config/db.js'
import { attachSocket } from './services/socket.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/index.js'

assertEnv()

const app = express()
const server = http.createServer(app)

// Realtime pipeline events, shared with controllers via app locals.
const io = attachSocket(server)
app.set('io', io)

app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(morgan(env.isProd ? 'combined' : 'dev'))

// Gentle protection on write-heavy report generation.
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
