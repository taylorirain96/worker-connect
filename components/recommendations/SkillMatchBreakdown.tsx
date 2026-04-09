'use client'
import type { JobRecommendation } from '@/types'

interface Props { breakdown: JobRecommendation['breakdown'] }

const LABELS: Record<keyof JobRecommendation['breakdown'], string> = {
  skills:         'Skills Match',
  rating:         'Rating Score',
  location:       'Location',
  availability:   'Availability',
  specialization: 'Specialization',
}

export default function SkillMatchBreakdown({ breakdown }: Props) {
  return (
    <div className="space-y-2">
      {(Object.keys(breakdown) as Array<keyof JobRecommendation['breakdown']>).map((key) => (
        <div key={key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-300">{LABELS[key]}</span>
            <span className="font-medium">{breakdown[key]}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${breakdown[key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
