import { Briefcase, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageHeader, Stat, Chip, Table } from './kit'

export default function Commercial() {
  return (
    <>
      <PageHeader
        icon={Briefcase}
        section="Commercial"
        title="Commercial manager"
        lead="Pipeline and accounts handled by the commercial manager."
        action={<Button size="sm" variant="accent" magnetic={false}><Plus className="h-4 w-4" /> New deal</Button>}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Open deals" value="14" /><Stat label="Pipeline value" value="€182 k" /><Stat label="Won this quarter" value="6" /></div>
      <div className="mt-6">
        <Table
          head={['Account', 'Owner', 'Stage', 'Value (excl. VAT)']}
          rows={[
            ['CSE Renault Lyon', 'Lucas Moreau', <Chip key="a" tone="blue">Proposal</Chip>, '€24 000'],
            ['CSE Banque Nord', 'Lucas Moreau', <Chip key="b" tone="amber">Negotiation</Chip>, '€41 500'],
            ['CSE Transports Est', 'Amélie Rousseau', <Chip key="c" tone="green">Won</Chip>, '€12 800'],
          ]}
        />
      </div>
    </>
  )
}
