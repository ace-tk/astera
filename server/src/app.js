import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { env } from './config/env.js'
import routes from './routes/index.js'
import { errorHandler, notFound } from './middleware/index.js'

/**
 * Builds the configured Express app (no port binding, no socket) so it can be
 * unit-tested with supertest and reused by the HTTP entrypoint.
 */
export function createApp() {
  const app = express()

  // Behind a proxy (Vercel / O2Switch Apache+Passenger) so rate limits see real IPs. Hop count is
  // configurable (TRUST_PROXY, default 1).
  app.set('trust proxy', env.trustProxy)

  app.use(
    helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(cors({ origin: env.clientUrls, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(mongoSanitize())
  if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'))

  app.use('/api', rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }))
  app.use('/api/reports', rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }))
  // Public, unauthenticated, and sends real email - so it gets a much tighter limit than the rest of the API.
  app.use(
    '/api/contact',
    rateLimit({
      windowMs: 15 * 60_000,
      max: env.contactRateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Trop de demandes envoyées. Merci de réessayer dans quelques minutes.' },
    }),
  )

  app.get('/', (req, res) => res.json({ name: 'Astera API', tagline: 'From conversations to clarity.' }))
  app.use('/api', routes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
