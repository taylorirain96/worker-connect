'use client'

import { useState, useEffect } from 'react'
import type { LearningJob } from '@/types'
import LearningJobCard from './LearningJobCard'

interface LearningJobBoardProps {
  currentUserId?: string
}

export default function LearningJobBoard({ currentUserId }: LearningJobBoardProps) {
  const [jobs, setJobs] = useState<LearningJob[]>([])
  const [loading, setLoading] = useState(true)
  const [skill, setSkill] = useState('')
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const url = skill ? `/api/learning-jobs?skill=${encodeURIComponent(skill)}` : '/api/learning-jobs'
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [skill])

  async function handleApply(jobId: string) {
    if (!currentUserId) return
    const res = await fetch(`/api/learning-jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: currentUserId }),
    })
    if (res.ok) {
      setAppliedIds(prev => new Set(prev).add(jobId))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900 flex-1">Learning Job Board</h2>
        <input
          type="text"
          value={skill}
          onChange={e => setSkill(e.target.value)}
          placeholder="Filter by skill..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-2xl mb-2">🎓</p>
          <p className="text-lg font-medium">No learning jobs found</p>
          <p className="text-sm mt-1">
            {skill ? `No training opportunities for "${skill}" right now` : 'Check back soon for training opportunities'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <LearningJobCard
              key={job.id}
              job={job}
              onApply={currentUserId ? handleApply : undefined}
              applied={appliedIds.has(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
