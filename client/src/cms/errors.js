/** A readable message for an API error, including per-field validation problems. */
export function describeError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.data
  const parts = []
  if (data?.error) parts.push(data.error)
  const fields = data?.issues?.fieldErrors
  if (fields) for (const [k, msgs] of Object.entries(fields)) parts.push(...msgs.map((m) => `${k}: ${m}`))
  if (data?.issues?.formErrors?.length) parts.push(...data.issues.formErrors)
  return parts.length ? [...new Set(parts)].join(' — ') : err?.message || fallback
}

export const isConflict = (err) => err?.status === 409 && err?.data?.code === 'REV_CONFLICT'
