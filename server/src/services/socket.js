import { Server } from 'socket.io'
import { env } from '../config/env.js'

/**
 * Realtime channel for the live processing pipeline. Clients join a room keyed
 * by their user id (or 'demo') and receive `report:stage` / `report:ready`
 * events as the intelligence service works through a transcript.
 */
export function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, methods: ['GET', 'POST'] },
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId || 'demo'
    socket.join(`user:${userId}`)
    socket.on('disconnect', () => {})
  })

  return io
}
