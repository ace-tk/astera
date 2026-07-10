import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { accent } from '@/utils/accent'

/**
 * A friendly, illustrated empty state — never "No data". An abstract floating-
 * paper illustration, warm copy, and an optional action. Reused wherever a list
 * or view has nothing yet.
 */
export default function EmptyState({ title, description, action, color = 'royal', icon: Icon, className }) {
  const a = accent(color)
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <div className="relative mb-7 h-28 w-36">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-x-6 top-4 h-20 rounded-2xl border border-ink/8 bg-card shadow-soft"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [-(i * 6), -(i * 6) - 5, -(i * 6)] }}
            transition={{ opacity: { delay: i * 0.1 }, y: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 } }}
            style={{ zIndex: 3 - i, rotate: (i - 1) * 5 }}
          >
            <div className="space-y-2 p-3.5">
              <div className={cn('h-2 w-1/2 rounded-full', i === 0 ? a.softBg : 'bg-ink/8')} />
              <div className="h-1.5 w-full rounded-full bg-ink/6" />
              <div className="h-1.5 w-3/4 rounded-full bg-ink/6" />
            </div>
          </motion.div>
        ))}
        {Icon && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 240, damping: 14 }}
            className={cn('absolute -right-1 top-0 z-10 grid h-10 w-10 place-items-center rounded-full text-white shadow-lift', a.bg)}
          >
            <Icon className="h-5 w-5" />
          </motion.span>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold tracking-tight text-balance">{title}</h3>
      {description && <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted text-pretty">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
