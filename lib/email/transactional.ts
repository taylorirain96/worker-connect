/**
 * Transactional email helpers for key platform events.
 * Sends via Resend using the RESEND_API_KEY environment variable.
 *
 * Emails:
 *   sendJobAcceptedEmail    — sent to worker when their quote is accepted
 *   sendPaymentReleasedEmail — sent to worker when escrow payment is released
 *   sendQuoteReceivedEmail  — sent to homeowner when a worker submits a quote
 */
import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'QuickTrade <hello@quicktrade.co.nz>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY)
}

// ─── Shared HTML helpers ──────────────────────────────────────────────────────

function emailWrapper(body: string): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:28px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
      </div>
      ${body}
      <p style="color:#475569;font-size:12px;text-align:center;margin:32px 0 0;">Questions? Email us at <a href="mailto:hello@quicktrade.co.nz" style="color:#6366f1;">hello@quicktrade.co.nz</a></p>
    </div>
  `
}

function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:28px 0;">
      <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">${label}</a>
    </div>
  `
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:#94a3b8;font-size:14px;width:40%;">${label}</td>
      <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${value}</td>
    </tr>
  `
}

function infoTable(rows: string): string {
  return `
    <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px 24px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>
  `
}

function formatNzd(amount: number): string {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount)
}

// ─── Email 1: Job Accepted ────────────────────────────────────────────────────

/**
 * Sent to the worker when the homeowner accepts their quote.
 */
export async function sendJobAcceptedEmail(opts: {
  workerEmail: string
  workerName: string
  jobTitle: string
  amount: number
  jobId: string
}): Promise<void> {
  const { workerEmail, workerName, jobTitle, amount, jobId } = opts
  const jobUrl = `${APP_URL}/jobs/${jobId}`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Your quote's been accepted! 🎉</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Great news, ${workerName} — a homeowner has accepted your quote. Get in touch with them to confirm a start date and get stuck in.</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Quote value', formatNzd(amount))}
    `)}
    ${ctaButton(jobUrl, 'View Job Details →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Payment is held securely in escrow and will be released once the job is completed.</p>
  `)

  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `Your quote was accepted — ${jobTitle}`,
    html,
  })
}

// ─── Email 2: Payment Released ────────────────────────────────────────────────

/**
 * Sent to the worker when the escrow payment is released to them.
 */
export async function sendPaymentReleasedEmail(opts: {
  workerEmail: string
  workerName: string
  jobTitle: string
  grossAmount: number
  commissionAmount: number
  workerAmount: number
  jobId: string
}): Promise<void> {
  const { workerEmail, workerName, jobTitle, grossAmount, commissionAmount, workerAmount, jobId } = opts
  const earningsUrl = `${APP_URL}/dashboard/worker`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Payment on its way! 💸</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Ka pai, ${workerName}! The payment for your completed job has been released from escrow. Here's your breakdown:</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Job total', formatNzd(grossAmount))}
      ${infoRow('QuickTrade fee', `−${formatNzd(commissionAmount)}`)}
      ${infoRow('Your payout', formatNzd(workerAmount))}
    `)}
    ${ctaButton(earningsUrl, 'View Your Earnings →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Funds will appear in your account within 2–3 business days depending on your bank.</p>
  `)

  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `Payment released — ${formatNzd(workerAmount)} for ${jobTitle}`,
    html,
  })
}

// ─── Email 3: Quote Received ──────────────────────────────────────────────────

/**
 * Sent to the homeowner when a worker submits a quote on their job.
 */
export async function sendQuoteReceivedEmail(opts: {
  homeownerEmail: string
  homeownerName: string
  workerName: string
  jobTitle: string
  amount: number
  jobId: string
}): Promise<void> {
  const { homeownerEmail, homeownerName, workerName, jobTitle, amount, jobId } = opts
  const jobUrl = `${APP_URL}/jobs/${jobId}`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">You've received a new quote 📋</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${homeownerName}, <strong style="color:#e2e8f0;">${workerName}</strong> has submitted a quote for your job. Review it and accept when you're ready — payment is only held once you confirm.</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Worker', workerName)}
      ${infoRow('Quote amount', formatNzd(amount))}
    `)}
    ${ctaButton(jobUrl, 'Review Quote →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Not the right fit? You can review all quotes and compare workers on the job page.</p>
  `)

  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `New quote from ${workerName} — ${jobTitle}`,
    html,
  })
}
