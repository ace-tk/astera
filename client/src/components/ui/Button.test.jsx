import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from 'react-router-dom'
import { AllProviders } from '@/test/providers'
import Button from './Button'

describe('Button', () => {
  it('renders its children as a native button by default', () => {
    render(<Button>Generate report</Button>, { wrapper: AllProviders })
    const btn = screen.getByRole('button', { name: /generate report/i })
    expect(btn.tagName).toBe('BUTTON')
  })

  it('renders correctly as a router Link (regression: the motion[as] fix)', () => {
    render(
      <Button as={Link} to="/app/reports">
        Open reports
      </Button>,
      { wrapper: AllProviders },
    )
    const link = screen.getByRole('link', { name: /open reports/i })
    expect(link).toHaveAttribute('href', '/app/reports')
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Tap</Button>, { wrapper: AllProviders })
    await userEvent.click(screen.getByRole('button', { name: /tap/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
