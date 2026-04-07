'use client'
import { getTierLabel, getTierColor } from '@/lib/utils/reputationAlgorithm'
import TrustShields from './TrustShields'
import type { ReputationScore as IReputationScore } from '@/types/reputation'

interface Props {
  score: IReputationScore
}

export default function ReputationScore({ score }: Props) {
  const tierLabel = getTierLabel(score.tier)
  const tierColor = getTierColor(score.tier)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center gap-4">
      <div className="relative">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={score.tier === 'master' ? '#EAB308' : score.tier === 'expert' ? '#8B5CF6' : score.tier === 'professional' ? '#3B82F6' : '#6B7280'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score.score / 100) * 339.3} 339.3`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score.score}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <div>
        <span className={`text-lg font-bold ${tierColor}`}>{tierLabel}</span>
        <p className="text-sm text-gray-500 mt-0.5">Reputation Tier</p>
      </div>
      <TrustShields count={score.trustShields} size="md" />
      <div className="grid grid-cols-2 gap-3 w-full text-left">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Completion Rate</p>
          <p className="text-lg font-bold text-gray-900">{score.completionRate}%</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Avg Rating</p>
          <p className="text-lg font-bold text-gray-900">⭐ {score.averageRating.toFixed(1)}</p>
        </div>
      </div>
    </div>
  )
}
