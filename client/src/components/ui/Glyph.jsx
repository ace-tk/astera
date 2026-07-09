/**
 * Hand-drawn abstract SVG illustrations — one per feature concept. They use
 * `currentColor` so they inherit the feature accent, and stay geometric and
 * editorial rather than skeuomorphic stock art.
 */
const paths = {
  report: (
    <>
      <rect x="10" y="8" width="30" height="40" rx="4" fill="currentColor" opacity="0.12" />
      <rect x="16" y="6" width="30" height="40" rx="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M22 16h18M22 24h18M22 32h11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="41" cy="38" r="4" fill="currentColor" />
    </>
  ),
  brain: (
    <>
      <path d="M28 8c-7 0-12 5-12 11 0 3 1 5 3 7-2 2-3 4-3 7 0 6 5 11 12 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M28 8c7 0 12 5 12 11 0 3-1 5-3 7 2 2 3 4 3 7 0 6-5 11-12 11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
      <circle cx="24" cy="20" r="2.4" fill="currentColor" />
      <circle cx="32" cy="30" r="2.4" fill="currentColor" />
      <circle cx="23" cy="38" r="2.4" fill="currentColor" />
      <path d="M24 20l8 10-9 8" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </>
  ),
  timeline: (
    <>
      <path d="M10 28h36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
      <circle cx="14" cy="28" r="4" fill="currentColor" />
      <circle cx="28" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="28" cy="28" r="2" fill="currentColor" />
      <circle cx="44" cy="28" r="4" fill="currentColor" opacity="0.5" />
      <path d="M14 40v-6M28 44v-8M44 38v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </>
  ),
  shield: (
    <>
      <path d="M28 6l16 6v12c0 12-8 20-16 24-8-4-16-12-16-24V12z" fill="currentColor" opacity="0.12" />
      <path d="M28 6l16 6v12c0 12-8 20-16 24-8-4-16-12-16-24V12z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M21 27l5 5 10-11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  alert: (
    <>
      <path d="M28 8l20 34H8z" fill="currentColor" opacity="0.12" />
      <path d="M28 8l20 34H8z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 22v9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="28" cy="37" r="1.8" fill="currentColor" />
    </>
  ),
  chart: (
    <>
      <path d="M10 46V10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
      <path d="M10 46h36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
      <rect x="16" y="30" width="6" height="12" rx="2" fill="currentColor" opacity="0.5" />
      <rect x="26" y="22" width="6" height="20" rx="2" fill="currentColor" opacity="0.75" />
      <rect x="36" y="14" width="6" height="28" rx="2" fill="currentColor" />
      <path d="M16 26l10-8 12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  upload: (
    <>
      <rect x="8" y="30" width="40" height="16" rx="6" fill="currentColor" opacity="0.1" />
      <path d="M28 38V10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 20l10-10 10 10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 40h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
    </>
  ),
  mic: (
    <>
      <rect x="22" y="8" width="12" height="22" rx="6" fill="currentColor" opacity="0.14" />
      <rect x="22" y="8" width="12" height="22" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 26c0 6.6 5.4 12 12 12s12-5.4 12-12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M28 38v8M22 46h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  text: (
    <>
      <path d="M12 14h32M12 22h32M12 30h24M12 38h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="40" cy="30" r="3" fill="currentColor" />
    </>
  ),
  send: (
    <>
      <path d="M46 8L6 24l16 4 4 16z" fill="currentColor" opacity="0.12" />
      <path d="M46 8L6 24l16 4 4 16 20-32z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 28L46 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
}

export default function Glyph({ name = 'report', size = 56, className, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden {...props}>
      {paths[name] || paths.report}
    </svg>
  )
}
