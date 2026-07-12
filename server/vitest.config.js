import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup.js'],
    // in-memory Mongo boot on first run can be slow; keep hooks generous
    hookTimeout: 60_000,
    testTimeout: 20_000,
  },
})
