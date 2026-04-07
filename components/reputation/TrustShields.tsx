'use client'

import { cn } from '@/lib/utils'
import { getShieldCount } from '@/lib/utils/reputationAlgorithm'

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
}

export default function TrustShields({ score, size = 'md', showLabel = true, className }: Props) {
  const count = getShieldCount(score)

  const labels: Record<number, string> = {
    1: 'Basic Trust',
    2: 'Verified',
    3: 'Trusted Pro',
    4: 'Highly Trusted',
    5: 'Elite Trust',
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              SIZE_MAP[size],
              'transition-all duration-200',
              i < count ? 'opacity-100' : 'opacity-20 grayscale'
            )}
            aria-hidden={i >= count}
          >
            🛡️
          </span>
        ))}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {labels[count]} ({count}/5)
        </span>
      )}
    </div>
  )
}
