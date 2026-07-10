import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSound } from '@/context/SoundContext'

/**
 * Vim-style "g then letter" navigation chords (g w / g r / g u / g a / g s).
 * A short window after pressing `g` captures the next letter. Ignored while
 * typing in a field so it never fights a text input.
 */
const CHORDS = {
  w: '/app',
  r: '/app/reports',
  u: '/app/upload',
  a: '/app/analytics',
  s: '/app/settings',
}

export default function GlobalShortcuts() {
  const navigate = useNavigate()
  const { play } = useSound()
  const armed = useRef(false)
  const timer = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (armed.current && CHORDS[e.key.toLowerCase()]) {
        e.preventDefault()
        armed.current = false
        clearTimeout(timer.current)
        play('tick')
        navigate(CHORDS[e.key.toLowerCase()])
        return
      }
      if (e.key.toLowerCase() === 'g') {
        armed.current = true
        clearTimeout(timer.current)
        timer.current = setTimeout(() => (armed.current = false), 800)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(timer.current)
    }
  }, [navigate, play])

  return null
}
