'use client'

import { useState, useEffect } from 'react'

interface SupervisorStats {
  totalTrained: number
  certified: number
  averageScore: number
  reports: {
    id: string
    workerId: string
    competencyAssessment: number
    readyForIndependent: boolean
    certifyingSkill: boolean
    createdAt: string
  }[]
}

interface SupervisorDashboardProps {
  supervisorId: string
}

export default function SupervisorDashboard({ supervisorId }: SupervisorDashboardProps) {
  const [stats, setStats] = useState<SupervisorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/supervisor/stats?supervisorId=${supervisorId}`)
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [supervisorId])

  if (loading) {
    return <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
  }

  if (!stats) return null

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Supervisor Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{stats.totalTrained}</p>
          <p className="text-sm text-blue-600 mt-1">Workers Trained</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{stats.certified}</p>
          <p className="text-sm text-green-600 mt-1">Certified</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">{stats.averageScore}</p>
          <p className="text-sm text-purple-600 mt-1">Avg Score</p>
        </div>
      </div>

      {stats.reports.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">Recent Reports</h3>
          </div>
          <div className="divide-y">
            {stats.reports.slice(0, 5).map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Worker: {r.workerId.slice(-6)}</p>
                  <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${r.competencyAssessment}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{r.competencyAssessment}</span>
                  {r.certifyingSkill && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">🎓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
