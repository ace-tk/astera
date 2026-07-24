/**
 * Central runtime config. Everything the client needs to know about its
 * environment lives here so we never sprinkle `import.meta.env` across the app.
 */
export const config = {
  appName: 'ATOOPV',
  tagline: 'From Conversations to Clarity.',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050',
  // Feature flags let the demo run fully client-side without a live backend.
  demoMode: (import.meta.env.VITE_DEMO_MODE ?? 'true') === 'true',
}
