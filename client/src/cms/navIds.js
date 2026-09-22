/** A short id that satisfies the CMS's id rule (lowercase letters, numbers, hyphens). */
export const newId = (prefix = 'x') => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

export const routeLink = (route) => ({ type: 'route', route })
export const pageLink = (pageId) => ({ type: 'page', pageId })
export const clone = (v) => JSON.parse(JSON.stringify(v))
