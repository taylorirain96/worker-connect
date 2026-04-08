'use client'

import { useState, useEffect } from 'react'
import type { CareerPath } from '@/types'

export default function CareerTransitionMetrics() {
  const [paths, setPaths] = useState<CareerPath[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/career-paths')
      .then(r => r.json())
      .then(d => setPaths(d.paths ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const avgSuccessRate = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.successRate, 0) / paths.length)
    : 0
  const avgTime = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.averageTimeToComplete, 0) / paths.length)
    : 0

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Career Transition Metrics</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : paths.length}</p>
          <p className="text-sm text-gray-500 mt-1">Career Paths</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{loading ? '...' : `${avgSuccessRate}%`}</p>
          <p className="text-sm text-gray-500 mt-1">Avg Success Rate</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{loading ? '...' : `${avgTime}mo`}</p>
          <p className="text-sm text-gray-500 mt-1">Avg Completion</p>
        </div>
      </div>
      {!loading && paths.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900 text-sm">Active Career Paths</h3>
          </div>
          <div className="divide-y">
            {paths.map(path => (
              <div key={path.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{path.fromSkill}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">{path.toSkill}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{path.steps.length} steps</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-green-600">{path.successRate}%</p>
                  <p className="text-xs text-gray-400">{path.averageTimeToComplete}mo avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!loading && paths.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No career paths configured yet</p>
        </div>
      )}
    </div>
  )
}
