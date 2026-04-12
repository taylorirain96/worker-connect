'use client'

import { Shield, CheckCircle, TrendingDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getJobPostingFee,
  calculateCommission,
} from '@/lib/services/escrowService'
import { COMMISSION_TIERS, JOB_POSTING_FEES } from '@/types'

// ─── Job Posting Fee Breakdown ────────────────────────────────────────────────

interface JobPostingFeeBreakdownProps {
  estimatedValue: number
  featuredListing?: boolean
  urgentBadge?: boolean
  className?: string
}

export function JobPostingFeeBreakdown({
  estimatedValue,
  featuredListing = false,
  urgentBadge = false,
  className,
}: JobPostingFeeBreakdownProps) {
  const feeConfig = getJobPostingFee(estimatedValue)
  let total = feeConfig.fee
  if (featuredListing) total += 14.99
  if (urgentBadge) total += 7.99

  return (
    <div className={cn('rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Job Posting Fee</span>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">{feeConfig.label} posting fee</span>
          <span className="font-medium text-slate-900 dark:text-white">NZ${feeConfig.fee.toFixed(2)}</span>
        </div>
        {featuredListing && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Featured listing</span>
            <span className="font-medium text-slate-900 dark:text-white">NZ$14.99</span>
          </div>
        )}
        {urgentBadge && (
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Urgent badge</span>
            <span className="font-medium text-slate-900 dark:text-white">NZ$7.99</span>
          </div>
        )}
        <div className="border-t border-indigo-200 dark:border-indigo-800 pt-1.5 flex justify-between font-semibold">
          <span className="text-slate-900 dark:text-white">Total due today</span>
          <span className="text-indigo-700 dark:text-indigo-300">NZ${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {[
          'Job goes live immediately on payment',
          'Access to all verified QuickTrade workers',
          'Covered by QuickTrade Guarantee',
        ].map((item) => (
          <div key={item} className="flex items-start gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-400">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Commission Tier Breakdown ────────────────────────────────────────────────

interface CommissionBreakdownProps {
  jobAmount: number
  completedJobs: number
  className?: string
}

export function CommissionBreakdown({ jobAmount, completedJobs, className }: CommissionBreakdownProps) {
  const { commissionRate, commissionAmount, workerAmount, tier } = calculateCommission(jobAmount, completedJobs)
  const tierConfig = COMMISSION_TIERS.find((t) => t.tier === tier)!

  return (
    <div className={cn('rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Payment Breakdown</span>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Job value</span>
          <span className="font-medium text-slate-900 dark:text-white">NZ${jobAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">
            QuickTrade fee ({(commissionRate * 100).toFixed(0)}% — {tierConfig.label})
          </span>
          <span className="font-medium text-slate-900 dark:text-white">− NZ${commissionAmount.toFixed(2)}</span>
        </div>
        <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1.5 flex justify-between font-semibold">
          <span className="text-slate-900 dark:text-white">You receive</span>
          <span className="text-emerald-700 dark:text-emerald-300">NZ${workerAmount.toFixed(2)}</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 rounded-lg px-3 py-2 border border-emerald-100 dark:border-emerald-900">
        <span className="font-medium text-emerald-700 dark:text-emerald-400">Only pay when you get paid.</span>
        {' '}QuickTrade&apos;s {(commissionRate * 100).toFixed(0)}% fee covers your secure escrow payment, legal contract, dispute resolution, and QuickTrade Guarantee.
      </p>
    </div>
  )
}

// ─── Commission Tier Ladder ───────────────────────────────────────────────────

interface CommissionTierLadderProps {
  completedJobs: number
  className?: string
}

export function CommissionTierLadder({ completedJobs, className }: CommissionTierLadderProps) {
  const currentTierConfig = COMMISSION_TIERS.find(
    (t) => completedJobs >= t.minJobs && (t.maxJobs === null || completedJobs <= t.maxJobs)
  ) ?? COMMISSION_TIERS[0]

  return (
    <div className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Your Commission Rate</span>
      </div>

      <div className="space-y-2">
        {COMMISSION_TIERS.map((t) => {
          const isCurrent = t.tier === currentTierConfig.tier
          return (
            <div
              key={t.tier}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                isCurrent
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              )}
            >
              <div>
                <span className="font-medium">{t.label}</span>
                <span className={cn('ml-2 text-xs', isCurrent ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500')}>
                  {t.maxJobs === null ? `${t.minJobs}+ jobs` : `${t.minJobs}–${t.maxJobs} jobs`}
                </span>
              </div>
              <span className={cn('font-bold', isCurrent ? 'text-white' : '')}>
                {(t.rate * 100).toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>

      {currentTierConfig.nextTier && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Complete{' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {(() => {
              const nextMinJobs = COMMISSION_TIERS.find((t) => t.tier === currentTierConfig.nextTier)?.minJobs ?? 0
              const jobsRemaining = nextMinJobs - completedJobs
              return `${jobsRemaining} more job${jobsRemaining === 1 ? '' : 's'}`
            })()}
          </span>{' '}
          to unlock a lower commission rate.
        </p>
      )}
    </div>
  )
}

// ─── Posting Fee Tiers Info ───────────────────────────────────────────────────

interface PostingFeeTiersProps {
  className?: string
}

export function PostingFeeTiers({ className }: PostingFeeTiersProps) {
  return (
    <div className={cn('rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Job Posting Fees (NZD)</span>
      </div>
      <div className="space-y-1.5">
        {JOB_POSTING_FEES.map((f) => (
          <div key={f.tier} className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {f.label}{' '}
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({f.maxValue === null ? `NZ$${f.minValue.toLocaleString()}+` : `NZ$${f.minValue.toLocaleString()}–NZ$${f.maxValue.toLocaleString()}`})
              </span>
            </span>
            <span className="font-medium text-slate-900 dark:text-white">NZ${f.fee.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Optional: +NZ$14.99 featured listing · +NZ$7.99 urgent badge
      </p>
    </div>
  )
}
