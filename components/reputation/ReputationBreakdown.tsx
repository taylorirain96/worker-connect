import type { ReputationScore } from '@/types/reputation'

interface Props {
  score: ReputationScore
}

const FACTORS = [
  { key: 'completionRate', label: 'Completion Rate', weight: '35%' },
  { key: 'rating', label: 'Rating', weight: '30%' },
  { key: 'verification', label: 'Verification', weight: '20%' },
  { key: 'responseTime', label: 'Response Time', weight: '10%' },
  { key: 'portfolio', label: 'Portfolio', weight: '5%' },
] as const

export default function ReputationBreakdown({ score }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
      <div className="space-y-3">
        {FACTORS.map(({ key, label, weight }) => {
          const value = score.breakdown[key]
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{label} <span className="text-gray-400 text-xs">({weight})</span></span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
