/**
 * SMS notification helpers via Twilio.
 * Actual sending is done server-side via the /api/notifications/sms API route.
 */

export type SMSNotificationType =
  | 'payment_received'
  | 'payment_failed'
  | 'security_alert'
  | 'account_update'
  | 'job_completed'

export interface SMSNotification {
  to: string       // E.164 phone number, e.g. "+12125551234"
  type: SMSNotificationType
  message: string
  userId: string
}

/** Sends an SMS notification via the server-side API route. */
export async function sendSMS(notification: SMSNotification): Promise<void> {
  try {
    const res = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    })
    if (!res.ok) {
      console.warn('SMS dispatch failed:', await res.text())
    }
  } catch (err) {
    console.warn('SMS dispatch error:', err)
  }
}

/** Build a short SMS message body (160 chars max for a single segment). */
export function buildSMSMessage(type: SMSNotificationType, vars: Record<string, string | number>): string {
  switch (type) {
    case 'payment_received':
      return `QuickTrade: You received $${Number(vars.amount ?? 0).toFixed(2)} for "${vars.jobTitle ?? 'job'}". Check your dashboard.`
    case 'payment_failed':
      return `QuickTrade ALERT: Payment of $${Number(vars.amount ?? 0).toFixed(2)} failed. Please update your payment info.`
    case 'security_alert':
      return `QuickTrade SECURITY: ${vars.detail ?? 'Unusual activity detected'}. If this wasn't you, contact support immediately.`
    case 'account_update':
      return `QuickTrade: Your account has been updated. If you didn't make this change, contact support.`
    case 'job_completed':
      return `QuickTrade: Job "${vars.jobTitle ?? 'your job'}" is complete! Leave a review to earn points.`
    default:
      return `QuickTrade: ${vars.message ?? 'You have a new notification.'}`
  }
}
