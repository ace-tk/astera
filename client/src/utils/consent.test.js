import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ADS_ACCOUNT, ADS_CONVERSIONS, MANAGE_COOKIES_LABEL, hasAdvertisingConsent, isPrivatePath, openCookieSettings, trackAdsConversion } from './consent'

const setCookieYes = (state) => { window.getCkyConsent = () => state }
afterEach(() => { delete window.getCkyConsent; delete window.revisitCkyConsent; delete window.gtag })

describe('consent — the client\'s Google Ads identifiers (must never change)', () => {
  it('uses the exact account and conversion labels the client created in Google Ads', () => {
    expect(ADS_ACCOUNT).toBe('AW-823981254')
    expect(ADS_CONVERSIONS.phoneClick).toBe('AW-823981254/3apWCODU9pcdEMbp84gD')
    expect(ADS_CONVERSIONS.quoteRequest).toBe('AW-823981254/whezCN3U9pcdEMbp84gD')
  })
  it('the footer link says "Gérer les cookies"', () => {
    expect(MANAGE_COOKIES_LABEL).toBe('Gérer les cookies')
  })
})

describe('hasAdvertisingConsent', () => {
  it('is false when CookieYes is not available (blocked / not loaded yet) — unknown means no', () => {
    expect(hasAdvertisingConsent()).toBe(false)
  })
  it('is false until the advertisement category is accepted, true once it is', () => {
    setCookieYes({ categories: { necessary: true, advertisement: false } })
    expect(hasAdvertisingConsent()).toBe(false)
    setCookieYes({ categories: { necessary: true, advertisement: true } })
    expect(hasAdvertisingConsent()).toBe(true)
  })
  it('never throws when the CookieYes API misbehaves', () => {
    window.getCkyConsent = () => { throw new Error('boom') }
    expect(hasAdvertisingConsent()).toBe(false)
  })
})

describe('trackAdsConversion', () => {
  beforeEach(() => { window.gtag = vi.fn() })

  it('sends the conversion with the given label when advertising cookies are accepted', () => {
    setCookieYes({ categories: { advertisement: true } })
    expect(trackAdsConversion(ADS_CONVERSIONS.phoneClick)).toBe(true)
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', { send_to: 'AW-823981254/3apWCODU9pcdEMbp84gD' })
  })
  it('sends NOTHING without consent — and does not queue anything for later', () => {
    setCookieYes({ categories: { advertisement: false } })
    expect(trackAdsConversion(ADS_CONVERSIONS.quoteRequest)).toBe(false)
    expect(window.gtag).not.toHaveBeenCalled()
  })
  it('does nothing when gtag itself is missing', () => {
    delete window.gtag
    setCookieYes({ categories: { advertisement: true } })
    expect(trackAdsConversion(ADS_CONVERSIONS.quoteRequest)).toBe(false)
  })
})

describe('openCookieSettings', () => {
  it('reopens the CookieYes preference centre', () => {
    window.revisitCkyConsent = vi.fn()
    expect(openCookieSettings()).toBe(true)
    expect(window.revisitCkyConsent).toHaveBeenCalledOnce()
  })
  it('reports false when the banner script is not available', () => {
    expect(openCookieSettings()).toBe(false)
  })
})

describe('isPrivatePath — where the consent UI stays hidden', () => {
  it('flags the client area, back office and auth screens, not the public site', () => {
    for (const p of ['/app', '/app/admin/cms/pages', '/login', '/register', '/forgot', '/verify-email']) expect(isPrivatePath(p), p).toBe(true)
    for (const p of ['/', '/cookies', '/tarification', '/contact', '/services/drafting/redaction-pv-cse', '/application-pv', '/blog/x']) expect(isPrivatePath(p), p).toBe(false)
  })
})
