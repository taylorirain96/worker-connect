'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { EarningsTrend } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props { data: EarningsTrend[]; onPeriodChange?: (p: 'daily'|'weekly'|'monthly') => void }

const PERIODS = [
  { key: 'daily' as const, label: 'Daily' },
  { key: 'weekly' as const, label: 'Weekly' },
  { key: 'monthly' as const, label: 'Monthly' },
]

export default function EarningsTrendChart({ data, onPeriodChange }: Props) {
  const [period, setPeriod] = useState<'daily'|'weekly'|'monthly'>('monthly')

  const handlePeriod = (p: 'daily'|'weekly'|'monthly') => {
    setPeriod(p)
    onPeriodChange?.(p)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Earnings Trend</CardTitle>
          <div className="flex gap-1">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handlePeriod(key)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  period === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v as number)} width={70} />
            <Tooltip
              formatter={(value) => [formatCurrency(value as number), 'Earnings']}
              contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
