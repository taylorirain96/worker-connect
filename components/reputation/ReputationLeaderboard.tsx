'use client'
import { getTierLabel, getTierColor } from '@/lib/utils/reputationAlgorithm'
import TrustShields from './TrustShields'
import type { LeaderboardEntry } from '@/types/reputation'

interface Props {
  entries: LeaderboardEntry[]
}

const RANK_STYLES: Record<number, string> = {
  1: 'text-yellow-600 font-bold',
  2: 'text-gray-500 font-bold',
  3: 'text-orange-600 font-bold',
}

export default function ReputationLeaderboard({ entries }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Top Workers</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {entries.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className={`w-8 text-center text-sm ${RANK_STYLES[entry.rank] ?? 'text-gray-600'}`}>
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </span>
            {entry.avatarUrl ? (
              <img src={entry.avatarUrl} alt={entry.displayName} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {entry.displayName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{entry.displayName}</p>
              <p className={`text-xs ${getTierColor(entry.tier)}`}>{getTierLabel(entry.tier)}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{entry.score}</p>
              <p className="text-xs text-gray-500">{entry.completionRate}% complete</p>
            </div>
            <TrustShields count={entry.trustShields} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
