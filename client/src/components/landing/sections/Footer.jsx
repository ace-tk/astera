import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Reveal from '@/components/ui/Reveal'
import Wordmark from '@/components/common/Wordmark'
import Waveform from '@/components/landing/Waveform'

const COLUMNS = [
  { title: 'Product', links: ['Features', 'How it works', 'Pricing', 'Changelog'] },
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
  { title: 'Resources', links: ['Docs', 'API', 'Security', 'Status'] },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-section">
      <div className="shell">
        {/* Big closing CTA on a dark inked slab */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-8 py-16 text-paper sm:px-16 sm:py-24">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <Waveform bars={72} height={220} className="h-full" />
            </div>
            <div className="relative max-w-2xl">
              <h2 className="font-display text-display-sm font-semibold leading-[1.02] tracking-tight text-balance">
                From conversations to clarity.
              </h2>
              <p className="mt-5 max-w-lg text-lg text-paper/70">
                Give ATOOPV your next recording. Get back a report your whole team
                will want to read — before the room even clears.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button as={Link} to="/app" size="lg" variant="accent">
                  Generate beautiful reports <ArrowUpRight className="h-5 w-5" />
                </Button>
                <Button
                  as="a"
                  href="#how"
                  size="lg"
                  variant="ghost"
                  magnetic={false}
                  className="border-paper/25 text-paper hover:bg-paper/10"
                >
                  Watch demo
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Footer grid */}
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              ATOOPV turns long meetings into beautiful intelligence reports.
              From conversations to clarity.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="link-underline text-sm text-ink/70 hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-ink/8 py-8 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} ATOOPV. Crafted, not generated.</p>
          <div className="flex gap-6">
            <a href="#" className="link-underline hover:text-ink">Privacy</a>
            <a href="#" className="link-underline hover:text-ink">Terms</a>
            <a href="#" className="link-underline hover:text-ink">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
