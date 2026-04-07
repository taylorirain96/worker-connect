'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  beforeUrl: string
  afterUrl: string
  title?: string
  className?: string
}

// Width scale factor: when the "before" image container is at sliderPos% of the
// total width, the inner <img> must be 100/sliderPos * 100% to fill that container
// at its natural aspect ratio. Using 10000 (= 100 * 100) avoids an extra division.
const FULL_WIDTH_PCT = 10000

export default function BeforeAfterShowcase({ beforeUrl, afterUrl, title, className }: Props) {
  const [sliderPos, setSliderPos] = useState(50) // percentage

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(5, Math.min(95, x)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(5, Math.min(95, x)))
  }

  return (
    <div className={cn('space-y-2', className)}>
      {title && <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>}

      <div
        className="relative w-full h-60 overflow-hidden rounded-xl cursor-col-resize select-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* After (full) */}
        <img src={afterUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" />

        {/* Before (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img src={beforeUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${FULL_WIDTH_PCT / sliderPos}%` }} />
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
          style={{ left: `calc(${sliderPos}% - 2px)` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 text-xs font-bold">
            ↔
          </div>
        </div>

        {/* Labels */}
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">Before</span>
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">After</span>
      </div>
    </div>
  )
}
