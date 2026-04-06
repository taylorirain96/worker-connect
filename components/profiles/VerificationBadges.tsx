'use client'
import type { UserProfile } from '@/types'

interface VerificationBadgesProps {
  profile: Pick<UserProfile, 'verifiedDetails' | 'verificationLevel' | 'completedJobs' | 'reviewCount'>
  size?: 'sm' | 'md'
}

interface BadgeItem {
  key: 'id' | 'responded' | 'reviews'
  label: string
  icon: string
  tooltip: string
}

const BADGES: BadgeItem[] = [
  { key: 'id', label: 'ID Verified', icon: '✓', tooltip: 'Identity has been verified' },
  { key: 'responded', label: 'Responsive', icon: '✓', tooltip: 'Responded to 10+ job applications' },
  { key: 'reviews', label: '5+ Reviews', icon: '✓', tooltip: 'Has received 5 or more reviews' },
]

function computeVerified(
  profile: VerificationBadgesProps['profile']
): Record<'id' | 'responded' | 'reviews', boolean> {
  const explicit = profile.verifiedDetails
  return {
    id: explicit?.id ?? false,
    responded: explicit?.responded ?? (profile.completedJobs ?? 0) >= 10,
    reviews: explicit?.reviews ?? (profile.reviewCount ?? 0) >= 5,
  }
}

export default function VerificationBadges({ profile, size = 'md' }: VerificationBadgesProps) {
  const verified = computeVerified(profile)
  const earnedBadges = BADGES.filter((b) => verified[b.key])

  if (earnedBadges.length === 0) return null

  const baseClass =
    size === 'sm'
      ? 'group relative flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'
      : 'group relative flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400'

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {earnedBadges.map((badge) => (
        <span key={badge.key} className={baseClass} title={badge.tooltip}>
          <span
            className={`flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ${
              size === 'sm' ? 'h-3.5 w-3.5 text-[9px]' : 'h-4 w-4 text-[10px]'
            }`}
          >
            {badge.icon}
          </span>
          {size === 'md' && (
            <span className="hidden sm:inline">{badge.label}</span>
          )}
          {/* Tooltip */}
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-[10px] bg-gray-900 text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {badge.tooltip}
          </span>
        </span>
      ))}
    </div>
  )
}
