'use client'
import { useState } from 'react'
import RecommendationCard from './RecommendationCard'
import type { JobRecommendation, RecommendationFeedback } from '@/types'

interface Props {
  recommendations: JobRecommendation[]
  workerId: string
  onFeedback?: (feedback: RecommendationFeedback) => void
}

export default function JobRecommendationsList({ recommendations, workerId, onFeedback }: Props) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = recommendations.filter((r) => !dismissed.has(r.id))

  const handleFeedback = (rec: JobRecommendation, action: RecommendationFeedback['action']) => {
    if (action === 'dismissed') setDismissed((prev) => new Set(Array.from(prev).concat(rec.id)))
    onFeedback?.({
      workerId,
      jobId: rec.jobId,
      action,
      timestamp: new Date().toISOString(),
    })
  }

  if (visible.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium">No more recommendations</p>
        <p className="text-sm mt-1">Check back later for new matches</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visible.map((rec) => (
        <RecommendationCard key={rec.id} data={rec} onFeedback={(action) => handleFeedback(rec, action)} />
      ))}
    </div>
  )
}
