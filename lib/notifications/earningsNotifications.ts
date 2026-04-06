/**
 * Earnings & referral notification helpers.
 * Actual email delivery should be wired to SendGrid / Firebase via API routes.
 */

export type EarningsNotificationType =
  | 'referral_signup'
  | 'referral_bonus_earned'
  | 'cashback_earned'
  | 'withdrawal_pending'
  | 'withdrawal_completed'
  | 'withdrawal_failed'
  | 'milestone_achieved'
  | 'monthly_summary'

export interface EarningsNotification {
  type: EarningsNotificationType
  workerId: string
  workerEmail: string
  workerName: string
  payload: Record<string, string | number>
}

/** Sends an earnings notification via the API route. */
export async function sendEarningsNotification(notification: EarningsNotification): Promise<void> {
  try {
    await fetch('/api/notifications/earnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notification),
    })
  } catch {
    // Non-critical — log and continue
    console.warn('Failed to send earnings notification', notification.type)
  }
}

/** Helper: notify worker of a referral bonus. */
export function notifyReferralBonusEarned(
  workerId: string,
  workerEmail: string,
  workerName: string,
  amount: number,
  referredName: string
): Promise<void> {
  return sendEarningsNotification({
    type: 'referral_bonus_earned',
    workerId,
    workerEmail,
    workerName,
    payload: { amount, referredName },
  })
}

/** Helper: notify worker of completed withdrawal. */
export function notifyWithdrawalCompleted(
  workerId: string,
  workerEmail: string,
  workerName: string,
  amount: number,
  bankLast4: string
): Promise<void> {
  return sendEarningsNotification({
    type: 'withdrawal_completed',
    workerId,
    workerEmail,
    workerName,
    payload: { amount, bankLast4 },
  })
}
