'use client'
import { MapPin } from 'lucide-react'
import TrustShields from '@/components/reputation/TrustShields'
import { getTierLabel, getTierColor } from '@/lib/utils/reputationAlgorithm'
import type { MoverLeaderboardEntry } from '@/types/reputation'

interface Props {
  entries: MoverLeaderboardEntry[]
}

export default function MoverLeaderboard({ entries }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Top Mover Workers</h3>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">Relocation Ready</span>
      </div>
      <div className="divide-y divide-gray-50">
        {entries.map((entry) => (
          <div key={entry.userId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
            <span className="w-8 text-center text-sm font-bold text-gray-500">
              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {entry.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{entry.displayName}</p>
              <div className="flex items-center gap-2">
                <p className={`text-xs ${getTierColor(entry.tier)}`}>{getTierLabel(entry.tier)}</p>
                {entry.targetRelocationCity && (
                  <p className="text-xs text-gray-400 flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {entry.targetRelocationCity}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{entry.relocationSuccessRate}%</p>
              <p className="text-xs text-gray-400">success</p>
            </div>
            <TrustShields count={entry.trustShields} size="sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
