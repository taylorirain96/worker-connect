'use client'

import type { ReputationScore as RS } from '@/types/reputation'
import { TrustShields } from './TrustShields'

interface Props {
  score: RS
}

const TIER_COLORS: Record<string, string> = {
  Rookie: 'text-gray-600 bg-gray-100',
  Professional: 'text-blue-700 bg-blue-100',
  Expert: 'text-purple-700 bg-purple-100',
  Master: 'text-amber-700 bg-amber-100',
}

export function ReputationScore({ score }: Props) {
  const { overallScore, tier, trustShields } = score

  // SVG gauge constants
  const r = 54
  const cx = 64
  const cy = 64
  const circumference = 2 * Math.PI * r
  const progress = circumference - (overallScore / 100) * circumference

  const tierColor = TIER_COLORS[tier] ?? TIER_COLORS.Rookie

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-md">
      {/* Circular gauge */}
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#6366f1"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className="transition-all duration-700"
        />
      </svg>

      {/* Score label overlaid */}
      <div className="-mt-[104px] mb-10 flex flex-col items-center pointer-events-none">
        <span className="text-3xl font-bold text-gray-900">{overallScore}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wide">/ 100</span>
      </div>

      {/* Tier badge */}
      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${tierColor}`}>
        {tier}
      </span>

      {/* Trust shields */}
      <TrustShields count={trustShields} />
    </div>
  )
}
