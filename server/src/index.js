import http from 'node:http'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import { attachSocket } from './services/socket.js'
import { createApp } from './app.js'

const app = createApp()
const server = http.createServer(app)

// Realtime pipeline events, shared with controllers via app locals.
const io = attachSocket(server)
app.set('io', io)

async function start() {
  await connectDB()
  server.listen(env.port, () => {
    console.log(`\n  Astera API → http://localhost:${env.port}  [${env.nodeEnv}]\n`)
  })
}

start()
