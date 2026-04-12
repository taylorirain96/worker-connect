'use client'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, TrendingDown, Minus, Star, Briefcase } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { RANK_BONUSES } from '@/lib/leaderboard/rankingLogic'
import { LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import { JOB_CATEGORIES, CATEGORY_ICONS } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import type { CategoryId } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

function TrendIcon({ trend }: { trend: LeaderboardEntry['trend'] }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
  if (trend === 'same') return <Minus className="h-4 w-4 text-gray-400" />
  return <span className="text-xs font-medium text-blue-500">NEW</span>
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
        1
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-[0_0_12px_rgba(148,163,184,0.5)] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
        2
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 shadow-[0_0_12px_rgba(251,146,60,0.4)] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
        3
      </div>
    )
  }
  return (
    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-sm flex-shrink-0">
      {rank}
    </div>
  )
}

function cardBorderClass(rank: number, isCurrentUser: boolean): string {
  if (isCurrentUser) {
    return 'ring-2 ring-indigo-500/70 border-indigo-300 dark:border-indigo-500/60 shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_6px_40px_rgba(99,102,241,0.45)]'
  }
  if (rank === 1) {
    return 'ring-2 ring-yellow-400/80 border-yellow-300/80 dark:border-yellow-500/50 shadow-[0_0_0_3px_rgba(234,179,8,0.1),0_6px_40px_rgba(234,179,8,0.5)] dark:shadow-[0_0_0_3px_rgba(234,179,8,0.1),0_6px_40px_rgba(234,179,8,0.4)]'
  }
  if (rank === 2) {
    return 'ring-2 ring-slate-400/70 border-slate-300/80 dark:border-slate-400/40 shadow-[0_0_0_3px_rgba(148,163,184,0.1),0_6px_40px_rgba(148,163,184,0.45)]'
  }
  if (rank === 3) {
    return 'ring-2 ring-orange-400/70 border-orange-300/80 dark:border-orange-400/40 shadow-[0_0_0_3px_rgba(251,146,60,0.1),0_6px_40px_rgba(251,146,60,0.4)]'
  }
  return 'ring-2 ring-black/10 dark:ring-white/10 border-gray-300 dark:border-gray-700 shadow-[0_0_0_2px_rgba(0,0,0,0.04),0_4px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.03),0_4px_30px_rgba(0,0,0,0.7)]'
}

function pointsClass(rank: number): string {
  const base = 'text-lg font-bold'
  if (rank === 1) return `${base} bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent`
  if (rank === 2) return `${base} bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent`
  if (rank === 3) return `${base} bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent`
  return `${base} text-slate-900 dark:text-white`
}

function badgePillClass(rank: number): string {
  const base = 'text-xs px-2 py-0.5 rounded-full border'
  if (rank === 1) return `${base} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-700/30`
  if (rank === 2) return `${base} bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/30`
  if (rank === 3) return `${base} bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200/60 dark:border-orange-700/30`
  return 'text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full'
}

export default function LeaderboardCard({ entry, isCurrentUser = false }: LeaderboardCardProps) {
  const bonus = entry.rank <= 3 ? RANK_BONUSES[entry.rank as 1 | 2 | 3] : null
  const categoryInfo = JOB_CATEGORIES.find((c) => c.id === entry.category)

  return (
    <Link href={`/workers/${entry.userId}`} className="block">
      <div
        className={[
          'flex items-center gap-4 p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_4px_30px_rgba(0,0,0,0.6)]',
          cardBorderClass(entry.rank, isCurrentUser),
        ].join(' ')}
      >
        {/* Rank badge */}
        <RankBadge rank={entry.rank} />

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
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.4)] flex items-center justify-center text-white text-sm font-bold">
              {getInitials(entry.displayName || 'W')}
            </div>
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
            {categoryInfo && (() => {
              const Icon = CATEGORY_ICONS[categoryInfo.id as CategoryId]
              return (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${categoryInfo.color}`}>
                  <Icon className="h-3 w-3 flex-shrink-0" /> {categoryInfo.label}
                </span>
              )
            })()}
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
                    className={badgePillClass(entry.rank)}
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
          <p className={pointsClass(entry.rank)}>
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
