import { MANAGE_COOKIES_LABEL, openCookieSettings } from '@/utils/consent'

/**
 * "Gérer les cookies" — reopens the CookieYes preference centre so a visitor can change or withdraw
 * their choice at any time. If the banner script is not available (blocked by the browser, offline),
 * it falls back to the cookie policy page instead of doing nothing.
 */
export default function ManageCookiesButton({ className = '', children = MANAGE_COOKIES_LABEL }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!openCookieSettings()) window.location.assign('/cookies')
      }}
      className={className}
    >
      {children}
    </button>
  )
}
