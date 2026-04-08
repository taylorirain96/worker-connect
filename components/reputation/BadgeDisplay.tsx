import type { ReputationTier } from '@/types/reputation'

interface Props {
  badges: string[]
  tier: ReputationTier
}

const TIER_COLOR: Record<ReputationTier, string> = {
  rookie: 'border-gray-300 text-gray-600',
  professional: 'border-blue-300 text-blue-700',
  expert: 'border-purple-300 text-purple-700',
  master: 'border-yellow-400 text-yellow-700',
}

export default function BadgeDisplay({ badges, tier }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => (
        <span
          key={badge}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${TIER_COLOR[tier]} bg-white`}
        >
          {badge}
        </span>
      ))}
    </div>
  )
}
