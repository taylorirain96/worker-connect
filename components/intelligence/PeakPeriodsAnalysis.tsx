'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'

interface PeakPeriod { period: string; avgEarnings: number; jobCount: number; isHighSeason: boolean }
interface Props { data: PeakPeriod[] }

export default function PeakPeriodsAnalysis({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Peak Earning Periods</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v as number)} />
            <Tooltip formatter={(v) => [formatCurrency(v as number), 'Avg Earnings']} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="avgEarnings" radius={[4,4,0,0]}>
              {data.map((entry) => (
                <Cell key={entry.period} fill={entry.isHighSeason ? '#10b981' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          <span className="inline-flex items-center gap-1 mr-3"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>High season</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>Regular</span>
        </p>
      </CardContent>
    </Card>
  )
}
