import type { EarningsTransaction, EarningsSummary, MonthlyEarnings } from '@/types'
import { calculateMultiplier, type MultiplierContext } from './multipliers'

/** Cashback rate by worker tier */
export const CASHBACK_RATES = {
  default: 0.02,           // 2%
  trusted_professional: 0.03,  // 3%
  enterprise_certified: 0.04,  // 4%
} as const

/** Additional cashback on high-value jobs ($500+) */
export const HIGH_VALUE_JOB_BONUS = 0.05   // 5% extra

/** Minimum job amount to qualify for the high-value bonus */
export const HIGH_VALUE_THRESHOLD = 500

/** Withdrawal fee configuration */
export const WITHDRAWAL_FEES = {
  standard: { flat: 0, pct: 0 },
  instant:  { flat: 0.25, pct: 0 },
}

export const PROCESSING_FEE_PCT = 0.02    // 2%
export const PROCESSING_FEE_MIN = 1.00   // $1 minimum
export const PROCESSING_FEE_MAX = 5.00   // $5 maximum
export const MIN_WITHDRAWAL = 25.00

export type WorkerTier = 'default' | 'trusted_professional' | 'enterprise_certified'

/** Calculates the cashback amount for a completed job. */
export function calculateCashback(
  jobAmount: number,
  tier: WorkerTier,
  multiplierCtx?: MultiplierContext
): { cashback: number; rate: number; multiplier: number } {
  const baseRate = CASHBACK_RATES[tier]
  const isHighValue = jobAmount >= HIGH_VALUE_THRESHOLD
  const rate = baseRate + (isHighValue ? HIGH_VALUE_JOB_BONUS : 0)
  const multiplier = multiplierCtx ? calculateMultiplier(multiplierCtx) : 1.0
  const cashback = parseFloat((jobAmount * rate * multiplier).toFixed(2))
  return { cashback, rate, multiplier }
}

/** Calculates withdrawal processing fee. */
export function calculateWithdrawalFee(amount: number): number {
  const fee = Math.max(
    PROCESSING_FEE_MIN,
    Math.min(PROCESSING_FEE_MAX, amount * PROCESSING_FEE_PCT)
  )
  return parseFloat(fee.toFixed(2))
}

/** Calculates net amount after fee. */
export function calculateNetWithdrawal(amount: number, transferType: 'standard' | 'instant'): {
  fee: number
  instantFee: number
  netAmount: number
} {
  const fee = calculateWithdrawalFee(amount)
  const instantFee = transferType === 'instant' ? WITHDRAWAL_FEES.instant.flat : 0
  const netAmount = parseFloat((amount - fee - instantFee).toFixed(2))
  return { fee, instantFee, netAmount }
}

/** Builds a summary object from a list of transactions. */
export function buildEarningsSummary(transactions: EarningsTransaction[]): EarningsSummary {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

  let totalLifetime = 0
  let totalThisMonth = 0
  let totalLastMonth = 0
  let cashbackEarned = 0
  let referralEarned = 0
  let bonusEarned = 0
  let pendingBalance = 0
  let availableBalance = 0

  const monthlyMap = new Map<string, MonthlyEarnings>()

  for (const tx of transactions) {
    const month = tx.createdAt.slice(0, 7) // "YYYY-MM"

    if (tx.status === 'pending') {
      pendingBalance += tx.amount
    } else if (tx.status === 'available') {
      availableBalance += tx.amount
    }

    totalLifetime += tx.amount
    if (month === thisMonth) totalThisMonth += tx.amount
    if (month === lastMonth) totalLastMonth += tx.amount

    if (tx.type === 'job') cashbackEarned += tx.amount
    else if (tx.type === 'referral_bonus') referralEarned += tx.amount
    else bonusEarned += tx.amount

    if (!monthlyMap.has(month)) {
      const d = new Date(month + '-01')
      monthlyMap.set(month, {
        month,
        label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total: 0,
        cashback: 0,
        referral: 0,
        bonus: 0,
        jobCount: 0,
      })
    }

    const entry = monthlyMap.get(month)!
    entry.total += tx.amount
    if (tx.type === 'job') { entry.cashback += tx.amount; entry.jobCount += 1 }
    else if (tx.type === 'referral_bonus') entry.referral += tx.amount
    else entry.bonus += tx.amount
  }

  const monthlyBreakdown = Array.from(monthlyMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)

  return {
    totalLifetime,
    totalThisMonth,
    totalLastMonth,
    cashbackEarned,
    referralEarned,
    bonusEarned,
    pendingBalance,
    availableBalance,
    monthlyBreakdown,
  }
}
