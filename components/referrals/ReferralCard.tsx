'use client'
import type { Referral } from '@/types'
import { getReferralStatusLabel, getNextReferralBonus, REFERRAL_BONUSES } from '@/lib/referrals/referralLogic'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { CheckCircle, Clock, User } from 'lucide-react'

interface ReferralCardProps {
  referral: Referral
}

const STATUS_COLORS: Record<Referral['status'], string> = {
  pending: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  signed_up: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed_3: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed_50: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  trusted_pro: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function ReferralCard({ referral }: ReferralCardProps) {
  const statusLabel = getReferralStatusLabel(referral.status)
  const nextBonus = getNextReferralBonus(referral.status)
  const earned = referral.earnedAmount > 0

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Avatar placeholder */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        <User className="h-5 w-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-white text-sm">
            {referral.referredName ?? referral.referredEmail ?? 'Invited Worker'}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[referral.status]}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(referral.createdAt)}
          </span>
          {referral.jobsCompleted !== undefined && (
            <span>{referral.jobsCompleted} jobs completed</span>
          )}
          {nextBonus && (
            <span className="text-primary-600 dark:text-primary-400">
              Next: {formatCurrency(nextBonus.amount)} at {getReferralStatusLabel(nextBonus.status)}
            </span>
          )}
        </div>
      </div>

      {/* Earned */}
      <div className="flex-shrink-0 text-right">
        {earned ? (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span className="font-bold text-sm">{formatCurrency(referral.earnedAmount)}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">
            Up to {formatCurrency(REFERRAL_BONUSES.trusted_pro)}
          </span>
        )}
      </div>
    </div>
  )
}
