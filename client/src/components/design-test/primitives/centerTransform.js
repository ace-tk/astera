/**
 * Framer Motion owns the whole `transform` CSS property once any of its
 * transform props (rotate, scale, x, y…) are animated via `style` — it
 * silently drops Tailwind's `-translate-x/y-1/2` centering classes rather
 * than composing with them. Pass this as a component's `transformTemplate`
 * to fold that centering back into Framer's own generated transform string
 * whenever a motion element needs both "centered on its coordinate" and an
 * animated rotate/scale/etc.
 */
export function centerTransform(_props, generated) {
  return `translate(-50%, -50%) ${generated}`
}
