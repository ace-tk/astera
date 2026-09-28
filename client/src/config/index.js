/**
 * Central runtime config. Everything the client needs to know about its
 * environment lives here so we never sprinkle `import.meta.env` across the app.
 */
// Production base URL for SEO (canonical, og:url, sitemap). Single source of
// truth — no page/component should hardcode a domain. O2Switch is production;
// there is no Vercel/astera.app-specific override, by design.
export const SITE_URL = 'https://atoopv.com'

export const config = {
  appName: 'ATOOPV',
  tagline: 'From Conversations to Clarity.',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  // In dev, default to the local backend. In production, an unset value
  // means "connect same-origin" (socket.io-client's default when no URL is
  // passed) — correct when frontend + backend share a domain on Vercel.
  socketUrl: import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5050' : undefined),
  // Must match server/src/services/socket.js's SOCKET_PATH — nested under
  // /api so Vercel's filesystem routing delivers the handshake to the function.
  socketPath: '/api/socket.io',
  // Feature flags let the demo run fully client-side without a live backend.
  demoMode: (import.meta.env.VITE_DEMO_MODE ?? 'true') === 'true',
}
