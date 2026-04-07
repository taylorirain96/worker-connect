'use client'

import { cn } from '@/lib/utils'
import type { VerificationItem } from '@/types/reputation'

interface Props {
  backgroundCheck: VerificationItem
  onInitiate?: () => void
  className?: string
}

const STEPS = [
  { label: 'Identity confirmed', icon: '🪪' },
  { label: 'Criminal records check', icon: '🔍' },
  { label: 'Sex offender registry', icon: '🔒' },
  { label: 'Report generated', icon: '📄' },
]

export default function BackgroundCheckStatus({ backgroundCheck, onInitiate, className }: Props) {
  const status = backgroundCheck.status

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🔍</span>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Background Check</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {status === 'verified'
              ? `Verified on ${backgroundCheck.verifiedAt ? new Date(backgroundCheck.verifiedAt).toLocaleDateString() : 'N/A'}`
              : status === 'pending'
              ? 'In progress – typically 2–3 business days'
              : 'Not initiated'}
          </p>
        </div>
      </div>

      {/* Step timeline */}
      <ol className="relative border-l border-gray-200 dark:border-gray-600 ml-3 space-y-4">
        {STEPS.map((step, i) => {
          const done = status === 'verified' || (status === 'pending' && i < 2)
          return (
            <li key={i} className="ml-4">
              <span className={cn(
                'absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900',
                done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              )} />
              <span className={cn(
                'text-sm',
                done ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
              )}>
                {step.icon} {step.label}
              </span>
            </li>
          )
        })}
      </ol>

      {status === 'unverified' && (
        <button
          onClick={onInitiate}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
        >
          Initiate Background Check
        </button>
      )}

      {status === 'verified' && (
        <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400">
          <span>✓</span>
          <span className="text-sm font-medium">All clear – no adverse records found</span>
        </div>
      )}
    </div>
  )
}
