import { Award, Star, Zap, Shield, Trophy } from 'lucide-react'
import { getTierLabel, getTierColor } from '@/lib/utils/reputationAlgorithm'
import type { ReputationTier } from '@/types/reputation'

interface Props {
  tier: ReputationTier
  badges: string[]
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  'Elite Completer': <Trophy className="h-3.5 w-3.5" />,
  'Top Rated': <Star className="h-3.5 w-3.5" />,
  'Quick Responder': <Zap className="h-3.5 w-3.5" />,
  'Verified Pro': <Shield className="h-3.5 w-3.5" />,
  'Master Worker': <Award className="h-3.5 w-3.5" />,
}

export default function BadgeDisplay({ tier, badges }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 ${getTierColor(tier)}`}>
        <Award className="h-3.5 w-3.5" />
        {getTierLabel(tier)}
      </span>
      {badges.map((badge) => (
        <span
          key={badge}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
        >
          {BADGE_ICONS[badge] ?? <Award className="h-3.5 w-3.5" />}
          {badge}
        </span>
      ))}
    </div>
  )
}
