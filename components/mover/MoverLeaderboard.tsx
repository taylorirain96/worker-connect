'use client'

import { cn } from '@/lib/utils'
import type { MoverLeaderboardEntry, ReputationTier } from '@/types/reputation'

const TIER_COLORS: Record<ReputationTier, string> = {
  Rookie: 'text-gray-500',
  Professional: 'text-blue-500',
  Expert: 'text-purple-500',
  Master: 'text-amber-500',
}

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface Props {
  entries: MoverLeaderboardEntry[]
  currentUserId?: string
  className?: string
}

export default function MoverLeaderboard({ entries, currentUserId, className }: Props) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">✈️ Mover Leaderboard</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Top workers by relocation success rate</p>
      </div>

      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        {entries.map((entry) => {
          const isMe = entry.userId === currentUserId
          return (
            <li
              key={entry.userId}
              className={cn(
                'flex items-center gap-4 px-6 py-3.5 transition-colors',
                isMe ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              )}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {RANK_MEDAL[entry.rank] ? (
                  <span className="text-lg">{RANK_MEDAL[entry.rank]}</span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.displayName} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="text-white text-sm font-bold">{entry.displayName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>

              {/* Name + city */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-semibold truncate',
                  isMe ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                )}>
                  {entry.displayName}
                  {isMe && <span className="ml-1 text-xs font-normal">(you)</span>}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  📍 {entry.targetCity} · <span className={TIER_COLORS[entry.tier]}>{entry.tier}</span>
                </p>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.successRate}%</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{entry.completedRelocations} relocations</p>
              </div>
            </li>
          )
        })}
      </ul>

      {entries.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">No mover data yet. Enable Mover Mode to appear here!</p>
        </div>
      )}
    </div>
  )
}
