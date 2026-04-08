'use client'

import { useState, useEffect } from 'react'
import type { LearningJob } from '@/types'

export default function LearningJobsAnalytics() {
  const [jobs, setJobs] = useState<LearningJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/learning-jobs')
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const total = jobs.length
  const completed = jobs.filter(j => j.status === 'completed').length
  const mastered = jobs.filter(j => j.status === 'mastered').length
  const active = jobs.filter(j => j.status === 'active').length
  const certEligible = jobs.filter(j => j.certificationEligible).length

  const skillCounts: Record<string, number> = {}
  jobs.forEach(j => {
    skillCounts[j.skillBeingTaught] = (skillCounts[j.skillBeingTaught] ?? 0) + 1
  })
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Learning Jobs Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Learning Jobs', value: total, color: 'blue' },
          { label: 'Active', value: active, color: 'yellow' },
          { label: 'Completed', value: completed, color: 'green' },
          { label: 'Mastered', value: mastered, color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4 text-center`}>
            <p className={`text-3xl font-bold text-${stat.color}-700`}>{loading ? '...' : stat.value}</p>
            <p className={`text-sm text-${stat.color}-600 mt-1`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {topSkills.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Top Skills Being Taught</h3>
          <div className="space-y-3">
            {topSkills.map(([skill, count]) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-32 truncate">{skill}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Certification Eligible</h3>
          <span className="text-2xl font-bold text-purple-600">{loading ? '...' : certEligible}</span>
        </div>
        <p className="text-sm text-gray-500">
          {total > 0 ? Math.round((certEligible / total) * 100) : 0}% of all learning jobs offer certification
        </p>
      </div>
    </div>
  )
}
