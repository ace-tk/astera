import { z } from 'zod'
import { env } from '../config/env.js'
import { sendMailStrict, MailError } from '../services/mailer.js'

/**
 * Public "Contact us / demande de démo" form -> an email to env.contactTo.
 * Nothing is persisted and nothing is faked: the response says "sent" only
 * after the configured mail provider actually accepted the message.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Strip control characters (incl. CR/LF, which would enable header injection
// if a value ever reached a header) and collapse whitespace for one-line fields.
// eslint-disable-next-line no-control-regex
const oneLine = (s) => s.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim()
// The free-text message keeps its line breaks and tabs but loses other control chars.
// eslint-disable-next-line no-control-regex
const multiLine = (s) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()

// A missing or non-string value gets the same French message as an empty one.
const required = (max, message) =>
  z.string({ required_error: message, invalid_type_error: message }).transform(oneLine).pipe(z.string().min(1, message).max(max, 'Texte trop long.'))
// Optional select-style fields: absent / empty is fine.
const optionalLine = (max) => z.string().optional().default('').transform(oneLine).pipe(z.string().max(max, 'Texte trop long.'))

// Messages are the same French strings the form shows client-side, so a server
// rejection reads exactly like a client one.
const contactSchema = z.object({
  firstName: required(80, 'Le prénom est requis.'),
  lastName: required(80, 'Le nom est requis.'),
  role: required(80, 'Sélectionnez votre fonction.'),
  company: required(160, "Le nom de l'entreprise est requis."),
  email: z
    .string({ required_error: "L'email professionnel est requis.", invalid_type_error: 'Format email invalide.' })
    .transform(oneLine)
    .pipe(
      z
        .string()
        .min(1, "L'email professionnel est requis.")
        .max(254, 'Format email invalide.')
        .refine((v) => EMAIL_RE.test(v), 'Format email invalide.'),
    ),
  phone: z
    .string({ required_error: 'Le téléphone est requis.', invalid_type_error: 'Numéro de téléphone invalide.' })
    .transform(oneLine)
    .pipe(
      z
        .string()
        .min(1, 'Le téléphone est requis.')
        .max(30, 'Numéro de téléphone invalide.')
        .refine((v) => /^[0-9+().\s-]+$/.test(v) && v.replace(/\D/g, '').length >= 8, 'Numéro de téléphone invalide.'),
    ),
  companySize: optionalLine(80),
  electedCount: optionalLine(80),
  meetingDuration: optionalLine(80),
  hasRecording: optionalLine(80),
  message: z
    .string()
    .optional()
    .default('')
    .transform(multiLine)
    .pipe(z.string().max(5000, 'Message trop long (5000 caractères maximum).')),
})

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const ROWS = [
  ['Prénom', 'firstName'],
  ['Nom', 'lastName'],
  ['Email', 'email'],
  ['Téléphone', 'phone'],
  ['Fonction au sein du CSE', 'role'],
  ['Entreprise', 'company'],
  ["Effectif de l'entreprise", 'companySize'],
  ["Nombre d'élus", 'electedCount'],
  ["Durée moyenne d'une réunion", 'meetingDuration'],
  ['Enregistrement disponible', 'hasRecording'],
]

function buildEmail(d) {
  const fullName = `${d.firstName} ${d.lastName}`
  const displayName = fullName.replace(/[",;:<>()\\[\]@]/g, '').trim()
  const rows = ROWS.filter(([, k]) => d[k])
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px">
    <h1 style="font-size:18px;margin:0 0 4px">Nouvelle demande de contact</h1>
    <p style="margin:0 0 16px;color:#555">Reçue via le formulaire de atoopv.com — répondez directement à ce message pour écrire à ${escapeHtml(fullName)}.</p>
    <table style="border-collapse:collapse;width:100%">
      ${rows
        .map(
          ([label, k]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#555;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0"><strong>${escapeHtml(d[k])}</strong></td></tr>`,
        )
        .join('')}
    </table>
    ${d.message ? `<h2 style="font-size:14px;margin:20px 0 6px">Message</h2><p style="white-space:pre-wrap;margin:0">${escapeHtml(d.message)}</p>` : ''}
  </div>`
  const text = [
    'Nouvelle demande de contact (formulaire atoopv.com)',
    '',
    ...rows.map(([label, k]) => `${label} : ${d[k]}`),
    ...(d.message ? ['', 'Message :', d.message] : []),
  ].join('\n')
  return {
    // Company/name are already single-line (control chars stripped) so this can't break the Subject header.
    subject: `[Contact ATOOPV] ${d.company} — ${fullName}`.slice(0, 200),
    html,
    text,
    // Name <email>, so replying goes straight to the visitor. Characters that are special in an
    // address header are dropped from the display name.
    replyTo: displayName ? `${displayName} <${d.email}>` : d.email,
  }
}

const UNAVAILABLE = {
  error: "L'envoi de votre demande est momentanément indisponible. Merci de réessayer plus tard ou de nous écrire directement à contact@atoopv.com.",
}

export async function submitContact(req, res) {
  const parsed = contactSchema.safeParse(req.body && typeof req.body === 'object' ? req.body : {})
  if (!parsed.success) {
    const fieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return res.status(400).json({ error: 'Veuillez corriger les champs signalés.', fieldErrors })
  }

  try {
    await sendMailStrict({ to: env.contactTo, ...buildEmail(parsed.data) })
  } catch (err) {
    // Log the cause server-side (no visitor data, no credentials); tell the visitor the truth.
    console.error(`[contact] delivery failed (${err instanceof MailError ? err.code : 'UNEXPECTED'}, provider=${env.mailProvider}): ${err.message}`)
    const unconfigured = err instanceof MailError && err.code === 'MAIL_UNAVAILABLE'
    return res.status(unconfigured ? 503 : 502).json({ ...UNAVAILABLE, code: unconfigured ? 'MAIL_UNAVAILABLE' : 'MAIL_FAILED' })
  }

  res.status(200).json({ ok: true })
}
