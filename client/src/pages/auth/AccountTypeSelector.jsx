import { User, Building2, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { accent } from '@/utils/accent'

const OPTIONS = [
  {
    type: 'guest',
    icon: User,
    color: 'sky',
    title: 'Guest User',
    description: 'For individuals using ATOOPV for personal meetings and reports.',
  },
  {
    type: 'company',
    icon: Building2,
    color: 'royal',
    title: 'Company Registration',
    description: 'For businesses — includes company profile, VAT, and LinkedIn.',
  },
]

/** First step of registration: pick Guest (individual) or Company (business). */
export default function AccountTypeSelector({ onSelect }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {OPTIONS.map(({ type, icon: Icon, color, title, description }) => {
        const a = accent(color)
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={cn(
              'group flex flex-col items-start rounded-2xl border border-ink/10 bg-card p-6 text-left shadow-soft transition-all hover:shadow-lift',
              'hover:border-ink/20',
            )}
          >
            <span className={cn('grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:rotate-6', a.softBg, a.text)}>
              <Icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
            <span className={cn('mt-4 inline-flex items-center gap-1.5 text-sm font-medium', a.text)}>
              Continue <Check className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
