'use client'

import type { ReputationScore } from '@/types/reputation'

interface Props {
  score: ReputationScore
}

const FACTORS: {
  key: keyof ReputationScore['breakdown']
  label: string
  weight: number
  color: string
}[] = [
  { key: 'completionRate', label: 'Completion Rate', weight: 35, color: 'bg-green-500' },
  { key: 'rating', label: 'Rating', weight: 30, color: 'bg-blue-500' },
  { key: 'verification', label: 'Verification', weight: 20, color: 'bg-purple-500' },
  { key: 'responseTime', label: 'Response Time', weight: 10, color: 'bg-orange-500' },
  { key: 'portfolioQuality', label: 'Portfolio', weight: 5, color: 'bg-pink-500' },
]

export function ReputationBreakdown({ score }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Score Breakdown</h3>
      {FACTORS.map(({ key, label, weight, color }) => {
        const raw = score.breakdown[key]
        // contribution = raw_score * weight%
        const contribution = Math.round((raw * weight) / 100)
        return (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {label}{' '}
                <span className="text-gray-400 font-normal">({weight}%)</span>
              </span>
              <span className="text-gray-600">
                {raw}
                <span className="text-gray-400 text-xs"> → +{contribution}pts</span>
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`${color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${raw}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
