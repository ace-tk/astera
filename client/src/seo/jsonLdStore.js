// Pages that know more than the route (an article's title and dates, a service page's visible trail) hand their JSON-LD nodes
// to this store; useJsonLdHead() (mounted once in App.jsx) merges them with the defaults and writes the <script> tag.
let nodes = null
const listeners = new Set()

export function setPageJsonLd(next) {
  if (next === nodes) return
  nodes = next
  listeners.forEach((fn) => fn())
}
export const getPageJsonLd = () => nodes
export function subscribePageJsonLd(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
