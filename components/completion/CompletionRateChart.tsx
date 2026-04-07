'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { CompletionRateData } from '@/types/reputation'

interface Props {
  data: CompletionRateData
}

export function CompletionRateChart({ data }: Props) {
  if (data.history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No history data yet.</div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Completion Rate History</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data.history} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Rate']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine
            y={80}
            stroke="#22c55e"
            strokeDasharray="4 3"
            label={{ value: 'Pro (80%)', fontSize: 11, fill: '#22c55e', position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
