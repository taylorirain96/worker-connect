'use client'

import { useState, useEffect } from 'react'
import type { SkillAspiration, Certification } from '@/types'

interface LearningHistoryProps {
  workerId: string
}

export default function LearningHistory({ workerId }: LearningHistoryProps) {
  const [aspirations, setAspirations] = useState<SkillAspiration[]>([])
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/skills/aspirations/${workerId}`).then(r => r.json()),
      fetch(`/api/certifications?workerId=${workerId}`).then(r => r.json()),
    ])
      .then(([asp, cer]) => {
        setAspirations(asp.aspirations ?? [])
        setCerts(cer.certifications ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workerId])

  if (loading) {
    return <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
  }

  const completed = aspirations.filter(a => a.status === 'completed')
  const active = aspirations.filter(a => a.status === 'active')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{aspirations.length}</p>
          <p className="text-xs text-blue-600">Goals Set</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-700">{completed.length}</p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">{certs.length}</p>
          <p className="text-xs text-purple-600">Certifications</p>
        </div>
      </div>

      {active.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">In Progress</h3>
          <div className="space-y-2">
            {active.map(a => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-medium text-gray-900 text-sm">{a.targetSkill}</p>
                  <span className="text-xs text-gray-500">{a.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${a.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Completed Learning</h3>
          <div className="space-y-2">
            {completed.map(a => (
              <div key={a.id} className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3">
                <span className="text-green-500 text-lg">✓</span>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{a.targetSkill}</p>
                  <p className="text-xs text-gray-500">{a.currentLevel} → {a.targetLevel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
