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

    case 'placement_checkin_worker':
      return {
        subject: `Still working at ${vars.employerName ?? 'your employer'}? Quick check-in 👋`,
        preheader: `It's been ${vars.dayMark ?? 30} days since you started — let us know how things are going.`,
        html: baseHtml(
          `Still working at ${vars.employerName ?? 'your employer'}? 👋`,
          `<p style="color:#374151;line-height:1.6;">Hey ${vars.workerName ?? 'there'},</p>
           <p style="color:#374151;line-height:1.6;">It's been <strong>${vars.dayMark ?? 30} days</strong> since you were placed at <strong>${vars.employerName ?? 'your employer'}</strong> through QuickTrade. We just want to check in and make sure everything is going well!</p>
           <p style="color:#374151;line-height:1.6;">Are you still working there?</p>
           <div style="display:flex;gap:12px;margin:24px 0;">
             <a href="${vars.confirmYesUrl ?? '#'}" style="flex:1;text-align:center;background:#059669;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">✅ Yes, still there</a>
             <a href="${vars.confirmNoUrl ?? '#'}" style="flex:1;text-align:center;background:#6b7280;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">👋 I've moved on</a>
           </div>
           <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">PS — If you've moved on, no worries! <a href="${vars.jobsUrl ?? '#'}" style="color:#2563eb;">We have new jobs matching your skills</a> ready and waiting for you.</p>`,
        ),
        text: `Still working at ${vars.employerName ?? 'your employer'}?\n\nHey ${vars.workerName ?? 'there'}, it's been ${vars.dayMark ?? 30} days since your placement. Are you still working there?\n\nYes, still there: ${vars.confirmYesUrl ?? ''}\nI've moved on: ${vars.confirmNoUrl ?? ''}\n\nPS — We have new jobs matching your skills waiting for you: ${vars.jobsUrl ?? ''}`,
      }

    case 'placement_checkin_employer':
      return {
        subject: `How's ${vars.workerName ?? 'your worker'} working out?`,
        preheader: `${vars.dayMark ?? 30}-day check-in for your QuickTrade placement.`,
        html: baseHtml(
          `How's ${vars.workerName ?? 'your worker'} working out? 🤝`,
          `<p style="color:#374151;line-height:1.6;">Hi ${vars.employerName ?? 'there'},</p>
           <p style="color:#374151;line-height:1.6;">It's been <strong>${vars.dayMark ?? 30} days</strong> since <strong>${vars.workerName ?? 'your worker'}</strong> started with you through QuickTrade. Is everything going well?</p>
           <p style="color:#374151;line-height:1.6;">Is ${vars.workerName ?? 'your worker'} still with you?</p>
           <div style="display:flex;gap:12px;margin:24px 0;">
             <a href="${vars.confirmYesUrl ?? '#'}" style="flex:1;text-align:center;background:#059669;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">✅ Yes, going great</a>
             <a href="${vars.confirmNoUrl ?? '#'}" style="flex:1;text-align:center;background:#6b7280;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">👋 No longer with us</a>
           </div>
           <p style="color:#6b7280;font-size:13px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">PS — If you need another worker, you'll get <strong>50% off your next job listing</strong>. <a href="${vars.postJobUrl ?? '#'}" style="color:#2563eb;">Post a new job here</a>.</p>`,
        ),
        text: `How's ${vars.workerName ?? 'your worker'} working out?\n\nHi ${vars.employerName ?? 'there'}, it's been ${vars.dayMark ?? 30} days since the placement. Is everything going well?\n\nYes, going great: ${vars.confirmYesUrl ?? ''}\nNo longer with us: ${vars.confirmNoUrl ?? ''}\n\nPS — Need another worker? You get 50% off your next listing: ${vars.postJobUrl ?? ''}`,
      }

    case 'placement_ended_worker':
      return {
        subject: `Welcome back — here are jobs waiting for you 🔥`,
        preheader: 'Your profile is still live. New jobs near you are ready to go.',
        html: baseHtml(
          `Welcome back, ${vars.workerName ?? 'there'}! 🔥`,
          `<p style="color:#374151;line-height:1.6;">We heard you've moved on from <strong>${vars.employerName ?? 'your last employer'}</strong>. That's totally okay — it's time for your next opportunity!</p>
           <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
             <p style="margin:0;color:#166534;font-weight:600;">✅ Your profile is still live</p>
             <p style="margin:6px 0 0;color:#166534;font-size:14px;">Employers can find you right now. Update your availability to get matched faster.</p>
           </div>
           <p style="color:#374151;line-height:1.6;">Here are jobs near you that match your skills — don't let them go to someone else:</p>`,
          vars.actionUrl as string | undefined ?? '/jobs',
          'Find My Next Job →'
        ),
        text: `Welcome back, ${vars.workerName ?? 'there'}!\n\nWe heard you've moved on from ${vars.employerName ?? 'your last employer'}. Your profile is still live and there are jobs waiting for you.\n\nFind your next job: ${vars.actionUrl ?? '/jobs'}`,
      }

    case 'placement_ended_employer':
      return {
        subject: `Need a replacement? 50% off your next job post`,
        preheader: 'Sorry to hear your worker has moved on. We can help you find a replacement fast.',
        html: baseHtml(
          `Need a replacement worker? We've got you covered 👷`,
          `<p style="color:#374151;line-height:1.6;">Hi ${vars.employerName ?? 'there'},</p>
           <p style="color:#374151;line-height:1.6;">Sorry to hear that <strong>${vars.workerName ?? 'your worker'}</strong> has moved on. Finding the right person takes time — that's why we're here to help.</p>
           <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
             <p style="margin:0;color:#1e40af;font-size:18px;font-weight:700;">50% off your next job listing</p>
             <p style="margin:6px 0 0;color:#1e40af;font-size:14px;">Use code <strong>COMEBACK50</strong> when you post</p>
           </div>
           <p style="color:#374151;line-height:1.6;">We'll match you with vetted workers who are ready to start right away. Re-listing takes less than 2 minutes.</p>`,
          vars.actionUrl as string | undefined ?? '/jobs/create',
          'Post a New Job →'
        ),
        text: `Need a replacement worker?\n\nHi ${vars.employerName ?? 'there'}, sorry to hear ${vars.workerName ?? 'your worker'} has moved on. Use code COMEBACK50 for 50% off your next job listing.\n\nPost a new job: ${vars.actionUrl ?? '/jobs/create'}`,
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
