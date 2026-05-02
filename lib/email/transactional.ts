/**
 * Transactional email helpers for key platform events.
 * Sends via Resend using the RESEND_API_KEY environment variable.
 *
 * Emails:
 *   sendJobAcceptedEmail          — sent to worker when their quote is accepted
 *   sendPaymentReleasedEmail      — sent to worker when escrow payment is released
 *   sendQuoteReceivedEmail        — sent to homeowner when a worker submits a quote
 *   sendMessageReceivedEmail      — sent to recipient when they receive a message (30+ min inactive)
 *   sendApplicationUpdateEmail    — sent to jobseeker when employer views/updates their application
 *   sendReviewReceivedEmail       — sent to user when they receive a new review
 *   sendVerificationApprovedEmail — sent to worker when their identity is verified
 *   sendVerificationRejectedEmail — sent to worker when their verification is rejected
 *   sendBookingRequestEmail           — sent to worker when a homeowner requests a booking
 *   sendBookingConfirmedEmail         — sent to homeowner when worker confirms a booking
 *   sendBookingDeclinedEmail          — sent to homeowner when worker declines a booking
 *   sendJobCompletedWorkerEmail       — sent to worker when homeowner marks job complete + payment released
 *   sendJobCompletedHomeownerEmail    — sent to homeowner after marking complete, prompts review
 *   sendPaymentReleaseRequestEmail    — sent to homeowner when worker requests payment confirmation
 *   sendJobMatchesEmail               — sent to workers when a new job matches their trade/location
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

// ─── Email 7: Verification Approved ──────────────────────────────────────────

/**
 * Sent to a worker when their identity verification is approved.
 */
export async function sendVerificationApprovedEmail(opts: {
  workerEmail: string
  workerName: string
}): Promise<void> {
  const { workerEmail, workerName } = opts
  const dashboardUrl = `${APP_URL}/dashboard/worker`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">You're verified! ✓</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Ka pai, ${workerName}! Your identity has been verified and you now have the <strong style="color:#22c55e;">✓ Verified</strong> badge on your profile. This helps you stand out and win more jobs.</p>
    ${ctaButton(dashboardUrl, 'View Your Profile →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Thanks for helping make WorkerConnect a trusted platform for everyone in New Zealand.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: '✓ Your identity is verified — WorkerConnect',
    html,
  })
}

// ─── Email 8: Verification Rejected ──────────────────────────────────────────

/**
 * Sent to a worker when their identity verification is rejected.
 */
export async function sendVerificationRejectedEmail(opts: {
  workerEmail: string
  workerName: string
  rejectionReason: string
}): Promise<void> {
  const { workerEmail, workerName, rejectionReason } = opts
  const verifyUrl = `${APP_URL}/dashboard/worker/verify`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Verification unsuccessful</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${workerName}, unfortunately we weren't able to verify your identity this time.</p>
    ${infoTable(`
      ${infoRow('Reason', rejectionReason)}
    `)}
    <p style="color:#94a3b8;line-height:1.6;margin:16px 0 20px;">You're welcome to resubmit with clearer photos. Make sure your ID is fully visible and the selfie clearly shows you holding the ID.</p>
    ${ctaButton(verifyUrl, 'Resubmit Verification →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">If you have any questions, reply to this email.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: 'Verification update — WorkerConnect',
    html,
  })
}

// ─── Email 9: Dispute Raised ──────────────────────────────────────────────────

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

// ─── Email 10: Booking Request (to Worker) ────────────────────────────────────

/**
 * Sent to the worker when a homeowner requests a booking.
 */
export async function sendBookingRequestEmail(opts: {
  workerEmail: string
  workerName: string
  homeownerName: string
  requestedDate: string
  requestedTime: string
  duration: number
  description: string
  address: string
  bookingId: string
}): Promise<void> {
  const { workerEmail, workerName, homeownerName, requestedDate, requestedTime, duration, description, address, bookingId } = opts
  const bookingUrl = `${APP_URL}/dashboard/worker/bookings`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">New booking request! 📅</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Kia ora ${workerName}, <strong style="color:#e2e8f0;">${homeownerName}</strong> wants to book you for a job. Head to your dashboard to accept or decline.</p>
    ${infoTable(`
      ${infoRow('Date', requestedDate)}
      ${infoRow('Time', requestedTime)}
      ${infoRow('Duration', `${duration} hour${duration !== 1 ? 's' : ''}`)}
      ${infoRow('Address', address)}
    `)}
    <div style="background:#1e293b;border-left:4px solid #4f46e5;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Job Description</p>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;">${description}</p>
    </div>
    ${ctaButton(bookingUrl, 'Accept or Decline →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Please respond promptly — homeowners appreciate quick replies!</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `New booking request from ${homeownerName} — ${requestedDate}`,
    html,
  })
}

// ─── Email 11: Booking Confirmed (to Homeowner) ──────────────────────────────

/**
 * Sent to the homeowner when the worker confirms their booking.
 */
