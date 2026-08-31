import http from 'node:http'
import { createApp } from '../server/src/app.js'
import { connectDB } from '../server/src/config/db.js'
import { attachSocket } from '../server/src/services/socket.js'

// Vercel serverless entrypoint using Vercel's documented pattern for combining
// an Express app with native WebSocket support: export the underlying
// http.Server (with Socket.IO attached), not a bare (req, res) handler —
// https://vercel.com/docs/functions/websockets. Reuses the exact same
// createApp() used by the local/Render HTTP server (server/src/index.js) and
// by the test suite — no routes, auth, or business logic are duplicated or
// reimplemented here.
//
// Requires Fluid Compute (see vercel.json's "fluid": true, and a project
// created before 2025-04-23 where it isn't already the default) and a Redis
// connection (REDIS_URL) for report:stage/report:ready events to reliably
// reach a client whose WebSocket landed on a different function instance
// than the one processing the upload — see server/src/services/socket.js.
const app = createApp()
const server = http.createServer(app)

await connectDB() // idempotent/cached; runs once per cold start
const io = await attachSocket(server)
app.set('io', io)

export default server
