import { BookOpen, Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { PageHeader, Tabs, useTab, Chip, Table } from './kit'

const TABS = [
  { id: 'books', label: 'Book management' },
  { id: 'articles', label: 'Articles' },
  { id: 'newsletter', label: 'Newsletter management' },
]

export default function Resources() {
  const [tab, setTab] = useTab(TABS)
  const add = { books: 'New book', articles: 'New article', newsletter: 'New issue' }[tab]
  return (
    <>
      <PageHeader icon={BookOpen} section="Resources" title="Resources" lead="Books, articles and newsletters published for your audience." />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-6 space-y-6">
        <div className="flex justify-end"><Button size="sm" variant="accent" magnetic={false}><Plus className="h-4 w-4" /> {add}</Button></div>
        {tab === 'books' && (
          <Table head={['Title', 'Author', 'Status', 'Updated']} rows={[
            ['Guide du PV de CSE', 'ATOOPV', <Chip key="a" tone="green">Published</Chip>, '10 Oct'],
            ['Livre blanc — santé au travail', 'ATOOPV', <Chip key="b">Draft</Chip>, '02 Oct'],
          ]} />
        )}
        {tab === 'articles' && (
          <Table head={['Title', 'Category', 'Status', 'Updated']} rows={[
            ['Harcèlement moral et méthodes de gestion', 'Jurisprudence', <Chip key="a" tone="green">Published</Chip>, '12 Oct'],
            ['Télétravail imposé : droits du CSE', 'Jurisprudence', <Chip key="b" tone="green">Published</Chip>, '12 Oct'],
            ['Commissaire de justice et entrave', 'Pratique', <Chip key="c">Draft</Chip>, '09 Oct'],
          ]} />
        )}
        {tab === 'newsletter' && (
          <Table head={['Issue', 'Audience', 'Status', 'Scheduled']} rows={[
            ['#26 · Autumn news', 'All subscribers', <Chip key="a" tone="green">Sent</Chip>, '12 Oct'],
            ['#27 · Year-end guide', 'All subscribers', <Chip key="b" tone="amber">Scheduled</Chip>, '15 Nov'],
          ]} />
        )}
      </div>
    </>
  )
}
