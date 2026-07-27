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
          {/* Plain CSS (Tailwind's built-in animate-ping), not framer-motion: this
              loader can mount and unmount in rapid succession during route
              transitions, and framer-motion's async keyframe resolver has been
              observed to throw ("reading '0' of null") when a JS-driven
              array-keyframe animation is torn down mid-flight. A CSS animation
              has no such lifecycle to race. */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute inset-0 animate-ping rounded-2xl border border-accent/40"
              style={{ animationDuration: '1.6s', animationDelay: `${i * 0.4}s` }}
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
