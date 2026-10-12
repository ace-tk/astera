// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link } from 'react-router-dom'
import { useConsentTracking } from './useConsentTracking'

function Probe() {
  useConsentTracking()
  return (
    <div>
      <a href="tel:+33412100606">04 12 10 06 06</a>
      <a href="TEL:+33412100607"><span>upper</span></a>
      <a href="mailto:contact@atoopv.com">mail</a>
      <Link to="/app">go private</Link>
    </div>
  )
}
const renderAt = (path = '/') => render(<MemoryRouter initialEntries={[path]}><Probe /></MemoryRouter>)

afterEach(() => { delete window.gtag; delete window.getCkyConsent; document.documentElement.removeAttribute('data-consent-ui') })

describe('useConsentTracking', () => {
  it('reports a click on any tel: link (also on a child element, any case) once advertising is accepted', async () => {
    window.gtag = vi.fn()
    window.getCkyConsent = () => ({ categories: { advertisement: true } })
    renderAt()
    await userEvent.click(screen.getByText('04 12 10 06 06'))
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', { send_to: 'AW-823981254/3apWCODU9pcdEMbp84gD' })
    await userEvent.click(screen.getByText('upper'))
    expect(window.gtag).toHaveBeenCalledTimes(2)
  })

  it('ignores mailto:/other links, and sends nothing without consent', async () => {
    window.gtag = vi.fn()
    window.getCkyConsent = () => ({ categories: { advertisement: false } })
    renderAt()
    await userEvent.click(screen.getByText('04 12 10 06 06'))
    await userEvent.click(screen.getByText('mail'))
    expect(window.gtag).not.toHaveBeenCalled()
  })

  it('hides the consent UI on private routes and shows it again on the public site', async () => {
    renderAt('/')
    expect(document.documentElement.hasAttribute('data-consent-ui')).toBe(false)
    await userEvent.click(screen.getByText('go private'))
    expect(document.documentElement.getAttribute('data-consent-ui')).toBe('off')
  })
})
