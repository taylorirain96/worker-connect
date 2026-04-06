'use client'
import type { MonthlyEarnings } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface EarningsChartProps {
  data: MonthlyEarnings[]
  height?: number
}

export default function EarningsChart({ data, height = 180 }: EarningsChartProps) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm"
        style={{ height }}
      >
        No earnings data yet
      </div>
    )
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-2 min-w-0" style={{ height }}>
        {data.map((entry) => {
          const barHeight = Math.max((entry.total / maxTotal) * (height - 28), 4)
          return (
            <div key={entry.month} className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group">
              {/* Stacked bar */}
              <div
                className="w-full relative rounded-t overflow-hidden cursor-default"
                style={{ height: barHeight }}
                title={`${entry.label}: ${formatCurrency(entry.total)}`}
              >
                {/* Bonus */}
                {entry.bonus > 0 && (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-purple-400 dark:bg-purple-500"
                    style={{ height: `${(entry.bonus / entry.total) * 100}%` }}
                  />
                )}
                {/* Referral */}
                {entry.referral > 0 && (
                  <div
                    className="absolute inset-x-0 bg-emerald-400 dark:bg-emerald-500"
                    style={{
                      height: `${(entry.referral / entry.total) * 100}%`,
                      bottom: `${(entry.bonus / entry.total) * 100}%`,
                    }}
                  />
                )}
                {/* Cashback */}
                <div
                  className="absolute inset-x-0 top-0 bg-primary-400 dark:bg-primary-500"
                  style={{
                    height: `${(entry.cashback / entry.total) * 100}%`,
                  }}
                />
                {/* Tooltip on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900/80 flex flex-col items-center justify-center text-white text-[10px] p-1 rounded">
                  <span className="font-bold">{formatCurrency(entry.total)}</span>
                  <span className="text-gray-300">{entry.jobCount} jobs</span>
                </div>
              </div>
              {/* Month label */}
              <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">
                {entry.label.slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-400 dark:bg-primary-500 inline-block" />
          Cashback
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-500 inline-block" />
          Referrals
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-purple-400 dark:bg-purple-500 inline-block" />
          Bonuses
        </div>
      </div>
    </div>
  )
}
