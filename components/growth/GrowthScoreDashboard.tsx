'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { GrowthScore } from '@/types'

interface Props { data: GrowthScore }

const BREAKDOWN_LABELS: Record<keyof GrowthScore['breakdown'], string> = {
  earnings:       'Earnings Growth',
  completionRate: 'Completion Rate',
  rating:         'Customer Rating',
  engagement:     'Platform Engagement',
  growth:         'Overall Growth',
}

const BREAKDOWN_COLORS: Record<keyof GrowthScore['breakdown'], string> = {
  earnings:       'bg-emerald-500',
  completionRate: 'bg-blue-500',
  rating:         'bg-amber-500',
  engagement:     'bg-purple-500',
  growth:         'bg-rose-500',
}

export default function GrowthScoreDashboard({ data }: Props) {
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus
  const trendColor = data.trend === 'up' ? 'text-emerald-500' : data.trend === 'down' ? 'text-rose-500' : 'text-gray-400'

  const scoreColor = data.score >= 80 ? 'text-emerald-500' : data.score >= 60 ? 'text-amber-500' : 'text-rose-500'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className={`text-6xl font-bold ${scoreColor}`}>{data.score}</div>
          <div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-5 w-5" />
              <span className="text-sm font-medium capitalize">{data.trend}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</p>
          </div>
        </div>
        <div className="space-y-3">
          {(Object.keys(data.breakdown) as Array<keyof GrowthScore['breakdown']>).map((key) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-300">{BREAKDOWN_LABELS[key]}</span>
                <span className="font-medium text-gray-900 dark:text-white">{data.breakdown[key]}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${BREAKDOWN_COLORS[key]} transition-all duration-500`}
                  style={{ width: `${data.breakdown[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
