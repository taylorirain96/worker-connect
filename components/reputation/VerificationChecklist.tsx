'use client'

import { cn } from '@/lib/utils'
import type { VerificationProfile, VerificationType } from '@/types/reputation'

const STEPS: { key: VerificationType; label: string; icon: string }[] = [
  { key: 'governmentId', label: 'Government ID', icon: '🪪' },
  { key: 'backgroundCheck', label: 'Background Check', icon: '🔍' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️' },
  { key: 'certifications', label: 'Certifications', icon: '📜' },
  { key: 'bbbRating', label: 'BBB / Google Rating', icon: '⭐' },
]

interface Props {
  profile: VerificationProfile | null
  onStart?: (type: VerificationType) => void
  className?: string
}

export default function VerificationChecklist({ profile, onStart, className }: Props) {
  const getStatus = (key: VerificationType) => {
    if (!profile) return 'unverified'
    if (key === 'certifications') {
      return profile.certifications.length > 0 ? 'verified' : 'unverified'
    }
    return profile[key].status
  }

  const level = profile?.verificationLevel ?? 0

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Identity Verification</h2>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{level}/5 verified</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${(level / 5) * 100}%` }}
        />
      </div>

      <ul className="space-y-3">
        {STEPS.map(({ key, label, icon }) => {
          const status = getStatus(key)
          const isVerified = status === 'verified'
          const isPending = status === 'pending'

          return (
            <li key={key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{icon}</span>
                <div className="min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isVerified ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {label}
                  </p>
                  {isPending && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Pending review</p>
                  )}
                </div>
              </div>

              {isVerified ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  ✓ Verified
                </span>
              ) : isPending ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                  ⏳ Pending
                </span>
              ) : (
                <button
                  onClick={() => onStart?.(key)}
                  className="flex-shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Verify →
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
