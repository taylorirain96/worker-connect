'use client'

import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { CompletionTrendPoint } from '@/types/reputation'
import { analyzeCompletionTrend } from '@/lib/utils/completionRateCalc'

interface Props {
  trend: CompletionTrendPoint[]
  className?: string
}

const TREND_LABELS = {
  improving: { label: '↑ Improving', color: 'text-green-600 dark:text-green-400' },
  stable: { label: '→ Stable', color: 'text-gray-500 dark:text-gray-400' },
  declining: { label: '↓ Declining', color: 'text-red-500 dark:text-red-400' },
}

export default function CompletionRateChart({ trend, className }: Props) {
  const direction = analyzeCompletionTrend(trend)
  const trendConf = TREND_LABELS[direction]

  if (trend.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center', className)}>
        <p className="text-sm text-gray-400 dark:text-gray-500">No trend data available yet</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Completion Rate Trend</h3>
        <span className={cn('text-sm font-medium', trendConf.color)}>{trendConf.label}</span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v) => {
              const d = new Date(v)
              return `${d.getMonth() + 1}/${d.getDate()}`
            }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Completion Rate']}
            labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
            contentStyle={{
              background: 'rgb(31 41 55)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          {/* 80% threshold line */}
          <ReferenceLine
            y={80}
            stroke="#22c55e"
            strokeDasharray="4 4"
            label={{ value: '80% target', fill: '#22c55e', fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
