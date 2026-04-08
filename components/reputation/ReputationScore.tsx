import type { ReputationScore as ReputationScoreType } from '@/types/reputation'
import TrustShields from './TrustShields'

interface Props {
  score: ReputationScoreType
}

const TIER_COLORS: Record<string, string> = {
  rookie: 'text-gray-600 bg-gray-100',
  professional: 'text-blue-700 bg-blue-100',
  expert: 'text-purple-700 bg-purple-100',
  master: 'text-yellow-700 bg-yellow-100',
}

export default function ReputationScore({ score }: Props) {
  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (score.score / 100) * circumference

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-4">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke="#3b82f6" strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score.score}</span>
        </div>
      </div>
      <span className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${TIER_COLORS[score.tier]}`}>
        {score.tier}
      </span>
      <TrustShields shields={score.trustShields} />
    </div>
  )
}
