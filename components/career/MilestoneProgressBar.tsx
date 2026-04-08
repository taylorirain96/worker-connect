'use client'

interface MilestoneProgressBarProps {
  label: string
  current: number
  target: number
  color?: 'blue' | 'green' | 'purple' | 'orange'
  showValue?: boolean
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

export default function MilestoneProgressBar({
  label,
  current,
  target,
  color = 'blue',
  showValue = true,
}: MilestoneProgressBarProps) {
  const pct = Math.min(Math.round((current / target) * 100), 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {showValue && (
          <p className="text-sm text-gray-500">
            {current} / {target}
          </p>
        )}
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{pct}%</p>
    </div>
  )
}
