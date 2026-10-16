import { Users, Plus, Database, FolderKanban } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageHeader, Tabs, useTab, Card, Stat, Chip, Table } from './kit'

const TABS = [
  { id: 'team', label: 'Team management' },
  { id: 'projects', label: 'Project management' },
  { id: 'data', label: 'Data management' },
]

export default function Team() {
  const [tab, setTab] = useTab(TABS)
  return (
    <>
      <PageHeader icon={Users} section="Team" title="Team" lead="People, projects and data for the business." />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6 space-y-6">
        {tab === 'team' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3"><Stat label="Members" value="12" /><Stat label="Active now" value="7" /><Stat label="Pending invites" value="2" /></div>
            <div className="flex justify-end"><Button size="sm" variant="accent" magnetic={false}><Plus className="h-4 w-4" /> Invite member</Button></div>
            <Table
              head={['Name', 'Role', 'Vertical', 'Status']}
              rows={[
                ['Amélie Rousseau', 'Owner', 'Manufacturing', <Chip key="a" tone="green">Active</Chip>],
                ['Karim Benali', 'Operations manager', 'Manufacturing', <Chip key="b" tone="green">Active</Chip>],
                ['Sofia Martins', 'Finance', 'Distribution', <Chip key="c" tone="amber">Invited</Chip>],
                ['Lucas Moreau', 'Commercial', 'Distribution', <Chip key="d" tone="green">Active</Chip>],
              ]}
            />
          </>
        )}
        {tab === 'projects' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3"><Stat label="Projects" value="8" /><Stat label="In progress" value="5" /><Stat label="Overdue" value="1" /></div>
            <div className="grid gap-4 md:grid-cols-3">
              {[['To do', [['Supplier audit', 'Q4']], 'grey'], ['In progress', [['Lyon plant upgrade', 'Karim'], ['VAT reporting', 'Sofia']], 'blue'], ['Done', [['Onboarding flow', 'Amélie']], 'green']].map(([col, items, tone]) => (
                <Card key={col}>
                  <p className="mb-3 flex items-center justify-between text-sm font-medium"><span className="inline-flex items-center gap-2"><FolderKanban className="h-4 w-4 text-muted" />{col}</span><Chip tone={tone}>{items.length}</Chip></p>
                  <div className="space-y-2">{items.map(([t, o]) => <div key={t} className="rounded-lg border border-ink/8 bg-paper px-3 py-2 text-sm">{t}<p className="text-xs text-muted">{o}</p></div>)}</div>
                </Card>
              ))}
            </div>
          </>
        )}
        {tab === 'data' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3"><Stat label="Datasets" value="14" /><Stat label="Storage used" value="2.4 GB" /><Stat label="Last sync" value="2 h ago" /></div>
            <Table
              head={['Dataset', 'Source', 'Records', 'Updated']}
              rows={[
                [<span key="1" className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-muted" />Suppliers</span>, 'Import', '1 240', 'Today'],
                [<span key="2" className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-muted" />Production runs</span>, 'Manual', '860', 'Yesterday'],
                [<span key="3" className="inline-flex items-center gap-2"><Database className="h-4 w-4 text-muted" />VAT invoices</span>, 'Import', '3 112', '3 days ago'],
              ]}
            />
          </>
        )}
      </div>
    </>
  )
}
