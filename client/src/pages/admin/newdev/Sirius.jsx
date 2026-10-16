import { Star } from 'lucide-react'
import { PageHeader } from './kit'

// Intentionally empty — UI to be specified.
export default function Sirius() {
  return (
    <>
      <PageHeader icon={Star} section="Sirius" title="Sirius" />
      <div className="mt-6 grid min-h-[16rem] place-items-center rounded-2xl border border-dashed border-ink/15 text-sm text-muted">
        Nothing here yet.
      </div>
    </>
  )
}
