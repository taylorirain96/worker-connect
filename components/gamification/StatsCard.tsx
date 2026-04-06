'use client'
import { useEffect, useState } from 'react'
import { getUserStats, calculateWorkerLevel, pointsToNextLevel, LEVEL_ICONS, BADGE_DEFINITIONS } from '@/lib/services/gamificationService'
import type { UserProfile, UserStats } from '@/types'

interface StatsCardProps {
  profile: UserProfile
}

const LEVEL_COLORS = {
  bronze: 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
  silver: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  gold: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
  platinum: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
}

export default function StatsCard({ profile }: StatsCardProps) {
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    getUserStats(profile.uid).then(setStats)
  }, [profile.uid])

  const allTimePoints = stats?.allTimePoints ?? profile.allTimePoints ?? 0
  const level = calculateWorkerLevel(allTimePoints)
  const nextLevel = pointsToNextLevel(allTimePoints)
  const completedJobs = stats?.completedJobs ?? profile.completedJobs ?? 0
  const rating = profile.rating ?? 0
  const reviewCount = profile.reviewCount ?? 0
  const badges = stats?.badges ?? profile.badges ?? []

  const progressPct = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((allTimePoints - (allTimePoints - (nextLevel.remaining))) /
            nextLevel.remaining) *
            100
        )
      )
    : 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      {/* Level & Points */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${LEVEL_COLORS[level]}`}>
          <span>{LEVEL_ICONS[level]}</span>
          <span className="capitalize">{level} Level</span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{allTimePoints.toLocaleString()} pts</p>
          {nextLevel && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {nextLevel.remaining} to {nextLevel.next}
            </p>
          )}
        </div>
      </div>

      {/* Points progress bar */}
      {nextLevel && (
        <div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900 dark:text-white">✅ {completedJobs}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jobs Done</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ⭐ {rating > 0 ? rating.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900 dark:text-white">🏅 {badges.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Badges</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Earned Badges</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badgeId) => {
              const badge = BADGE_DEFINITIONS[badgeId]
              if (!badge) return null
              return (
                <span
                  key={badgeId}
                  title={badge.description}
                  className="flex items-center gap-1 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full"
                >
                  {badge.icon} {badge.label}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
