'use client'

import { useState, useEffect } from 'react'
import type { CareerPath } from '@/types'

interface CareerPathMapProps {
  currentSkill?: string
}

export default function CareerPathMap({ currentSkill }: CareerPathMapProps) {
  const [paths, setPaths] = useState<CareerPath[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CareerPath | null>(null)

  useEffect(() => {
    fetch('/api/career-paths')
      .then(r => r.json())
      .then(d => setPaths(d.paths ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = currentSkill
    ? paths.filter(p => p.fromSkill.toLowerCase().includes(currentSkill.toLowerCase()))
    : paths

  if (loading) {
    return <div className="bg-gray-100 rounded-xl h-40 animate-pulse" />
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Career Path Map</h2>
      {currentSkill && (
        <p className="text-sm text-gray-500">Showing paths from: <span className="font-medium text-blue-600">{currentSkill}</span></p>
      )}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No career paths available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(path => (
            <button
              key={path.id}
              onClick={() => setSelected(selected?.id === path.id ? null : path)}
              className={`text-left border rounded-xl p-4 transition-all ${
                selected?.id === path.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-medium">{path.fromSkill}</span>
                <span className="text-gray-400">→</span>
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-sm font-medium">{path.toSkill}</span>
              </div>
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span>{path.steps.length} steps</span>
                <span>·</span>
                <span>{path.successRate}% success</span>
                <span>·</span>
                <span>{path.averageTimeToComplete} months</span>
              </div>
              {selected?.id === path.id && (
                <div className="mt-3 space-y-1.5">
                  {path.steps.map(step => (
                    <div key={step.step} className="flex gap-2 text-sm">
                      <span className="text-blue-500 font-bold">{step.step}.</span>
                      <span className="text-gray-700">{step.title}</span>
                      <span className="text-gray-400 text-xs ml-auto">{step.timeEstimate}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
