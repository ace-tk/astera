import { Resend } from 'resend'
import { env } from '../config/env.js'

// Falls back to logging the email instead of sending when RESEND_API_KEY isn't
// configured — signup/admin actions never fail or block just because email
// delivery isn't wired up yet. Swap in real delivery by setting the env var.
const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null

/** Send an email, or log it if no provider is configured. Never throws. */
export async function sendMail({ to, subject, html }) {
  if (!resend) {
    console.log(`[mailer] RESEND_API_KEY not set — logging instead of sending.\n  to: ${to}\n  subject: ${subject}\n  ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`)
    return
  }
  try {
    await resend.emails.send({ from: env.mailFrom, to, subject, html })
  } catch (err) {
    console.error('[mailer] send failed:', err.message)
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
