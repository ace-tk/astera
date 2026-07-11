import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { useSound } from '@/context/SoundContext'
import { useToast } from '@/context/ToastContext'

const COLORS = ['#365DF5', '#FF6B6B', '#F6C453', '#16B364', '#38BDF8', '#7C3AED', '#F43F5E', '#FF9F43']
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** Paper-bit confetti burst from an origin. Pieces are generated per-run. */
function Confetti({ burst }) {
  const pieces = useRef([])
  if (burst && pieces.current.length === 0) {
    pieces.current = Array.from({ length: 90 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 90 + Math.random() * 0.4
      const dist = 120 + Math.random() * 320
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 120,
        rot: Math.random() * 720 - 360,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        delay: Math.random() * 0.15,
      }
    })
  }
  if (!burst) pieces.current = []

  return (
    <AnimatePresence>
      {burst && (
        <div className="pointer-events-none fixed inset-0 z-[130] overflow-hidden">
          <div className="absolute left-1/2 top-1/2">
            {pieces.current.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-[2px]"
                style={{ width: p.w, height: p.h, background: p.color }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: p.x, y: [p.y, p.y + 500], opacity: [1, 1, 0], rotate: p.rot }}
                transition={{ duration: 2.2, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** A little paper airplane that arcs across the screen. */
function PaperPlane({ flying }) {
  return (
    <AnimatePresence>
      {flying && (
        <motion.div
          className="pointer-events-none fixed z-[130] text-ink"
          initial={{ x: -80, y: '70vh', rotate: -8, opacity: 0 }}
          animate={{ x: '110vw', y: ['70vh', '30vh', '52vh', '20vh'], rotate: [-8, 6, -4, 10], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.6, ease: 'easeInOut' }}
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="M22 2 11 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Hidden delights: the Konami code triggers a confetti celebration, double-
 * clicking the wordmark launches a paper airplane, and switching themes fires a
 * gentle confetti puff. Purely for joy — never in the way.
 */
export default function EasterEggs() {
  const [burst, setBurst] = useState(false)
  const [flying, setFlying] = useState(false)
  const seq = useRef([])
  const { theme } = useTheme()
  const { play } = useSound()
  const { toast } = useToast()
  const firstTheme = useRef(true)

  const celebrate = useCallback(
    (big) => {
      setBurst(false)
      requestAnimationFrame(() => setBurst(true))
      play('chime')
      if (big) toast({ title: 'You found it. ✦', description: 'The Konami code lives. Enjoy the confetti.', variant: 'magic', color: 'purple' })
      setTimeout(() => setBurst(false), 2600)
    },
    [play, toast],
  )

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      seq.current = [...seq.current, key].slice(-KONAMI.length)
      if (KONAMI.every((k, i) => seq.current[i] === k)) {
        seq.current = []
        celebrate(true)
      }
    }
    const onPlane = () => { setFlying(false); requestAnimationFrame(() => setFlying(true)); play('paper'); setTimeout(() => setFlying(false), 2800) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('astera:plane', onPlane)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('astera:plane', onPlane) }
  }, [celebrate, play])

  // Gentle celebration when the palette changes (not on first paint).
  useEffect(() => {
    if (firstTheme.current) { firstTheme.current = false; return }
    setBurst(false)
    requestAnimationFrame(() => setBurst(true))
    setTimeout(() => setBurst(false), 2200)
  }, [theme])

  return (
    <>
      <Confetti burst={burst} />
      <PaperPlane flying={flying} />
    </>
  )
}
