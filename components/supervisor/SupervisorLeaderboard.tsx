'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  supervisorId: string
  totalTrained: number
  averageScore: number
  certified: number
}

export default function SupervisorLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supervisor/leaderboard')
      .then(r => r.json())
      .then(d => setEntries(d.leaderboard ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <h2 className="text-white font-bold text-lg">Top Supervisors</h2>
        <p className="text-purple-200 text-sm">Best trainers on the platform</p>
      </div>
      {loading ? (
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No supervisors yet</p>
        </div>
      ) : (
        <div className="divide-y">
          {entries.map((entry, i) => (
            <div key={entry.supervisorId} className="flex items-center gap-4 px-5 py-3">
              <span className="text-2xl w-8">{medals[i] ?? `#${i + 1}`}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  Supervisor {entry.supervisorId.slice(-6)}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.totalTrained} trained · {entry.certified} certified
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{entry.averageScore}</p>
                <p className="text-xs text-gray-400">avg score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
