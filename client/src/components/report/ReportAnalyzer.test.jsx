import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ReportAnalyzer from './ReportAnalyzer'
import { AllProviders } from '@/test/providers'

describe('ReportAnalyzer', () => {
  it('renders the analyzer sections with a prominent score and concise insights', () => {
    const report = {
      title: 'Growth Planning Review',
      subtitle: 'Strategy sync',
      metrics: { decisions: 7, commitments: 4, risks: 2, owners: 5 },
      dna: { aiConfidence: 88 },
      risks: [{ text: 'Budget approval pending', level: 'high' }],
    }

    render(<ReportAnalyzer report={report} />, { wrapper: AllProviders })

    expect(screen.getByText('Report Analyzer')).toBeInTheDocument()
    expect(screen.getByText('Overall Meeting Score')).toBeInTheDocument()
    expect(screen.getByText('Executive Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Strengths')).toBeInTheDocument()
    expect(screen.getByText('Risks')).toBeInTheDocument()
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })
})
