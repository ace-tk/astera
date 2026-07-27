import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/utils/cn'

/**
 * The ATOOPV lockup. Themes 'light' and 'sunset' sit on a light paper
 * background, so they get the dark/color logo; 'royal' is the one dark
 * theme, so it gets the white logo. Double-click launches a paper airplane
 * (a tiny easter egg, unrelated to the brand refresh).
 */
const LOGO = {
  horizontal: { light: '/logo/horizontal-dark.png', royal: '/logo/horizontal-white.png' },
  icon: { light: '/logo/icon-dark.png', royal: '/logo/icon-white.png' },
}

export default function Wordmark({ className, imgClassName, mono = false }) {
  const { theme } = useTheme()
  const variant = theme === 'royal' ? 'royal' : 'light'
  const src = mono ? LOGO.icon[variant] : LOGO.horizontal[variant]
  const defaultImgClass = mono ? 'h-8 w-8 object-contain' : 'h-7 w-auto object-contain'

  return (
    <motion.span
      className={cn('inline-flex cursor-pointer items-center', className)}
      onDoubleClick={() => window.dispatchEvent(new CustomEvent('astera:plane'))}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      title="ATOOPV"
    >
      <img src={src} alt="ATOOPV" className={imgClassName || defaultImgClass} />
    </motion.span>
  )
}
