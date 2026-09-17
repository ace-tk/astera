import { useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

/**
 * True only while the page is scrolled within `threshold` px of the very
 * top — used to show something (e.g. AtoopvAnnouncementBar) only at rest
 * on page load, then hide it the moment the user scrolls, unlike Navbar's
 * own `scrolled` boolean (threshold 24px) which instead toggles the pill's
 * condensed look and stays "scrolled" for the rest of the page.
 */
export function useIsAtTop(threshold = 8) {
  const [atTop, setAtTop] = useState(true)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (v) => setAtTop(v <= threshold))
  return atTop
}
