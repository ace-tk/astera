import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, FileEdit } from 'lucide-react'
import Button from '@/components/ui/Button'
import { REPORT_TYPES, DELIVERY_MODES } from '@/constants/reportRequests'
import { categoryIcon } from '@/utils/reportCategory'
import { cn } from '@/utils/cn'

const emptyItem = () => ({ text: '', owner: '', due: '', at: '' })

/**
 * The admin's structured report-authoring form — used both to create a
 * report from a Report Request and to keep editing an admin-authored report
 * afterward. Deliberately separate from ReviewMode (the customer-facing edit
 * drawer): these fields are admin-only and don't belong in that surface.
 */
export default function ReportComposer({ initial, onSaveDraft, onPublish, saving = false }) {
  const [title, setTitle] = useState('')
  const [reportType, setReportType] = useState(REPORT_TYPES[0])
  const [meetingType, setMeetingType] = useState('')
  const [clientOrg, setClientOrg] = useState('')
  const [meetingOwner, setMeetingOwner] = useState('')
  const [duration, setDuration] = useState('')
  const [language, setLanguage] = useState('')
  const [deliveryMode, setDeliveryMode] = useState(DELIVERY_MODES[0])
  const [headline, setHeadline] = useState('')
  const [commitments, setCommitments] = useState([])
  const [decisions, setDecisions] = useState([])
  const [complianceNotes, setComplianceNotes] = useState('')
  const [riskNotes, setRiskNotes] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [reportContent, setReportContent] = useState('')

  useEffect(() => {
    if (!initial) return
    setTitle(initial.title || '')
    setReportType(initial.reportType || REPORT_TYPES[0])
    setMeetingType(initial.meetingType || '')
    setClientOrg(initial.clientOrg || '')
    setMeetingOwner(initial.meetingOwner || '')
    setDuration(initial.duration || '')
    setLanguage(initial.language || '')
    setDeliveryMode(initial.deliveryMode || DELIVERY_MODES[0])
    setHeadline(initial.headline || '')
    setCommitments(initial.commitments?.length ? initial.commitments.map((c) => ({ ...c })) : [])
    setDecisions(initial.decisions?.length ? initial.decisions.map((d) => ({ ...d })) : [])
    setComplianceNotes(initial.complianceNotes || '')
    setRiskNotes(initial.riskNotes || '')
    setTagsInput((initial.tags || []).join(', '))
    setReportContent(initial.reportContent || '')
  }, [initial])

  const buildPayload = () => ({
    title,
    reportType,
    meetingType: meetingType || undefined,
    clientOrg: clientOrg || undefined,
    meetingOwner: meetingOwner || undefined,
    duration: duration || undefined,
    language: language || undefined,
    deliveryMode,
    headline: headline || undefined,
    commitments: commitments.filter((c) => c.text.trim()),
    decisions: decisions.filter((d) => d.text.trim()),
    complianceNotes: complianceNotes || undefined,
    riskNotes: riskNotes || undefined,
    tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    reportContent: reportContent || undefined,
  })

  const canSave = title.trim().length > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Report title" className="sm:col-span-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Q4 Board Sync — Official Minutes" />
        </Field>
        <Field label="Report category">
          <div className="relative">
            {categoryIcon(reportType) && (
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                {(() => { const Icon = categoryIcon(reportType).icon; return <Icon className="h-4 w-4" /> })()}
              </span>
            )}
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={cn('input', categoryIcon(reportType) && 'pl-10')}>
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </Field>
        <Field label="Delivery mode">
          <select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} className="input">
            {DELIVERY_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Meeting type">
          <input value={meetingType} onChange={(e) => setMeetingType(e.target.value)} className="input" placeholder="e.g. Board meeting" />
        </Field>
        <Field label="Client / Organization">
          <input value={clientOrg} onChange={(e) => setClientOrg(e.target.value)} className="input" placeholder="e.g. Northwind Inc." />
        </Field>
        <Field label="Meeting owner">
          <input value={meetingOwner} onChange={(e) => setMeetingOwner(e.target.value)} className="input" placeholder="e.g. Maya Okafor" />
        </Field>
        <Field label="Duration">
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className="input" placeholder="e.g. 45:00" />
        </Field>
        <Field label="Language" className="sm:col-span-2">
          <input value={language} onChange={(e) => setLanguage(e.target.value)} className="input" placeholder="e.g. French" />
        </Field>
      </div>

      <Field label="Summary">
        <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={4} className="input resize-none leading-relaxed" placeholder="Executive summary of the meeting…" />
      </Field>

      <ItemList label="Key decisions" items={decisions} setItems={setDecisions} fields={['text', 'owner', 'at']} placeholders={{ text: 'What was decided?', owner: 'Owner', at: 'Timestamp' }} />
      <ItemList label="Action items" items={commitments} setItems={setCommitments} fields={['text', 'owner', 'due']} placeholders={{ text: 'What needs to happen?', owner: 'Owner', due: 'Due' }} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Compliance notes">
          <textarea value={complianceNotes} onChange={(e) => setComplianceNotes(e.target.value)} rows={3} className="input resize-none" placeholder="Regulatory/compliance observations…" />
        </Field>
        <Field label="Risk notes">
          <textarea value={riskNotes} onChange={(e) => setRiskNotes(e.target.value)} rows={3} className="input resize-none" placeholder="Risks flagged during the meeting…" />
        </Field>
      </div>

      <Field label="Tags">
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input" placeholder="comma, separated, tags" />
      </Field>

      <Field label="Report content">
        <textarea value={reportContent} onChange={(e) => setReportContent(e.target.value)} rows={8} className="input resize-none leading-relaxed" placeholder="The full authored report body…" />
      </Field>

      <div className="flex flex-wrap justify-end gap-2 border-t border-ink/8 pt-5">
        <Button variant="soft" size="sm" magnetic={false} disabled={!canSave || saving} onClick={() => onSaveDraft(buildPayload())}>
          <FileEdit className="h-4 w-4" /> Save Draft
        </Button>
        <Button variant="accent" size="sm" magnetic={false} disabled={!canSave || saving} onClick={() => onPublish(buildPayload())}>
          <Check className="h-4 w-4" /> Publish Report
        </Button>
      </div>
    </div>
  )
}

function ItemList({ label, items, setItems, fields, placeholders }) {
  const update = (i, patch) => setItems((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const remove = (i) => setItems((a) => a.filter((_, j) => j !== i))
  const add = () => setItems((a) => [...a, emptyItem()])

  return (
    <Field label={label}>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-ink/8 bg-paper p-3">
            <div className="flex items-start gap-2">
              <input
                value={item[fields[0]] || ''}
                onChange={(e) => update(i, { [fields[0]]: e.target.value })}
                placeholder={placeholders[fields[0]]}
                className="input-bare flex-1 font-medium"
              />
              <button onClick={() => remove(i)} className="mt-1 text-muted hover:text-rose" aria-label={`Remove ${label.toLowerCase()}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              {fields.slice(1).map((f) => (
                <input
                  key={f}
                  value={item[f] || ''}
                  onChange={(e) => update(i, { [f]: e.target.value })}
                  placeholder={placeholders[f]}
                  className="input-bare w-1/2 text-xs text-muted"
                />
              ))}
            </div>
          </div>
        ))}
        <button onClick={add} className="inline-flex items-center gap-1.5 text-sm font-medium text-royal hover:underline">
          <Plus className="h-4 w-4" /> Add {label.toLowerCase().replace(/s$/, '')}
        </button>
      </div>
    </Field>
  )
}

function Field({ label, children, className }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  )
}
