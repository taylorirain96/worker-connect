'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DataPoint {
  [key: string]: string | number
}

interface BarSeries {
  key: string
  label: string
  color: string
}

interface AnalyticsBarChartProps {
  data: DataPoint[]
  series: BarSeries[]
  xKey: string
  height?: number
  formatValue?: (value: number) => string
  showLegend?: boolean
  /** When true, each bar in a single-series chart uses its own color */
  multiColor?: boolean
  colors?: string[]
}

export default function AnalyticsBarChart({
  data,
  series,
  xKey,
  height = 260,
  formatValue = (v) => formatCurrency(v),
  showLegend = false,
  multiColor = false,
  colors = [],
}: AnalyticsBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
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
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: '12px' }} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]}>
            {multiColor &&
              data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length] ?? s.color} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
