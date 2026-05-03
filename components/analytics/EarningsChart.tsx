'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface MonthlyEarningsPoint {
  month: string   // short label, e.g. "Jan"
  amount: number  // NZD
}

interface EarningsChartProps {
  data: MonthlyEarningsPoint[]
  height?: number
}

function fmtNZD(n: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0,
  }).format(n)
}

const BAR_COLORS = [
  '#6366f1', '#6366f1', '#6366f1', '#6366f1', '#6366f1', '#818cf8',
]

export default function EarningsChart({ data, height = 260 }: EarningsChartProps) {
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

  // Highlight the highest bar
  const maxAmount = Math.max(...data.map((d) => d.amount))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => fmtNZD(v as number)}
          width={72}
        />
        <Tooltip
          formatter={(value) => [fmtNZD(value as number), 'Earnings (NZD)']}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
        />
        <Bar dataKey="amount" name="Earnings" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.amount === maxAmount ? '#6366f1' : BAR_COLORS[index % BAR_COLORS.length]}
              fillOpacity={entry.amount === maxAmount ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
