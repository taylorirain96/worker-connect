'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronUp, ChevronDown, Minus, Star } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { RANK_BONUSES, LEADERBOARD_BADGE_DEFINITIONS } from '@/lib/leaderboard/rankingLogic'
import { JOB_CATEGORIES } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface LeaderboardCardProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
}

function TrendPill({ trend }: { trend: LeaderboardEntry['trend'] }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-emerald-500/20 text-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.6)]">
        <ChevronUp className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-rose-500/20 text-rose-300 shadow-[0_0_6px_rgba(244,63,94,0.6)]">
        <ChevronDown className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  if (trend === 'same') {
    return (
      <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-slate-500/20 text-slate-400">
        <Minus className="h-3 w-3" strokeWidth={3} />
      </span>
    )
  }
  return <span className="text-[10px] font-bold text-cyan-400">NEW</span>
}

export default function LeaderboardCard({ entry, isCurrentUser = false }: LeaderboardCardProps) {
  const bonus = entry.rank <= 3 ? RANK_BONUSES[entry.rank as 1 | 2 | 3] : null
  const categoryInfo = JOB_CATEGORIES.find((c) => c.id === entry.category)

  return (
    <Link href={`/workers/${entry.userId}`} className="block">
      <div
        className={[
          'flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-xl border bg-slate-900/70 backdrop-blur',
          'transition-all hover:-translate-y-0.5 hover:bg-slate-900',
          isCurrentUser
            ? 'border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
            : 'border-emerald-500/15 hover:border-emerald-400/40 hover:shadow-[0_0_15px_rgba(52,211,153,0.25)]',
        ].join(' ')}
      >
        {/* Rank number */}
        <span className="w-7 text-right font-mono text-sm font-bold text-emerald-300/70 tabular-nums">
          {entry.rank}
        </span>

        {/* Avatar tile */}
        <div className="relative flex-shrink-0">
          <div className="h-10 w-10 rounded-lg overflow-hidden border border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-600 to-violet-700 shadow-[0_0_10px_rgba(217,70,239,0.35)] flex items-center justify-center">
            {entry.photoURL ? (
              <Image
                src={entry.photoURL}
                alt={entry.displayName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {getInitials(entry.displayName || 'W')}
              </span>
            )}
          </div>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wide text-sm text-emerald-300 truncate drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]">
              {entry.displayName || 'Player Name'}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider">
                You
              </span>
            )}
          </div>

          {(categoryInfo || entry.rating !== undefined || bonus) && (
            <div className="flex items-center gap-3 mt-0.5 flex-wrap text-[11px] text-emerald-200/60">
              {categoryInfo && <span className="uppercase tracking-wide">{categoryInfo.label}</span>}
              {entry.rating !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                  {entry.rating.toFixed(1)}
                </span>
              )}
              {bonus && (
                <span className="text-yellow-300/90">+{bonus.bonusPoints} bonus</span>
              )}
            </div>
          )}

          {entry.badges && entry.badges.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {entry.badges.map((b) => {
                const def = LEADERBOARD_BADGE_DEFINITIONS[b]
                if (!def) return null
                return (
                  <span
                    key={b}
                    title={def.description}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200"
                  >
                    {def.icon} {def.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Points */}
        <div className="flex-shrink-0 text-right">
          <p className="font-mono text-base font-extrabold text-emerald-300 tabular-nums drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">
            {entry.weeklyPoints.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-200/50 -mt-0.5">{entry.jobsCompleted} jobs</p>
        </div>

        {/* Trend indicator */}
        <div className="flex-shrink-0 w-6 flex justify-center">
          <TrendPill trend={entry.trend} />
        </div>
      </div>
    </Link>
  )
}
