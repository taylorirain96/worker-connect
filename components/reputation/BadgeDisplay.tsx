'use client'

import { cn } from '@/lib/utils'
import type { EarnedBadge, AvailableBadge, BadgeTier } from '@/types/reputation'

const TIER_STYLES: Record<BadgeTier, { ring: string; bg: string }> = {
  bronze: { ring: 'ring-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  silver: { ring: 'ring-gray-400', bg: 'bg-gray-50 dark:bg-gray-700/30' },
  gold: { ring: 'ring-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  platinum: { ring: 'ring-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
}

interface Props {
  earned: EarnedBadge[]
  available: AvailableBadge[]
  onClaim?: (badgeId: string) => void
  className?: string
}

export default function BadgeDisplay({ earned, available, onClaim, className }: Props) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Earned */}
      <section>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Earned Badges <span className="text-gray-400 font-normal">({earned.length})</span>
        </h3>
        {earned.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No badges earned yet. Complete jobs to earn your first badge!</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {earned.map((badge) => {
              const styles = TIER_STYLES[badge.tier]
              return (
                <div
                  key={badge.id}
                  title={badge.description}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl ring-2 cursor-default',
                    styles.ring, styles.bg
                  )}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 leading-tight">{badge.name}</span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Available (in-progress) */}
      {available.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">In Progress</h3>
          <div className="space-y-3">
            {available.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4"
              >
                <span className="text-2xl flex-shrink-0">{badge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{badge.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{badge.requirement}</p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{badge.progress}%</span>
                {badge.progress >= 100 && (
                  <button
                    onClick={() => onClaim?.(badge.id)}
                    className="flex-shrink-0 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
