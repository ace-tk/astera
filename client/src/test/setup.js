import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees and reset persisted state between tests.
afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom lacks these browser APIs that our components touch — stub them so
// component tests run without spurious errors (they're not what we're asserting).
window.matchMedia ||= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

window.scrollTo ||= vi.fn()

if (!window.IntersectionObserver) {
  class IntersectionObserverMock {
    constructor(callback) {
      this.callback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  }
  window.IntersectionObserver = IntersectionObserverMock
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
