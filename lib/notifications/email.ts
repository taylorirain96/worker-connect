/**
 * Email notification templates and helpers.
 * Actual delivery via SendGrid API route (/api/notifications/email).
 */
import type { NotificationType } from '@/types'

export interface EmailTemplate {
  subject: string
  preheader: string
  html: string
  text: string
}

function baseHtml(title: string, body: string, actionUrl?: string, actionLabel?: string): string {
  const btn = actionUrl
    ? `<div style="text-align:center;margin:24px 0;">
        <a href="${actionUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">${actionLabel ?? 'View Details'}</a>
       </div>`
    : ''
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#2563eb;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🔧 QuickTrade</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${title}</h2>
          ${body}
          ${btn}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">You received this because you have email notifications enabled. <a href="{{unsubscribeUrl}}" style="color:#9ca3af;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

type TemplateVars = Record<string, string | number>

export function buildEmailTemplate(type: NotificationType, vars: TemplateVars): EmailTemplate {
  switch (type) {
    case 'new_job':
    case 'application_received':
    case 'job_status_change':
    case 'job_completed':
    case 'application':
      return {
        subject: vars.subject as string ?? 'Job Update — QuickTrade',
        preheader: vars.message as string ?? '',
        html: baseHtml(
          vars.title as string ?? 'Job Update',
          `<p style="color:#374151;line-height:1.6;">${vars.message}</p>`,
          vars.actionUrl as string,
          'View Job'
        ),
        text: `${vars.title}\n\n${vars.message}\n\n${vars.actionUrl ?? ''}`,
      }

    case 'payment_received':
    case 'payout_processed':
    case 'invoice_created':
    case 'payment_failed':
      return {
        subject: vars.subject as string ?? 'Payment Update — QuickTrade',
        preheader: vars.message as string ?? '',
        html: baseHtml(
          vars.title as string ?? 'Payment Update',
          `<p style="color:#374151;line-height:1.6;">${vars.message}</p>
           <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
             <p style="margin:0;font-size:24px;font-weight:700;color:#111827;">$${Number(vars.amount ?? 0).toFixed(2)}</p>
             <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${vars.jobTitle ?? ''}</p>
           </div>`,
          vars.actionUrl as string,
          'View Payments'
        ),
        text: `${vars.title}\n\n${vars.message}\n\nAmount: $${Number(vars.amount ?? 0).toFixed(2)}\n\n${vars.actionUrl ?? ''}`,
      }

    case 'review_received':
    case 'new_review':
      return {
        subject: vars.subject as string ?? 'New Review — QuickTrade',
        preheader: `You received a ${vars.rating}-star review`,
        html: baseHtml(
          vars.title as string ?? 'New Review',
          `<p style="color:#374151;line-height:1.6;">${vars.message}</p>
           <div style="font-size:28px;margin:12px 0;">${'⭐'.repeat(Math.min(5, Number(vars.rating ?? 5)))}</div>`,
          vars.actionUrl as string,
          'View Review'
        ),
        text: `${vars.title}\n\n${vars.message}\n\nRating: ${'★'.repeat(Number(vars.rating ?? 5))}\n\n${vars.actionUrl ?? ''}`,
      }

    case 'badge_unlocked':
    case 'badge_earned':
    case 'milestone_reached':
    case 'points_earned':
      return {
        subject: vars.subject as string ?? 'Achievement Unlocked — QuickTrade',
        preheader: vars.message as string ?? '',
        html: baseHtml(
          vars.title as string ?? 'Achievement Unlocked! 🏆',
          `<div style="text-align:center;font-size:48px;margin:16px 0;">${vars.emoji ?? '🏆'}</div>
           <p style="color:#374151;line-height:1.6;text-align:center;">${vars.message}</p>`,
          vars.actionUrl as string,
          'View Achievements'
        ),
        text: `${vars.title}\n\n${vars.message}\n\n${vars.actionUrl ?? ''}`,
      }

    case 'verification_approved':
    case 'verification_rejected':
    case 'document_uploaded':
      return {
        subject: vars.subject as string ?? 'Verification Update — QuickTrade',
        preheader: vars.message as string ?? '',
        html: baseHtml(
          vars.title as string ?? 'Verification Update',
          `<p style="color:#374151;line-height:1.6;">${vars.message}</p>`,
          vars.actionUrl as string,
          'View Profile'
        ),
        text: `${vars.title}\n\n${vars.message}\n\n${vars.actionUrl ?? ''}`,
      }

    default:
      return {
        subject: vars.subject as string ?? 'Notification — QuickTrade',
        preheader: vars.message as string ?? '',
        html: baseHtml(
          vars.title as string ?? 'Notification',
          `<p style="color:#374151;line-height:1.6;">${vars.message}</p>`,
          vars.actionUrl as string
        ),
        text: `${vars.title}\n\n${vars.message}\n\n${vars.actionUrl ?? ''}`,
      }
  }
}
