import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useSound } from '@/context/SoundContext'
import { cn } from '@/utils/cn'

/** Small speaker toggle; plays a confirming cue when switched on. */
export default function SoundToggle({ className }) {
  const { enabled, setEnabled, play } = useSound()
  return (
    <button
      onClick={() => {
        const next = !enabled
        setEnabled(next)
        if (next) setTimeout(() => play('open'), 30)
      }}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      aria-pressed={enabled}
      className={cn(
        'relative grid h-10 w-10 place-items-center rounded-full border border-ink/8 bg-card text-muted transition-colors hover:text-ink',
        className,
      )}
    >
      {enabled ? (
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-accent">
          <Volume2 className="h-4.5 w-4.5" />
        </motion.span>
      ) : (
        <VolumeX className="h-4.5 w-4.5" />
      )}
      {enabled && (
        <motion.span
          className="absolute inset-0 rounded-full ring-1 ring-accent/40"
          animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </button>
  )
}
