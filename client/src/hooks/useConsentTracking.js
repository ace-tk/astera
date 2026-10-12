import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ADS_CONVERSIONS, isPrivatePath, trackAdsConversion } from '@/utils/consent'

/**
 * Mounted once (App.jsx).
 *  1. Phone conversions: one delegated listener reports a click on ANY tel: link on the site — the
 *     footer, the pages' CMS content, buttons — without wiring each one.
 *  2. Private areas (client area, back office, login…): the CookieYes banner and floating button are
 *     hidden (CSS keyed on html[data-consent-ui="off"], see globals.css). The banner is for the
 *     public website; the script itself is shared by the whole app, so this follows route changes.
 */
export function useConsentTracking() {
  const { pathname } = useLocation()

  useEffect(() => {
    const onClick = (e) => {
      const link = e.target instanceof Element ? e.target.closest('a[href^="tel:" i]') : null
      if (link) trackAdsConversion(ADS_CONVERSIONS.phoneClick)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isPrivatePath(pathname)) root.setAttribute('data-consent-ui', 'off')
    else root.removeAttribute('data-consent-ui')
  }, [pathname])
}
