'use client'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Minus, Star, Briefcase } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { RANK_BONUSES } from '@/lib/leaderboard/rankingLogic'
import { LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import { JOB_CATEGORIES } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function TrendIcon({ trend }: { trend: LeaderboardEntry['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
  if (trend === 'same') return <Minus className="h-4 w-4 text-gray-400" />
  return <span className="text-xs font-medium text-blue-500">NEW</span>
}

export default function LeaderboardCard({ entry, isCurrentUser = false }: LeaderboardCardProps) {
  const medal = RANK_MEDAL[entry.rank]
  const bonus = entry.rank <= 3 ? RANK_BONUSES[entry.rank as 1 | 2 | 3] : null
  const categoryInfo = JOB_CATEGORIES.find((c) => c.id === entry.category)
  const isTopThree = entry.rank <= 3

  return (
    <Link href={`/workers/${entry.userId}`} className="block">
      <div
        className={[
          'flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md',
          isCurrentUser
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
            : isTopThree
            ? 'border-yellow-200 bg-yellow-50/40 dark:bg-yellow-900/10 dark:border-yellow-800 hover:border-yellow-300'
            : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        ].join(' ')}
      >
        {/* Rank */}
        <div className="w-10 flex-shrink-0 text-center">
          {medal ? (
            <span className="text-2xl">{medal}</span>
          ) : (
            <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
              #{entry.rank}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {entry.photoURL ? (
            <Image
              src={entry.photoURL}
              alt={entry.displayName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
              {getInitials(entry.displayName || 'W')}
            </div>
          )}
          {isTopThree && (
            <span className="absolute -bottom-1 -right-1 text-sm">{medal}</span>
          )}
        </div>

        {/* Name + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {entry.displayName}
            </span>
            {isCurrentUser && (
              <Badge variant="primary" className="text-xs">You</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {categoryInfo && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${categoryInfo.color}`}>
                {categoryInfo.icon} {categoryInfo.label}
              </span>
            )}
            {entry.rating !== undefined && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {entry.rating.toFixed(1)}
              </span>
            )}
            {bonus && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                +{bonus.bonusPoints} bonus pts
              </span>
            )}
          </div>

          {/* Leaderboard badges */}
          {entry.badges && entry.badges.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {entry.badges.map((b) => {
                const def = LEADERBOARD_BADGE_DEFINITIONS[b]
                if (!def) return null
                return (
                  <span
                    key={b}
                    title={def.description}
                    className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full"
                  >
                    {def.icon} {def.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {entry.weeklyPoints.toLocaleString()} <span className="text-xs font-normal text-gray-500">pts</span>
          </p>
          <div className="flex items-center gap-1 justify-end text-xs text-gray-500 dark:text-gray-400">
            <Briefcase className="h-3 w-3" />
            {entry.jobsCompleted} jobs
          </div>
        </div>

        {/* Trend */}
        <div className="flex-shrink-0 w-8 flex justify-center">
          <TrendIcon trend={entry.trend} />
        </div>
      </div>
    </Link>
  )
}
