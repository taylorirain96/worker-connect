'use client'
import { Shield, Award, Star, CheckCircle, Info } from 'lucide-react'
import { useState } from 'react'

interface TrustBadgeProps {
  verifiedCount: number
  trustScore: number
  showScore?: boolean
}

interface BadgeTier {
  minVerifications: number
  label: string
  icon: React.ElementType
  colorClass: string
  bgClass: string
  borderClass: string
  description: string
}

const BADGE_TIERS: BadgeTier[] = [
  {
    minVerifications: 5,
    label: 'Enterprise Certified',
    icon: Award,
    colorClass: 'text-purple-700 dark:text-purple-300',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    borderClass: 'border-purple-300 dark:border-purple-700',
    description: 'All 5 verification steps completed. This business meets the highest trust standards on QuickTrade.',
  },
  {
    minVerifications: 4,
    label: 'Trusted Professional',
    icon: Star,
    colorClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    borderClass: 'border-blue-300 dark:border-blue-700',
    description: '4 of 5 verifications complete. Highly credible contractor on QuickTrade.',
  },
  {
    minVerifications: 2,
    label: 'Verified Contractor',
    icon: Shield,
    colorClass: 'text-green-700 dark:text-green-300',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    borderClass: 'border-green-300 dark:border-green-700',
    description: '2+ verifications complete. This contractor has begun the verification process.',
  },
]

function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getTrustScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function TrustScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${getTrustScoreBg(score)} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${getTrustScoreColor(score)}`}>{score}</span>
    </div>
  )
}

export default function TrustBadge({ verifiedCount, trustScore, showScore = false }: TrustBadgeProps) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  const activeTier = BADGE_TIERS.find((t) => verifiedCount >= t.minVerifications)

  if (!activeTier) return null

  const Icon = activeTier.icon

  return (
    <div className="relative inline-block">
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeTier.bgClass} ${activeTier.colorClass} ${activeTier.borderClass} hover:opacity-90`}
        onMouseEnter={() => setTooltip(activeTier.description)}
        onMouseLeave={() => setTooltip(null)}
        aria-label={`${activeTier.label} — ${activeTier.description}`}
        type="button"
      >
        <Icon className="h-3.5 w-3.5" />
        {activeTier.label}
        {showScore && <span className="ml-1 opacity-75">({trustScore})</span>}
        <Info className="h-3 w-3 opacity-60" />
      </button>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none">
          <p className="leading-relaxed">{tooltip}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

export function TrustBadgeList({ verifiedCount }: { verifiedCount: number }) {
  const earnedTiers = BADGE_TIERS.filter((t) => verifiedCount >= t.minVerifications)

  if (earnedTiers.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {earnedTiers.map((tier) => {
        const Icon = tier.icon
        return (
          <span
            key={tier.label}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tier.bgClass} ${tier.colorClass} ${tier.borderClass}`}
            title={tier.description}
          >
            <Icon className="h-3.5 w-3.5" />
            {tier.label}
          </span>
        )
      })}
    </div>
  )
}

interface VerificationStatusBadgeProps {
  status: 'verified' | 'pending' | 'not_started'
  label?: string
}

export function VerificationStatusBadge({ status, label }: VerificationStatusBadgeProps) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
        <CheckCircle className="h-3 w-3" />
        {label ?? 'Verified'}
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full text-xs font-semibold">
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
        </svg>
        {label ?? 'Pending'}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-semibold">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" className="opacity-20" />
        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label ?? 'Not Started'}
    </span>
  )
}
