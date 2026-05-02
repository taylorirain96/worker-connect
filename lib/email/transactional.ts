/**
 * Transactional email helpers for key platform events.
 * Sends via Resend using the RESEND_API_KEY environment variable.
 *
 * Emails:
 *   sendJobAcceptedEmail       — sent to worker when their quote is accepted
 *   sendPaymentReleasedEmail   — sent to worker when escrow payment is released
 *   sendQuoteReceivedEmail     — sent to homeowner when a worker submits a quote
 *   sendMessageReceivedEmail   — sent to recipient when they receive a message (30+ min inactive)
 *   sendApplicationUpdateEmail — sent to jobseeker when employer views/updates their application
 *   sendReviewReceivedEmail    — sent to user when they receive a new review
 *   sendJobMatchesEmail        — sent to workers when a new job matches their trade/location
 */
import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'QuickTrade <hello@quicktrade.co.nz>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'

// Lazy singleton — avoids creating a new Resend instance on every call
let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set — transactional emails will not be sent')
    return null
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
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

const nzdFormatter = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' })

function formatNzd(amount: number): string {
  return nzdFormatter.format(amount)
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
  if (!resend) return
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
  if (!resend) return
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
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `New quote from ${workerName} — ${jobTitle}`,
    html,
  })
}

// ─── Email 4: Message Received ────────────────────────────────────────────────

/**
 * Sent to a user when they receive a message and haven't been active for 30+ minutes.
 */
export async function sendMessageReceivedEmail(opts: {
  recipientEmail: string
  recipientName: string
  senderName: string
  messagePreview: string
  conversationId: string
}): Promise<void> {
  const { recipientEmail, recipientName, senderName, messagePreview, conversationId } = opts
  const replyUrl = `${APP_URL}/messages?conversation=${conversationId}`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">You've got a new message 💬</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">G'day ${recipientName}, <strong style="color:#e2e8f0;">${senderName}</strong> sent you a message:</p>
    <div style="background:#1e293b;border-left:4px solid #4f46e5;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;font-style:italic;">"${messagePreview}"</p>
    </div>
    ${ctaButton(replyUrl, 'Reply Now →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Don't leave them hanging — reply to keep the job moving.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `New message from ${senderName}`,
    html,
  })
}

// ─── Email 5: Application Update ──────────────────────────────────────────────

/**
 * Sent to a jobseeker when an employer views or updates their application status.
 */
export async function sendApplicationUpdateEmail(opts: {
  applicantEmail: string
  applicantName: string
  jobTitle: string
  newStatus: string
  applicationId: string
}): Promise<void> {
  const { applicantEmail, applicantName, jobTitle, newStatus, applicationId } = opts
  const appUrl = `${APP_URL}/applications/${applicationId}`

  const statusLabel: Record<string, string> = {
    pending: 'Under Review',
    accepted: '🎉 Accepted',
    rejected: 'Not Selected',
    withdrawn: 'Withdrawn',
  }
  const statusDisplay = statusLabel[newStatus] ?? newStatus

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Application update 📋</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Kia ora ${applicantName}, there's an update on your application for <strong style="color:#e2e8f0;">${jobTitle}</strong>.</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Status', statusDisplay)}
    `)}
    ${ctaButton(appUrl, 'View Application →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Log in to see the full details and next steps.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: applicantEmail,
    subject: `Application update — ${jobTitle}`,
    html,
  })
}

// ─── Email 6: Review Received ─────────────────────────────────────────────────

/**
 * Sent to a user when they receive a new review.
 */
export async function sendReviewReceivedEmail(opts: {
  revieweeEmail: string
  revieweeName: string
  reviewerName: string
  rating: number
  reviewSnippet: string
  revieweeId: string
}): Promise<void> {
  const { revieweeEmail, revieweeName, reviewerName, rating, reviewSnippet, revieweeId } = opts
  const profileUrl = `${APP_URL}/workers/${revieweeId}`
  const stars = '⭐'.repeat(Math.min(5, Math.max(1, rating)))

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">You've got a new review! ⭐</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Ka pai, ${revieweeName}! <strong style="color:#e2e8f0;">${reviewerName}</strong> left you a review.</p>
    ${infoTable(`
      ${infoRow('From', reviewerName)}
      ${infoRow('Rating', `${stars} (${rating}/5)`)}
    `)}
    <div style="background:#1e293b;border-left:4px solid #4f46e5;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;font-style:italic;">"${reviewSnippet}"</p>
    </div>
    ${ctaButton(profileUrl, 'View Your Profile →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Great reviews help you win more jobs — keep up the awesome work!</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: revieweeEmail,
    subject: `${reviewerName} left you a ${rating}-star review`,
    html,
  })
}

// ─── Email 8: Dispute Raised ──────────────────────────────────────────────────

/**
 * Sent to both parties (and optionally admin) when a dispute is raised on a job.
 */
export async function sendDisputeRaisedEmail(opts: {
  recipientEmail: string
  recipientName: string
  raisedByName: string
  jobTitle: string
  jobId: string
  reason: string
  isAdmin?: boolean
}): Promise<void> {
  const { recipientEmail, recipientName, raisedByName, jobTitle, jobId, reason, isAdmin } = opts
  const disputeUrl = `${APP_URL}/jobs/${jobId}/dispute`

  const intro = isAdmin
    ? `A dispute has been raised on job <strong style="color:#e2e8f0;">${jobTitle}</strong> by <strong style="color:#e2e8f0;">${raisedByName}</strong>. Please review and resolve from the admin dashboard.`
    : `<strong style="color:#e2e8f0;">${raisedByName}</strong> has raised a dispute on the job <strong style="color:#e2e8f0;">${jobTitle}</strong>. Our team will review it within 24 hours.`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Dispute raised ⚠️</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${recipientName}, ${intro}</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Raised by', raisedByName)}
      ${infoRow('Reason', reason)}
    `)}
    ${ctaButton(isAdmin ? `${APP_URL}/dashboard/admin/disputes` : disputeUrl, isAdmin ? 'Review in Admin Dashboard →' : 'View Dispute →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">No action is needed right now. We&apos;ll be in touch once we&apos;ve reviewed the details.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `Dispute raised — ${jobTitle}`,
    html,
  })
}


/**
 * Sent to matching workers when a new job is posted in their trade/location.
 */
export async function sendJobMatchesEmail(opts: {
  workerEmail: string
  workerName: string
  jobTitle: string
  location: string
  budget: number
  jobId: string
}): Promise<void> {
  const { workerEmail, workerName, jobTitle, location, budget, jobId } = opts
  const jobUrl = `${APP_URL}/jobs/${jobId}`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">New job in your area 🔔</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">G'day ${workerName}, a new job matching your skills just landed near you — be one of the first to quote!</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Location', location)}
      ${infoRow('Budget', formatNzd(budget))}
    `)}
    ${ctaButton(jobUrl, 'View Job & Quote →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Early quotes get seen first — don't miss out!</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `New job near you — ${jobTitle} in ${location}`,
    html,
  })
}
