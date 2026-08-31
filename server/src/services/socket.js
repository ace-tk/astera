import { Server } from 'socket.io'
import { createClient } from 'redis'
import { createAdapter } from '@socket.io/redis-adapter'
import { env } from '../config/env.js'

// Nested under /api so Vercel's filesystem routing — which only forwards
// requests under /api/* to the serverless function — actually delivers the
// Socket.IO handshake/upgrade requests to this server. A bare /socket.io/
// path would never reach the function (404) on Vercel.
export const SOCKET_PATH = '/api/socket.io'

/**
 * Realtime channel for the live processing pipeline. Clients join a room keyed
 * by their user id (or 'demo') and receive `report:stage` / `report:ready`
 * events as the intelligence service works through a transcript.
 *
 * Redis adapter: on Vercel, the HTTP request that runs the report pipeline
 * (and calls `io.to(room).emit(...)`) and the WebSocket connection holding
 * that user's client are two separate requests with no guarantee of landing
 * on the same function instance. Without a shared pub/sub layer, an emit
 * issued from one instance has no path to a socket held by another — it
 * silently no-ops. The adapter makes every instance's emit reach every
 * instance's sockets, which is required for correct delivery in production,
 * not just an optimization. Falls back to same-instance-only delivery (fine
 * for a single local dev process) when REDIS_URL isn't set or unreachable.
 */
export async function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    path: SOCKET_PATH,
    cors: { origin: env.clientUrls, methods: ['GET', 'POST'] },
  })

  if (env.redisUrl) {
    try {
      const pubClient = createClient({ url: env.redisUrl })
      const subClient = pubClient.duplicate()
      pubClient.on('error', (err) => console.error('[socket] Redis pub client error:', err.message))
      subClient.on('error', (err) => console.error('[socket] Redis sub client error:', err.message))
      await Promise.all([pubClient.connect(), subClient.connect()])
      io.adapter(createAdapter(pubClient, subClient))
      console.log('✓ Socket.IO Redis adapter connected — cross-instance delivery enabled')
    } catch (err) {
      console.warn('⚠ Redis adapter unavailable — progress events will only reach clients on the same instance:', err.message)
    }
  } else {
    console.warn('⚠ REDIS_URL not set — progress events will only reach clients on the same instance (fine for local dev; required for reliable delivery in multi-instance production)')
  }

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || 'demo'
    socket.join(`user:${userId}`)
    socket.on('disconnect', () => {})
  })

  return io
}
