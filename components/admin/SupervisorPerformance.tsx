'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  supervisorId: string
  totalTrained: number
  averageScore: number
  certified: number
}

export default function SupervisorPerformance() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/supervisor/leaderboard')
      .then(r => r.json())
      .then(d => setEntries(d.leaderboard ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalSupervisors = entries.length
  const totalTrained = entries.reduce((s, e) => s + e.totalTrained, 0)
  const totalCertified = entries.reduce((s, e) => s + e.certified, 0)
  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((s, e) => s + e.averageScore, 0) / entries.length)
    : 0

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Supervisor Performance</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Supervisors', value: totalSupervisors, color: 'blue' },
          { label: 'Total Trained', value: totalTrained, color: 'green' },
          { label: 'Certified', value: totalCertified, color: 'purple' },
          { label: 'Platform Avg Score', value: avgScore, color: 'orange' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {!loading && entries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">All Supervisors</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Supervisor</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Trained</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Certified</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Avg Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map(e => (
                  <tr key={e.supervisorId} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{e.supervisorId.slice(-8)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{e.totalTrained}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{e.certified}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold ${e.averageScore >= 80 ? 'text-green-600' : e.averageScore >= 60 ? 'text-blue-600' : 'text-red-600'}`}>
                        {e.averageScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
