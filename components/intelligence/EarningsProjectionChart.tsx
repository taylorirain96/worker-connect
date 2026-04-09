'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { EarningsProjection } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props { data: EarningsProjection[] }

export default function EarningsProjectionChart({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Earnings Projection</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v as number)} width={70} />
            <Tooltip formatter={(v, name) => [formatCurrency(v as number), name as string]} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="high" name="High" stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" fill="url(#rangeGrad)" />
            <Area type="monotone" dataKey="projected" name="Projected" stroke="#6366f1" strokeWidth={2} fill="url(#projGrad)" />
            <Area type="monotone" dataKey="low" name="Low" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block"></span>Projected</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block"></span>Low</span>
        </div>
      </CardContent>
    </Card>
  )
}
