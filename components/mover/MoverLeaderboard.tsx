'use client'

import { MapPin } from 'lucide-react'
import type { MoverLeaderboardEntry } from '@/types/reputation'

interface Props {
  entries: MoverLeaderboardEntry[]
}

export function MoverLeaderboard({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">No mover data yet.</div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Worker</th>
            <th className="px-4 py-3 text-left">Target City</th>
            <th className="px-4 py-3 text-right">Success Rate</th>
            <th className="px-4 py-3 text-right">Completion</th>
            <th className="px-4 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, idx) => (
            <tr key={entry.workerId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
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
              <td className="px-4 py-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {entry.targetRelocationCity || '—'}
                </div>
              </td>
              <td className="px-4 py-3 text-right text-green-700 font-semibold">
                {entry.relocationSuccessRate}%
              </td>
              <td className="px-4 py-3 text-right text-gray-700">
                {entry.completionRate}%
              </td>
              <td className="px-4 py-3 text-right font-bold text-indigo-700">
                {entry.reputationScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
