import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import AmbientBackground from '@/components/landing/AmbientBackground'

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center bg-paper px-6 text-center">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-display text-[9rem] font-semibold leading-none tracking-tight text-ink/10">404</p>
        <h1 className="-mt-6 font-display text-4xl font-semibold tracking-tight">This page lost the plot.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          The conversation you’re looking for didn’t make it into a report. Let’s get you back to clarity.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button as={Link} to="/" variant="accent">Back home</Button>
          <Button as={Link} to="/app" variant="soft">Open app</Button>
        </div>
      </motion.div>
    </main>
  )
}
