'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface TrendPoint {
  month: string
  rate: number
}

interface Props {
  trend: TrendPoint[]
}

export default function CompletionRateChart({ trend }: Props) {
  if (trend.length === 0) {
    return <div className="text-center py-6 text-sm text-gray-400">No trend data available</div>
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Completion Rate Trend</h3>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={trend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Rate']} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <table className="sr-only" aria-label="Completion rate trend data">
        <thead><tr><th>Month</th><th>Rate (%)</th></tr></thead>
        <tbody>
          {trend.map((pt) => (
            <tr key={pt.month}><td>{pt.month}</td><td>{pt.rate}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
