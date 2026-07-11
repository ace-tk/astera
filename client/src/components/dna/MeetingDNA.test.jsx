import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@/context/ThemeContext'
import MeetingDNA from './MeetingDNA'

const dna = { decisionDriven: 82, collaboration: 74, conflict: 18, energy: 76, energyLabel: 'High', compliance: 91, aiConfidence: 95 }
const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>

describe('MeetingDNA', () => {
  it('renders an SVG fingerprint polygon with six vertices', () => {
    const { container } = render(<MeetingDNA dna={dna} color="royal" animate={false} />, { wrapper })
    const polygon = container.querySelector('svg polygon[fill^="url"]')
    expect(polygon).toBeTruthy()
    // six trait vertices
    expect(container.querySelectorAll('svg circle[stroke="white"]').length).toBe(6)
  })

  it('renders the trait labels when showLabels is on', () => {
    const { getByText } = render(<MeetingDNA dna={dna} showLabels animate={false} />, { wrapper })
    expect(getByText('Decision Driven')).toBeInTheDocument()
    expect(getByText('High')).toBeInTheDocument() // the energy label
  })
})
