/**
 * Parses the `*emphasis*` convention used throughout the service content data
 * (mirrors the emphasis markers already present in the source markdown) into
 * alternating plain / accented spans.
 */
export function renderEmphasis(text, accentClass = 'text-accent') {
  const parts = text.split(/\*(.+?)\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <em key={i} className={`${accentClass} not-italic`}>
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/** Strips the `*emphasis*` markers for contexts that need plain text — document titles, meta descriptions. */
export function stripEmphasis(text) {
  return text.replace(/\*/g, '')
}
