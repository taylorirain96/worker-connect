'use client'
import { cn } from '@/lib/utils'

interface PerformanceRingProps {
  value: number       // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  sublabel?: string
  className?: string
}

export default function PerformanceRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = '#6366f1',
  label,
  sublabel,
  className,
}: PerformanceRingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress = Math.min(100, Math.max(0, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            className="dark:stroke-gray-700"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{label}</p>}
      {sublabel && <p className="text-[10px] text-gray-400 text-center">{sublabel}</p>}
    </div>
  )
}
