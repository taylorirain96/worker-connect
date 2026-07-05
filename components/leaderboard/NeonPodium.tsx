import Link from 'next/link'
import Image from 'next/image'
import { Crown, User as UserIcon } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/leaderboard/rankingLogic'
import { getInitials } from '@/lib/utils'

interface NeonPodiumProps {
  topThree: LeaderboardEntry[]
  currentUserId?: string
}

/**
 * Neon arcade-style podium for the top 3 entries.
 *  - #1 centered and elevated with a crown and yellow neon glow
 *  - #2 on the left with cyan neon border + red ▼ trend indicator
 *  - #3 on the right with cyan neon border + green ▲ trend indicator
 */
export default function NeonPodium({ topThree, currentUserId }: NeonPodiumProps) {
  const first = topThree.find((e) => e.rank === 1)
  const second = topThree.find((e) => e.rank === 2)
  const third = topThree.find((e) => e.rank === 3)

  return (
    <div className="relative flex items-end justify-center gap-4 sm:gap-8 px-2 pt-10 pb-8">
      {/* #2 */}
      <div className="flex flex-col items-center pb-4">
        {second ? (
          <PodiumTile entry={second} accent="cyan" trend="down" isCurrentUser={second.userId === currentUserId} />
        ) : (
          <PodiumPlaceholder rank={2} accent="cyan" />
        )}
      </div>

      {/* #1 (elevated) */}
      <div className="flex flex-col items-center -mt-6">
        {first ? (
          <PodiumTile entry={first} accent="gold" crowned isCurrentUser={first.userId === currentUserId} />
        ) : (
          <PodiumPlaceholder rank={1} accent="gold" crowned />
        )}
      </div>

      {/* #3 */}
      <div className="flex flex-col items-center pb-4">
        {third ? (
          <PodiumTile entry={third} accent="cyan" trend="up" isCurrentUser={third.userId === currentUserId} />
        ) : (
          <PodiumPlaceholder rank={3} accent="cyan" />
        )}
      </div>
    </div>
  )
}

type Accent = 'gold' | 'cyan'

interface PodiumTileProps {
  entry: LeaderboardEntry
  accent: Accent
  crowned?: boolean
  trend?: 'up' | 'down'
  isCurrentUser?: boolean
}

function PodiumTile({ entry, accent, crowned, trend, isCurrentUser }: PodiumTileProps) {
  const tileSize = crowned ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-20 w-20 sm:h-24 sm:w-24'
  const ringColor =
    accent === 'gold'
      ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.7),inset_0_0_15px_rgba(250,204,21,0.25)]'
      : 'border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55),inset_0_0_10px_rgba(34,211,238,0.2)]'
  const rankPill =
    accent === 'gold'
      ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.8)]'
      : entry.rank === 2
        ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.7)]'
        : 'bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.7)]'

  return (
    <Link href={`/workers/${entry.userId}`} className="group block">
      <div className="flex flex-col items-center">
        {/* Crown for #1 */}
        {crowned && (
          <Crown
            className="h-7 w-7 text-yellow-300 mb-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] -mb-1"
            fill="currentColor"
            strokeWidth={1.5}
          />
        )}

        {/* Trend triangle above tile for non-crowned */}
        {!crowned && trend === 'down' && (
          <span className="text-rose-500 text-xs -mb-1 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]">▼</span>
        )}
        {!crowned && trend === 'up' && (
          <span className="text-emerald-400 text-xs -mb-1 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]">▲</span>
        )}

        <div className="relative">
          <div
            className={[
              tileSize,
              'rounded-2xl border-2 bg-gradient-to-br from-fuchsia-600/80 via-purple-600/80 to-violet-700/80',
              'flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-0.5',
              ringColor,
              isCurrentUser ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-cyan-300' : '',
            ].join(' ')}
          >
            {entry.photoURL ? (
              <Image
                src={entry.photoURL}
                alt={entry.displayName}
                width={112}
                height={112}
                className="h-full w-full object-cover"
              />
            ) : entry.displayName ? (
              <span className="text-white font-black text-xl drop-shadow">
                {getInitials(entry.displayName)}
              </span>
            ) : (
              <UserIcon className="h-10 w-10 text-white/90" strokeWidth={2.5} />
            )}
          </div>

          {/* Rank pill centered at the bottom edge */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3">
            <span
              className={[
                'inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-md text-xs font-black',
                rankPill,
              ].join(' ')}
            >
              {entry.rank}
            </span>
          </div>
        </div>

        {/* Name + score */}
        <div className="mt-5 text-center max-w-[7rem] sm:max-w-[8rem]">
          <p
            className={[
              'text-xs font-bold uppercase tracking-wide truncate',
              accent === 'gold' ? 'text-yellow-300' : 'text-emerald-300',
            ].join(' ')}
          >
            {entry.displayName}
          </p>
          <p className="text-[11px] text-cyan-300/80 mt-0.5 font-mono">
            {entry.weeklyPoints.toLocaleString()} pts
          </p>
        </div>
      </div>
    </Link>
  )
}

function PodiumPlaceholder({ rank, accent, crowned }: { rank: number; accent: Accent; crowned?: boolean }) {
  const tileSize = crowned ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-20 w-20 sm:h-24 sm:w-24'
  const ringColor =
    accent === 'gold'
      ? 'border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
      : 'border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'

  return (
    <div className="flex flex-col items-center">
      {crowned && <Crown className="h-7 w-7 text-yellow-300/60 mb-1" strokeWidth={1.5} />}
      <div className="relative">
        <div
          className={[
            tileSize,
            'rounded-2xl border-2 bg-slate-800/60 flex items-center justify-center',
            ringColor,
          ].join(' ')}
        >
          <UserIcon className="h-9 w-9 text-slate-500" strokeWidth={2} />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3">
          <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-md text-xs font-black bg-slate-700 text-slate-300">
            {rank}
          </span>
        </div>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase text-slate-500">—</p>
    </div>
  )
}
