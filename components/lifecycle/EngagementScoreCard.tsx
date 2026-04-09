'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { EngagementScore } from '@/types'

interface Props { data: EngagementScore }

const FACTOR_LABELS: Record<keyof EngagementScore['factors'], string> = {
  loginFrequency:      'Login Frequency',
  jobApplications:     'Job Applications',
  completionRate:      'Completion Rate',
  responseTime:        'Response Time',
  profileCompleteness: 'Profile Completeness',
}

export default function EngagementScoreCard({ data }: Props) {
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus
  const trendColor = data.trend === 'up' ? 'text-emerald-500' : data.trend === 'down' ? 'text-rose-500' : 'text-gray-400'
  const scoreColor = data.score >= 70 ? 'text-emerald-500' : data.score >= 50 ? 'text-amber-500' : 'text-rose-500'

  return (
    <Card>
      <CardHeader><CardTitle>Engagement Score</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-5xl font-bold ${scoreColor}`}>{data.score}</div>
          <div>
            <div className={`flex items-center gap-1 ${trendColor}`}><TrendIcon className="h-4 w-4" /><span className="text-sm capitalize">{data.trend}</span></div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{data.period}</p>
          </div>
        </div>
        <div className="space-y-2">
          {(Object.entries(data.factors) as Array<[keyof EngagementScore['factors'], number]>).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-600 dark:text-gray-300">{FACTOR_LABELS[key]}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
