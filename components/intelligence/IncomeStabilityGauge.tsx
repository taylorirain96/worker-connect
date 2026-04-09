'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface Props { score: number; volatility: number; trend: string; recommendation: string }

export default function IncomeStabilityGauge({ score, volatility, trend, recommendation }: Props) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const data = [{ name: 'Stability', value: score, fill: color }]

  return (
    <Card>
      <CardHeader><CardTitle>Income Stability</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="w-36 h-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data} startAngle={90} endAngle={90 - (score / 100) * 360}>
                <RadialBar dataKey="value" background={{ fill: '#f3f4f6' }} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold" style={{ color }}>{score}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stability Score</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-300">Volatility: <span className="font-medium">{volatility}%</span></p>
              <p className="text-gray-600 dark:text-gray-300">Trend: <span className="font-medium capitalize">{trend}</span></p>
            </div>
          </div>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 mt-4">{recommendation}</p>
      </CardContent>
    </Card>
  )
}
