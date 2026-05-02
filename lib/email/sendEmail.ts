/**
 * Thin wrapper around the Resend client.
 * Use this instead of calling resend.emails.send() directly so that all
 * transactional emails go through a single point and can be extended with
 * logging, retries, or provider swaps later.
 */
import { getResendClient, FROM } from './resendClient'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  /** Override the default FROM address. */
  from?: string
  /** Email type used for admin email log (e.g. 'job_accepted'). */
  type?: string
}

/**
 * Send a transactional email via Resend.
 * Silently no-ops when RESEND_API_KEY is not configured so that local dev
 * and CI environments never hard-crash on missing credentials.
 * Also writes a log entry to Firestore `emailLogs` collection for the admin dashboard.
 */
export async function sendEmail({ to, subject, html, from, type }: SendEmailOptions): Promise<void> {
  const resend = getResendClient()
  let status = 'sent'
  if (resend) {
    try {
      await resend.emails.send({ from: from ?? FROM, to, subject, html })
    } catch (err) {
      console.error('[sendEmail] Resend delivery failed:', err)
      status = 'failed'
    }
  } else {
    // API key not configured — email skipped (no-op in dev/CI)
    status = 'skipped'
  }

  // Write log to Firestore asynchronously (non-blocking)
  try {
    const { adminDb } = await import('@/lib/firebase-admin')
    await adminDb.collection('emailLogs').add({
      recipient: to,
      type: type ?? 'transactional',
      subject,
      status,
      sentAt: new Date().toISOString(),
    })
  } catch {
    // Log write failures are silent — email delivery is not affected
  }
}
