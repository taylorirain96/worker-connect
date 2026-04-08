'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DataPoint {
  [key: string]: string | number
}

interface Series {
  key: string
  label: string
  color: string
}

interface AnalyticsLineChartProps {
  data: DataPoint[]
  series: Series[]
  xKey: string
  height?: number
  formatValue?: (value: number) => string
  showLegend?: boolean
}

export default function AnalyticsLineChart({
  data,
  series,
  xKey,
  height = 260,
  formatValue = (v) => formatCurrency(v),
  showLegend = false,
}: AnalyticsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatValue(v as number)}
          width={70}
        />
        <Tooltip
          formatter={(value, name) => [formatValue(value as number), name as string]}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
