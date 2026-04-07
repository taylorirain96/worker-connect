'use client'

import { Award, Star, Crown, ShieldCheck, Zap } from 'lucide-react'
import type { Badge } from '@/types/reputation'

interface Props {
  badges: Badge[]
  inProgress?: Badge[]
}

const ICON_MAP: Record<string, React.ReactNode> = {
  award: <Award className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  shield: <ShieldCheck className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  achievement: 'text-amber-600 bg-amber-50 border-amber-200',
  verification: 'text-green-600 bg-green-50 border-green-200',
  performance: 'text-blue-600 bg-blue-50 border-blue-200',
  milestone: 'text-purple-600 bg-purple-50 border-purple-200',
}

function BadgeCard({ badge, dimmed = false }: { badge: Badge; dimmed?: boolean }) {
  const colors = CATEGORY_COLORS[badge.category] ?? CATEGORY_COLORS.achievement
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${dimmed ? 'opacity-40 grayscale' : colors} transition-all`}
    >
      <div className={dimmed ? 'text-gray-400' : ''}>
        {ICON_MAP[badge.icon] ?? <Award className="w-6 h-6" />}
      </div>
      <span className="text-sm font-semibold text-center leading-tight">{badge.name}</span>
      <span className="text-xs text-center text-gray-500 leading-tight">
        {badge.description}
      </span>
      {!dimmed && (
        <span className="text-[10px] text-gray-400">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

export function BadgeDisplay({ badges, inProgress = [] }: Props) {
  return (
    <div className="space-y-4">
      {badges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Earned Badges</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {badges.map((b) => (
              <BadgeCard key={b.id} badge={b} />
            ))}
          </div>
        </div>
      )}
      {inProgress.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">In Progress</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {inProgress.map((b) => (
              <BadgeCard key={b.id} badge={b} dimmed />
            ))}
          </div>
        </div>
      )}
      {badges.length === 0 && inProgress.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No badges yet.</p>
      )}
    </div>
  )
}
