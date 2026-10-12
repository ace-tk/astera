/**
 * Cookie consent + Google Ads conversions (CookieYes, Google Consent Mode v2 "Basic").
 *
 * The consent banner and the Google tags are loaded by the scripts at the top of index.html. This
 * module is the only place the React code talks to them:
 *   - openCookieSettings()   reopens CookieYes' preference centre (footer "Gérer les cookies" link);
 *   - hasAdvertisingConsent() true only when the visitor has accepted the "advertisement" category;
 *   - trackAdsConversion()   sends a Google Ads conversion — and only with that consent.
 *
 * Conversion IDs/labels come from the client's Google Ads account. Do not change them.
 */
export const ADS_ACCOUNT = 'AW-823981254'
export const ADS_CONVERSIONS = {
  /** a click on any tel: link */
  phoneClick: `${ADS_ACCOUNT}/3apWCODU9pcdEMbp84gD`,
  /** the /contact form, once the API has confirmed the request */
  quoteRequest: `${ADS_ACCOUNT}/whezCN3U9pcdEMbp84gD`,
}

/** The client area, the back office and the auth screens: no consent UI there. */
export const PRIVATE_AREAS = ['/app', '/login', '/register', '/forgot', '/verify-email']
export const isPrivatePath = (pathname) => PRIVATE_AREAS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

/** CookieYes' view of the visitor's choice, or null while the banner script is not available. */
function consentState() {
  try {
    return typeof window.getCkyConsent === 'function' ? window.getCkyConsent() : null
  } catch {
    return null
  }
}

/**
 * True only when the visitor has actually accepted advertising cookies. Unknown (script blocked,
 * not loaded yet, no choice made) is "no": a conversion is never sent on a guess.
 */
export function hasAdvertisingConsent() {
  return consentState()?.categories?.advertisement === true
}

/** Opens CookieYes' preference centre. Returns false when the banner script is not available. */
export function openCookieSettings() {
  if (typeof window.revisitCkyConsent !== 'function') return false
  window.revisitCkyConsent()
  return true
}

/**
 * Sends one Google Ads conversion — only if the visitor accepted advertising cookies. Nothing is
 * queued otherwise: a click made before consent must not be replayed once gtag.js loads later.
 */
export function trackAdsConversion(sendTo) {
  if (!hasAdvertisingConsent() || typeof window.gtag !== 'function') return false
  window.gtag('event', 'conversion', { send_to: sendTo })
  return true
}

/** Label of the footer link / button that reopens the preferences (client's wording: "Gérer les cookies"). */
export const MANAGE_COOKIES_LABEL = 'Gérer les cookies'
