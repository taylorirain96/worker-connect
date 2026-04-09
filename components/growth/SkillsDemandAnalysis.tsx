'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SkillDemand { skill: string; demand: number; trend: string; avgRate: number }
interface Props { data: SkillDemand[] }

const TREND_ICON = { up: TrendingUp, down: TrendingDown, stable: Minus }
const TREND_COLOR = { up: 'text-emerald-500', down: 'text-rose-500', stable: 'text-gray-400' }

export default function SkillsDemandAnalysis({ data }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>Skills Market Demand</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="skill" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip formatter={(v) => [`${v}%`, 'Demand']} contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="demand" radius={[0,4,4,0]}>
              {data.map((entry) => (
                <Cell key={entry.skill} fill={entry.demand >= 85 ? '#10b981' : entry.demand >= 70 ? '#6366f1' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {data.map((item) => {
            const Icon = TREND_ICON[item.trend as keyof typeof TREND_ICON] ?? Minus
            const color = TREND_COLOR[item.trend as keyof typeof TREND_COLOR] ?? 'text-gray-400'
            return (
              <div key={item.skill} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                <Icon className={`h-3 w-3 ${color}`} />
                <span>{item.skill}</span>
                <span className="ml-auto text-gray-500">${item.avgRate}/hr</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
