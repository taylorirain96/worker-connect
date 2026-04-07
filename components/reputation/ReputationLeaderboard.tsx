'use client'

import type { ReputationLeaderboardEntry } from '@/types/reputation'
import { TrustShields } from './TrustShields'

interface Props {
  entries: ReputationLeaderboardEntry[]
}

const TIER_BADGE: Record<string, string> = {
  Rookie: 'bg-gray-100 text-gray-700',
  Professional: 'bg-blue-100 text-blue-700',
  Expert: 'bg-purple-100 text-purple-700',
  Master: 'bg-amber-100 text-amber-700',
}

const RANK_STYLES = ['text-amber-500', 'text-gray-400', 'text-orange-400']

export function ReputationLeaderboard({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">No leaderboard data yet.</div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Worker</th>
            <th className="px-4 py-3 text-right">Score</th>
            <th className="px-4 py-3 text-center">Tier</th>
            <th className="px-4 py-3 text-center">Shields</th>
            <th className="px-4 py-3 text-right">Completion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, idx) => (
            <tr key={entry.workerId} className="hover:bg-gray-50 transition-colors">
              <td
                className={`px-4 py-3 font-bold ${RANK_STYLES[idx] ?? 'text-gray-700'}`}
              >
                {idx + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {entry.workerAvatar ? (
                    <img
                      src={entry.workerAvatar}
                      alt={entry.workerName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                      {entry.workerName[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{entry.workerName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {entry.reputationScore}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[entry.tier] ?? ''}`}
                >
                  {entry.tier}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <TrustShields count={entry.trustShields} size="sm" />
                </div>
              </td>
              <td className="px-4 py-3 text-right text-gray-700">
                {entry.completionRate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
