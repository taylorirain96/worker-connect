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
}

/**
 * Send a transactional email via Resend.
 * Silently no-ops when RESEND_API_KEY is not configured so that local dev
 * and CI environments never hard-crash on missing credentials.
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  const resend = getResendClient()
  if (!resend) return
  await resend.emails.send({ from: from ?? FROM, to, subject, html })
}
