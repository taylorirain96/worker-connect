'use client'

/**
 * FeeBreakdown — transparent payment fee breakdown for QuickTrade.
 *
 * Shows before any payment:
 *   - Posting fee (employer)
 *   - Escrow amount
 *   - Platform commission
 *   - Worker net receive
 *
 * Messaging: "QuickTrade takes X% — only after you get paid"
 */

import { CreditCard, Shield, DollarSign, Lock, Unlock, TrendingUp, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { getPostingFee, getWorkerTier, WORKER_TIERS } from '@/types'

function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface FeeBreakdownProps {
  /** Estimated job budget in NZD — used to calculate the posting fee */
  estimatedBudget: number
  /** Quoted/escrow amount in NZD (if known) */
  quoteAmount?: number
  /** Number of jobs the worker has completed — used to calculate commission tier */
  workerCompletedJobs?: number
  /** Show posting fee section (employer view) */
  showPostingFee?: boolean
  /** Show escrow section */
  showEscrow?: boolean
  className?: string
}

export default function FeeBreakdown({
  estimatedBudget,
  quoteAmount,
  workerCompletedJobs = 0,
  showPostingFee = true,
  showEscrow = true,
  className = '',
}: FeeBreakdownProps) {
  const feeInfo = getPostingFee(estimatedBudget)
  const tierInfo = getWorkerTier(workerCompletedJobs)
  const escrowAmount = quoteAmount ?? estimatedBudget
  const commission = Math.round(escrowAmount * tierInfo.commissionRate * 100) / 100
  const workerReceives = Math.round((escrowAmount - commission) * 100) / 100

  const nextTier = WORKER_TIERS.find((t) => t.minJobs > tierInfo.minJobs)

  return (
    <Card className={`border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 ${className}`}>
      <CardContent className="p-5 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Fee Breakdown &amp; Payment Protection
          </h3>
        </div>

        {/* Posting Fee */}
        {showPostingFee && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Job Posting Fee
            </p>
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feeInfo.label} posting fee
                </span>
                <span className="text-xs text-gray-400">({feeInfo.description})</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {formatNZD(feeInfo.fee)}
              </span>
            </div>
          </div>
        )}

        {/* Escrow / Commission breakdown */}
        {showEscrow && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              When Payment is Released
            </p>

            {/* Escrow amount */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Escrow amount held</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {formatNZD(escrowAmount)}
              </span>
            </div>

            {/* Platform commission */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    QuickTrade fee ({Math.round(tierInfo.commissionRate * 100)}%)
                  </span>
                  <p className="text-xs text-gray-400">
                    {tierInfo.label} tier · only after you get paid
                  </p>
                </div>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                −{formatNZD(commission)}
              </span>
            </div>

            {/* Worker receives */}
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                  Worker receives
                </span>
              </div>
              <span className="font-bold text-green-700 dark:text-green-400 text-sm">
                {formatNZD(workerReceives)}
              </span>
            </div>
          </div>
        )}

        {/* Commission tier info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Commission Tiers — lower as you grow
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {WORKER_TIERS.map((t) => (
              <div
                key={t.tier}
                className={`flex items-center justify-between px-2 py-1 rounded ${
                  t.tier === tierInfo.tier
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span>{t.label}</span>
                <span>{Math.round(t.commissionRate * 100)}%</span>
              </div>
            ))}
          </div>
          {nextTier && (
            <p className="text-xs text-gray-400 mt-1">
              Complete {nextTier.minJobs - workerCompletedJobs} more job
              {nextTier.minJobs - workerCompletedJobs !== 1 ? 's' : ''} to reach{' '}
              <span className="text-indigo-500 font-medium">{nextTier.label}</span> and save{' '}
              {Math.round((tierInfo.commissionRate - nextTier.commissionRate) * 100)}%.
            </p>
          )}
        </div>

        {/* What's included */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            {"QuickTrade's fee covers:"}
          </p>
          {[
            'Secure escrow payment protection',
            'Auto-generated legal contract',
            'Dispute resolution & mediation',
            'QuickTrade Guarantee',
            'Verified review on your profile',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-500 flex-shrink-0">✓</span>
              {item}
            </div>
          ))}
        </div>

        {/* Key messaging */}
        <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3 text-center">
          <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
            💡 You only pay when you get paid — no upfront costs, ever.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
