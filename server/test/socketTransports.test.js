import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { io as connect } from 'socket.io-client'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js'
import { attachSocket, SOCKET_PATH } from '../src/services/socket.js'
import { env } from '../src/config/env.js'
import { User } from '../src/models/User.js'

// The Socket.IO options the browser uses in production (client/src/pages/dashboard/UploadStudio.jsx).
const PROD_CLIENT_OPTS = { transports: ['websocket', 'polling'], tryAllTransports: true }
// What the client used before: WebSocket only.
const OLD_CLIENT_OPTS = { transports: ['websocket'] }

async function startServer({ blockWebSocket }) {
  const app = createApp()
  const server = http.createServer(app)
  const io = await attachSocket(server) // the REAL production socket setup
  app.set('io', io)
  if (blockWebSocket) {
    // Simulates a host/proxy that cannot pass WebSocket upgrades (the O2Switch worry): the upgrade
    // connection is dropped, while ordinary HTTP requests (long-polling) still reach the server.
    server.removeAllListeners('upgrade')
    server.on('upgrade', (req, socket) => socket.destroy())
  }
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const url = `http://127.0.0.1:${server.address().port}`
  return { app, url, close: () => new Promise((r) => { io.close(); server.close(r); server.closeAllConnections?.() }) }
}

const open = (url, userId, opts) =>
  new Promise((resolve, reject) => {
    const socket = connect(url, { path: SOCKET_PATH, auth: { userId }, reconnection: false, timeout: 4000, ...opts })
    socket.once('connect', () => resolve(socket))
    socket.once('connect_error', (err) => {
      socket.close()
      reject(err)
    })
  })

const collect = (socket) => {
  const events = []
  socket.on('report:stage', (p) => events.push(['stage', p.stage]))
  socket.on('report:ready', () => events.push(['ready']))
  return events
}

const until = async (fn, ms = 6000) => {
  const t = Date.now()
  while (!fn()) {
    if (Date.now() - t > ms) throw new Error('timed out waiting for condition')
    await new Promise((r) => setTimeout(r, 25))
  }
}

async function liveProgressRun(srv, clientOpts) {
  const user = await User.create({ name: 'Live User', email: `live+${Date.now()}@astera.dev`, passwordHash: await User.hashPassword('supersecret123') })
  const token = jwt.sign({ sub: String(user._id) }, env.jwtSecret, { expiresIn: '1h' })
  const socket = await open(srv.url, String(user._id), clientOpts)
  const events = collect(socket)
  const transport = socket.io.engine.transport.name
  const jobId = crypto.randomUUID()
  const res = await fetch(`${srv.url}/api/reports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: 'Live progress', transcript: 'Maya: We decided to ship.\nDan: I will send the metrics by Friday.', jobId }),
  })
  expect(res.status).toBe(201)
  await until(() => events.some((e) => e[0] === 'ready'))
  socket.close()
  return { events, transport }
}

describe('Socket.IO transports', () => {
  let ws // WebSocket works
  let noWs // WebSocket upgrades are dropped
  beforeAll(async () => {
    ws = await startServer({ blockWebSocket: false })
    noWs = await startServer({ blockWebSocket: true })
  })
  afterAll(async () => {
    await ws.close()
    await noWs.close()
  })

  it('production options prefer WebSocket when the host supports it', async () => {
    const socket = await open(ws.url, 'u1', PROD_CLIENT_OPTS)
    expect(socket.io.engine.transport.name).toBe('websocket')
    socket.close()
  })

  it('REGRESSION PROOF: the old websocket-only options get no connection at all when WebSocket is unavailable', async () => {
    await expect(open(noWs.url, 'u1', OLD_CLIENT_OPTS)).rejects.toBeTruthy()
  })

  it('production options fall back to long-polling and connect when WebSocket is unavailable', async () => {
    const socket = await open(noWs.url, 'u1', PROD_CLIENT_OPTS)
    expect(socket.io.engine.transport.name).toBe('polling')
    socket.close()
  })

  it('live progress still arrives, in order, over WebSocket (existing behaviour preserved)', async () => {
    const { events, transport } = await liveProgressRun(ws, PROD_CLIENT_OPTS)
    expect(transport).toBe('websocket')
    const stages = events.filter((e) => e[0] === 'stage').map((e) => e[1])
    expect(stages.length).toBeGreaterThan(2)
    expect(stages).toContain('report')
    expect(events.at(-1)).toEqual(['ready'])
  })

  it('live progress also arrives over long-polling when WebSocket is unavailable', async () => {
    const { events, transport } = await liveProgressRun(noWs, PROD_CLIENT_OPTS)
    expect(transport).toBe('polling')
    expect(events.filter((e) => e[0] === 'stage').length).toBeGreaterThan(2)
    expect(events.at(-1)).toEqual(['ready'])
  })

  it('the browser code really uses these options (guards against the client drifting from this test)', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const src = fs.readFileSync(path.resolve(here, '../../client/src/pages/dashboard/UploadStudio.jsx'), 'utf8')
    expect(src).toContain("transports: ['websocket', 'polling']")
    expect(src).toContain('tryAllTransports: true')
  })
})