export async function sendBookingConfirmedEmail(opts: {
  homeownerEmail: string
  homeownerName: string
  workerName: string
  requestedDate: string
  requestedTime: string
  duration: number
  workerMessage?: string
  bookingId: string
}): Promise<void> {
  const { homeownerEmail, homeownerName, workerName, requestedDate, requestedTime, duration, workerMessage, bookingId } = opts
  const bookingUrl = `${APP_URL}/dashboard/homeowner/bookings`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Booking confirmed! 🎉</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Great news, ${homeownerName}! <strong style="color:#e2e8f0;">${workerName}</strong> has confirmed your booking request.</p>
    ${infoTable(`
      ${infoRow('Worker', workerName)}
      ${infoRow('Date', requestedDate)}
      ${infoRow('Time', requestedTime)}
      ${infoRow('Duration', `${duration} hour${duration !== 1 ? 's' : ''}`)}
    `)}
    ${workerMessage ? `
    <div style="background:#1e293b;border-left:4px solid #22c55e;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Message from ${workerName}</p>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;font-style:italic;">"${workerMessage}"</p>
    </div>
    ` : ''}
    ${ctaButton(bookingUrl, 'View Booking →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">You can message the worker directly through the platform if you need to discuss anything.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `Booking confirmed — ${workerName} on ${requestedDate}`,
    html,
  })
}

// ─── Email 12: Booking Declined (to Homeowner) ───────────────────────────────

/**
 * Sent to the homeowner when the worker declines their booking.
 */
export async function sendBookingDeclinedEmail(opts: {
  homeownerEmail: string
  homeownerName: string
  workerName: string
  requestedDate: string
  workerMessage?: string
  bookingId: string
}): Promise<void> {
  const { homeownerEmail, homeownerName, workerName, requestedDate, workerMessage, bookingId } = opts
  const workersUrl = `${APP_URL}/workers`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Booking update 📋</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${homeownerName}, unfortunately <strong style="color:#e2e8f0;">${workerName}</strong> is unable to take your booking for ${requestedDate}.</p>
    ${workerMessage ? `
    <div style="background:#1e293b;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.05em;">Message from ${workerName}</p>
      <p style="color:#e2e8f0;font-size:15px;line-height:1.6;margin:0;font-style:italic;">"${workerMessage}"</p>
    </div>
    ` : ''}
    ${ctaButton(workersUrl, 'Find Another Worker →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Plenty more great tradies are available — find one that works for you.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `Booking declined — ${workerName} on ${requestedDate}`,
    html,
  })
}

// ─── Email 13: Job Completed (Worker) ────────────────────────────────────────

/**
 * Sent to the worker when the homeowner marks the job as complete and payment is released.
 */
export async function sendJobCompletedWorkerEmail(opts: {
  workerEmail: string
  workerName: string
  homeownerName: string
  jobTitle: string
  jobId: string
  paymentAmount: number
}): Promise<void> {
  const { workerEmail, workerName, homeownerName, jobTitle, jobId, paymentAmount } = opts
  const earningsUrl = `${APP_URL}/dashboard/worker`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Great news — payment released! 🎉</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Ka pai, ${workerName}! <strong style="color:#e2e8f0;">${homeownerName}</strong> has marked your job as complete and your payment has been released.</p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Payment released', formatNzd(paymentAmount))}
    `)}
    ${ctaButton(earningsUrl, 'View Your Earnings →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">Funds will appear in your account within 2–3 business days. Thanks for your hard work!</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: workerEmail,
    subject: `Job complete — payment of ${formatNzd(paymentAmount)} released for ${jobTitle}`,
    html,
  })
}

// ─── Email 14: Job Completed (Homeowner) ─────────────────────────────────────

/**
 * Sent to the homeowner after they mark a job as complete, prompting them to leave a review.
 */
export async function sendJobCompletedHomeownerEmail(opts: {
  homeownerEmail: string
  homeownerName: string
  workerName: string
  jobTitle: string
  jobId: string
}): Promise<void> {
  const { homeownerEmail, homeownerName, workerName, jobTitle, jobId } = opts
  const reviewUrl = `${APP_URL}/jobs/${jobId}#review`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Job complete! Leave a review ⭐</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${homeownerName}, you've marked <strong style="color:#e2e8f0;">${jobTitle}</strong> as complete. Payment has been released to <strong style="color:#e2e8f0;">${workerName}</strong>.</p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">How did ${workerName} do? Leaving a review helps build trust in the community and rewards great tradies.</p>
    ${ctaButton(reviewUrl, `Leave a Review for ${workerName} →`)}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">It only takes a minute and makes a big difference to local tradies.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `Job complete — please leave a review for ${workerName}`,
    html,
  })
}

// ─── Email 15: Payment Release Request (Homeowner) ───────────────────────────

/**
 * Sent to the homeowner when the worker requests confirmation that the job is complete.
 */
export async function sendPaymentReleaseRequestEmail(opts: {
  homeownerEmail: string
  homeownerName: string
  workerName: string
  jobTitle: string
  jobId: string
}): Promise<void> {
  const { homeownerEmail, homeownerName, workerName, jobTitle, jobId } = opts
  const jobUrl = `${APP_URL}/jobs/${jobId}`

  const html = emailWrapper(`
    <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">Is the job done? Please confirm ✅</h1>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Hi ${homeownerName}, <strong style="color:#e2e8f0;">${workerName}</strong> believes the work on <strong style="color:#e2e8f0;">${jobTitle}</strong> is complete and has requested you confirm so their payment can be released.</p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">If you're happy with the work, click below to mark it as complete. If there are any issues, you can raise a dispute instead.</p>
    ${ctaButton(jobUrl, 'Confirm Job Complete →')}
    <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">If you have concerns about the work, you can raise a dispute directly on the job page.</p>
  `)

  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: homeownerEmail,
    subject: `${workerName} is requesting job completion confirmation — ${jobTitle}`,
    html,
  })
}

// ─── Email 16: Job Matches ────────────────────────────────────────────────────

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
