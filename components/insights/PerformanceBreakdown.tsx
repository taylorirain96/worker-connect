'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { PerformanceMetrics } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props { data: PerformanceMetrics[] }

export default function PerformanceBreakdown({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Performance by Category</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v as number)} width={70} />
            <Tooltip formatter={(v, name) => [name === 'earnings' ? formatCurrency(v as number) : v, name as string]} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="earnings" name="Earnings" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {data.map((item) => (
            <div key={item.category} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.category}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.completionRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">completion</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
