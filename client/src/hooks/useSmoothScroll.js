import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Wires Lenis momentum scrolling into the RAF loop and exposes it globally so
 * anchor links and GSAP ScrollTriggers can drive it. Automatically disabled
 * for users who prefer reduced motion.
 */
export function useSmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    window.__lenis = lenis

    let raf
    const loop = (time) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // Arriving here via a cross-page nav link to `/#section` (e.g. the Story
    // dropdown, clicked from another route) lands with the hash already in
    // the URL but no scroll — a plain route change doesn't scroll to
    // fragments. Do it once Lenis and layout have had a beat to settle.
    const initialHash = window.location.hash
    let hashTimer
    if (initialHash.length > 1) {
      hashTimer = setTimeout(() => {
        const el = document.querySelector(initialHash)
        if (el) lenis.scrollTo(el, { offset: -96 })
      }, 120)
    }

    // In-page anchor navigation should glide, not jump.
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      if (id.length <= 1) return
      const el = document.querySelector(id)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -96 })
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hashTimer)
      document.removeEventListener('click', onClick)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}
