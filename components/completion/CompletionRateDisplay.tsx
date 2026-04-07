'use client'

import type { CompletionRateData } from '@/types/reputation'

interface Props {
  data: CompletionRateData
}

const CLASSIFICATION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  Pro: { bg: 'bg-green-100', text: 'text-green-700', label: 'Pro Worker' },
  'Job-Hopper': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Job-Hopper' },
  New: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New Worker' },
}

const TREND_LABELS: Record<string, string> = {
  up: '↑ Improving',
  down: '↓ Declining',
  stable: '→ Stable',
}

const TREND_COLORS: Record<string, string> = {
  up: 'text-green-600',
  down: 'text-red-500',
  stable: 'text-gray-500',
}

export function CompletionRateDisplay({ data }: Props) {
  const style = CLASSIFICATION_STYLES[data.classification]
  const trendColor = TREND_COLORS[data.trend] ?? 'text-gray-500'

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-3">
      {/* Big percentage */}
      <div className="flex flex-col items-center">
        <span className="text-5xl font-bold text-gray-900">{data.completionRate}%</span>
        <span className="text-sm text-gray-500 mt-1">Completion Rate</span>
      </div>

      {/* Classification badge */}
      <span
        className={`text-sm font-semibold px-4 py-1.5 rounded-full ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>

      {/* Trend */}
      <span className={`text-sm font-medium ${trendColor}`}>{TREND_LABELS[data.trend]}</span>

      {/* Stats row */}
      <div className="flex gap-6 text-center pt-2">
        <div>
          <p className="text-lg font-bold text-gray-900">{data.completedContracts}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div>
          <p className="text-lg font-bold text-gray-900">{data.totalContracts}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
    </div>
  )
}
