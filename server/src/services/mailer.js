import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

/**
 * Provider-agnostic mail delivery, chosen by env.mailProvider (see config/env.js):
 *   smtp   - any SMTP server (production on O2Switch: the cPanel mailbox)
 *   resend - the Resend HTTPS API (the original Vercel setup)
 *   log    - nothing is sent; the message is written to the server log
 * No credentials live in code or in the client - everything comes from env.
 */
const resend = env.mailProvider === 'resend' && env.resendApiKey ? new Resend(env.resendApiKey) : null

let smtpTransport = null
function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      tls: { rejectUnauthorized: env.smtpRejectUnauthorized },
      // Fail fast: a request must not hang on an unreachable mail server.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  }
  return smtpTransport
}

/** True when a real provider (not 'log') is configured well enough to attempt delivery. */
export function mailConfigured() {
  if (env.mailProvider === 'smtp') return Boolean(env.smtpHost)
  if (env.mailProvider === 'resend') return Boolean(resend)
  return false
}

/** Deliver one message through the configured provider. Throws on any failure. */
async function deliver({ to, subject, html, text, replyTo }) {
  if (env.mailProvider === 'smtp') {
    await getSmtpTransport().sendMail({ from: env.mailFrom, to, subject, html, text, replyTo })
    return
  }
  // The Resend SDK reports API failures as `{ data: null, error }` instead of throwing.
  const { error } = await resend.emails.send({ from: env.mailFrom, to, subject, html, text, replyTo })
  if (error) throw new Error(error.message || 'Resend rejected the message')
}

/** Error thrown by sendMailStrict; `code` says why so callers can respond accurately. */
export class MailError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'MailError'
    this.code = code // 'MAIL_UNAVAILABLE' (not configured) | 'MAIL_FAILED' (provider error)
  }
}

/**
 * Send an email, or log it if no provider is configured. Never throws - for
 * flows (signup, admin invitations) that must not fail just because mail did.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!mailConfigured()) {
    console.log(`[mailer] no mail provider configured - logging instead of sending.\n  to: ${to}\n  subject: ${subject}`)
    return
  }
  try {
    await deliver({ to, subject, html, text, replyTo })
  } catch (err) {
    console.error('[mailer] send failed:', err.message)
  }
}

/**
 * Send an email and REPORT the outcome: throws MailError if no provider is
 * configured or delivery fails. For flows where the sender must be told the
 * truth (the public Contact form) - it never pretends a message was sent.
 */
export async function sendMailStrict({ to, subject, html, text, replyTo }) {
  if (!mailConfigured()) throw new MailError('MAIL_UNAVAILABLE', `Mail provider "${env.mailProvider}" is not configured`)
  try {
    await deliver({ to, subject, html, text, replyTo })
  } catch (err) {
    throw new MailError('MAIL_FAILED', err.message)
  }
}

const wrap = (title, bodyHtml, ctaLabel, ctaUrl) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
    ${bodyHtml}
    ${ctaUrl ? `<p style="margin:24px 0"><a href="${ctaUrl}" style="background:#365DF5;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">${ctaLabel}</a></p><p style="color:#888;font-size:13px">Or paste this link into your browser: ${ctaUrl}</p>` : ''}
  </div>
`

export function verificationEmail(link) {
  return {
    subject: 'Verify your Astera account',
    html: wrap(
      'Confirm your email',
      '<p>Thanks for signing up for Astera. Click below to verify your email and activate your account.</p>',
      'Verify email',
      link,
    ),
  }
}

export function invitationEmail({ email, tempPassword, loginUrl }) {
  return {
    subject: 'Your Astera account is ready',
    html: wrap(
      'You’ve been invited to Astera',
      `<p>An admin created an account for you.</p>
       <p><strong>Email:</strong> ${email}<br/><strong>Temporary password:</strong> ${tempPassword}</p>
       <p>Please sign in and change your password from your profile.</p>`,
      'Sign in',
      loginUrl,
    ),
  }
}

export function passwordResetEmail(tempPassword) {
  return {
    subject: 'Your Astera password was reset',
    html: wrap(
      'Password reset',
      `<p>An admin reset your password. Your new temporary password is:</p>
       <p style="font-size:18px;font-weight:600">${tempPassword}</p>
       <p>Please sign in and change it from your profile.</p>`,
    ),
  }
}
