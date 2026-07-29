// Mirrors the regexes in server/src/controllers/authController.js /
// customerController.js so client-side errors match what the server would say.
export const LINKEDIN_RE = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i
export const PHONE_RE = /^\+[1-9]\d{7,14}$/
export const VAT_RE = /^[A-Za-z0-9\s-]{4,20}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates the shared company/personal profile fields. Returns {field: message}. */
export function validateProfileFields(f) {
  const errors = {}
  if (!f.companyName?.trim()) errors.companyName = 'Company name is required.'
  if (!f.vatNumber?.trim() || !VAT_RE.test(f.vatNumber.trim())) errors.vatNumber = 'Enter a valid VAT number.'
  if (!f.country) errors.country = 'Select a country.'
  if (!f.firstName?.trim()) errors.firstName = 'First name is required.'
  if (!f.lastName?.trim()) errors.lastName = 'Last name is required.'
  if (!f.phone?.trim() || !PHONE_RE.test(f.phone.trim())) errors.phone = 'Enter a valid phone number with country code, e.g. +14155550123.'
  if (!f.linkedinUrl?.trim() || !LINKEDIN_RE.test(f.linkedinUrl.trim())) errors.linkedinUrl = 'Enter a valid LinkedIn profile URL.'
  return errors
}
