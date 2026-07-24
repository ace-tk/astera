import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

/** Brand-forward suspense fallback — a breathing ATOOPV mark, not a spinner. */
export default function PageLoader() {
  const { theme } = useTheme()
  const icon = theme === 'royal' ? '/logo/icon-white.png' : '/logo/icon-dark.png'

  return (
    <div className="bg-canvas flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative h-12 w-12">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-2xl border border-accent/40"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
            />
          ))}
          <div className="absolute inset-0 grid place-items-center rounded-2xl">
            <img src={icon} alt="" className="h-8 w-8 object-contain" />
          </div>
        </div>
        <p className="text-sm tracking-widest text-muted uppercase">ATOOPV</p>
      </motion.div>
    </div>
  )
}
