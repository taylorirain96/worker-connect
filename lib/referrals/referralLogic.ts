import type { Referral, ReferralStats, ReferralStatus } from '@/types'

/** Referral bonus amounts */
export const REFERRAL_BONUSES: Record<ReferralStatus, number> = {
  pending: 0,
  signed_up: 0,
  completed_3: 25,    // $25 when referred worker completes first 3 jobs
  completed_50: 50,   // $50 when referred worker reaches 50 jobs
  trusted_pro: 100,   // $100 when referred worker hits "Trusted Professional"
}

/** Milestone bonuses */
export const MILESTONE_BONUSES: { referrals: number; bonus: number }[] = [
  { referrals: 10, bonus: 500 },
  { referrals: 25, bonus: 1500 },
]

/** Generates a unique referral code for a worker. */
export function generateReferralCode(workerId: string): string {
  const prefix = workerId.slice(-4).toUpperCase()
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `QT-${prefix}-${suffix}`
}

/** Returns the referral URL for a given code. */
export function getReferralUrl(code: string, baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : 'https://quicktrade.app')
  return `${base}/referrals/${code}`
}

/** Calculates the total earnings from a list of referrals. */
export function calculateReferralEarnings(referrals: Referral[]): number {
  return referrals.reduce((sum, r) => sum + r.earnedAmount, 0)
}

/** Determines the next bonus a referral will unlock. */
export function getNextReferralBonus(status: ReferralStatus): { status: ReferralStatus; amount: number } | null {
  const progression: ReferralStatus[] = ['pending', 'signed_up', 'completed_3', 'completed_50', 'trusted_pro']
  const idx = progression.indexOf(status)
  if (idx === -1 || idx === progression.length - 1) return null
  const next = progression[idx + 1]
  return { status: next, amount: REFERRAL_BONUSES[next] }
}

/** Returns a human-readable label for a referral status. */
export function getReferralStatusLabel(status: ReferralStatus): string {
  const labels: Record<ReferralStatus, string> = {
    pending: 'Link Shared',
    signed_up: 'Signed Up',
    completed_3: '3 Jobs Done',
    completed_50: '50 Jobs Done',
    trusted_pro: 'Trusted Pro',
  }
  return labels[status]
}

/** Checks whether a milestone bonus should be awarded. */
export function checkMilestoneBonus(completedReferrals: number): number {
  let total = 0
  for (const m of MILESTONE_BONUSES) {
    if (completedReferrals >= m.referrals) total = m.bonus
  }
  return total
}

/** Builds referral stats from a list of referrals. */
export function buildReferralStats(referrals: Referral[]): ReferralStats {
  const completed = referrals.filter((r) => r.status !== 'pending' && r.status !== 'signed_up')
  const active = referrals.filter((r) => r.status === 'pending' || r.status === 'signed_up')

  const conversionRate = referrals.length > 0
    ? parseFloat(((completed.length / referrals.length) * 100).toFixed(1))
    : 0

  const totalEarned = referrals
    .filter((r) => r.earnedAmount > 0)
    .reduce((sum, r) => sum + r.earnedAmount, 0)

  const pendingEarnings = referrals
    .filter((r) => r.status === 'signed_up')
    .reduce((sum) => sum + REFERRAL_BONUSES.completed_3, 0)

  const nextMilestoneEntry = MILESTONE_BONUSES.find((m) => completed.length < m.referrals)
  const nextMilestone = nextMilestoneEntry?.referrals ?? MILESTONE_BONUSES[MILESTONE_BONUSES.length - 1].referrals
  const nextBonus = nextMilestoneEntry?.bonus ?? 0

  return {
    totalReferred: referrals.length,
    totalCompleted: completed.length,
    conversionRate,
    totalEarned,
    pendingEarnings,
    activeReferrals: active.length,
    milestoneProgress: {
      current: completed.length,
      nextMilestone,
      nextBonus,
    },
  }
}
