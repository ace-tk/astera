import { Megaphone, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageHeader, Tabs, useTab, Card, Stat, Chip, Table } from './kit'

const TABS = [
  { id: 'campaigns', label: 'Email campaigns' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'analytics', label: 'Campaign analytics' },
]

const BARS = [38, 52, 44, 68, 61, 79, 72]

export default function Marketing() {
  const [tab, setTab] = useTab(TABS)
  return (
    <>
      <PageHeader icon={Megaphone} section="Marketing" title="Marketing" lead="Email campaigns, newsletters and how they perform." />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6 space-y-6">
        {tab === 'campaigns' && (
          <>
            <div className="flex justify-end"><Button size="sm" variant="accent" magnetic={false}><Plus className="h-4 w-4" /> New campaign</Button></div>
            <Table
              head={['Campaign', 'Audience', 'Status', 'Open rate']}
              rows={[
                ['Autumn offer', '2 400 contacts', <Chip key="a" tone="green">Sent</Chip>, '41 %'],
                ['Product launch', '1 180 contacts', <Chip key="b" tone="amber">Scheduled</Chip>, '—'],
                ['Win-back', '620 contacts', <Chip key="c">Draft</Chip>, '—'],
              ]}
            />
          </>
        )}
        {tab === 'newsletter' && (
          <>
            <div className="grid gap-4 sm:grid-cols-3"><Stat label="Subscribers" value="3 482" hint="+120 this month" /><Stat label="Issues sent" value="26" /><Stat label="Avg. open rate" value="38 %" /></div>
            <Table
              head={['Issue', 'Sent', 'Recipients', 'Status']}
              rows={[
                ['#26 · Autumn news', '12 Oct', '3 410', <Chip key="a" tone="green">Sent</Chip>],
                ['#27 · Year-end guide', '—', '3 482', <Chip key="b">Draft</Chip>],
              ]}
            />
          </>
        )}
        {tab === 'analytics' && (
          <>
            <div className="grid gap-4 sm:grid-cols-4"><Stat label="Sent" value="9 860" /><Stat label="Opens" value="41 %" /><Stat label="Clicks" value="9.2 %" /><Stat label="Unsubscribes" value="0.4 %" /></div>
            <Card>
              <p className="text-sm font-medium">Opens, last 7 sends</p>
              <div className="mt-4 flex h-40 items-end gap-3">
                {BARS.map((h, i) => <div key={i} className="flex-1 rounded-t-md bg-accent/70" style={{ height: `${h}%` }} />)}
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
