'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PieEntry {
  name: string
  value: number
  color: string
}

interface AnalyticsPieChartProps {
  data: PieEntry[]
  height?: number
  formatValue?: (value: number) => string
  innerRadius?: number
  showLegend?: boolean
}

export default function AnalyticsPieChart({
  data,
  height = 240,
  formatValue = String,
  innerRadius = 60,
  showLegend = true,
}: AnalyticsPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 40}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [formatValue(value as number), name as string]}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            iconType="circle"
            iconSize={8}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
