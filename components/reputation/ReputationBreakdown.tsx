'use client'
import type { ReputationScore } from '@/types/reputation'

interface Props {
  score: ReputationScore
}

interface Factor {
  label: string
  value: number
  weight: string
  color: string
}

export default function ReputationBreakdown({ score }: Props) {
  const factors: Factor[] = [
    { label: 'Completion Rate', value: score.completionRate, weight: '35%', color: 'bg-blue-500' },
    { label: 'Average Rating', value: (score.averageRating / 5) * 100, weight: '30%', color: 'bg-purple-500' },
    { label: 'Verification Score', value: score.verificationScore, weight: '20%', color: 'bg-green-500' },
    { label: 'Response Time', value: score.responseTimeScore, weight: '10%', color: 'bg-yellow-500' },
    { label: 'Portfolio Score', value: score.portfolioScore, weight: '5%', color: 'bg-orange-500' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Score Breakdown</h3>
      <div className="space-y-4">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-gray-700">{f.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{f.weight} weight</span>
                <span className="text-sm font-semibold text-gray-900">{Math.round(f.value)}%</span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${f.color}`}
                style={{ width: `${f.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
