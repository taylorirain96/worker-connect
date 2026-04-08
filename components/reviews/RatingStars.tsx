'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export default function RatingStars({
  rating,
  max = 5,
  size = 'md',
  interactive = false,
  onRate,
  className,
}: RatingStarsProps) {
  const starSize = SIZE_MAP[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : undefined} aria-label={`Rating: ${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const filled = starValue <= Math.round(rating)
        const partial = !filled && starValue - 0.5 <= rating

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(starValue)}
            className={cn(
              'focus:outline-none transition-transform',
              interactive && 'cursor-pointer hover:scale-110 focus:scale-110',
              !interactive && 'cursor-default pointer-events-none'
            )}
            aria-label={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
          >
            <Star
              className={cn(
                starSize,
                filled || partial
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
