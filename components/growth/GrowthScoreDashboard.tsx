'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { GrowthScore } from '@/types'

interface Props {
  data: GrowthScore
}

const BREAKDOWN_LABELS: Record<keyof GrowthScore['breakdown'], string> = {
  earnings: 'Earnings Growth',
  completionRate: 'Completion Rate',
  rating: 'Customer Rating',
  engagement: 'Platform Engagement',
  growth: 'Overall Growth',
}

export default function GrowthScoreDashboard({ data }: Props) {
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus
  const trendColor = data.trend === 'up' ? 'text-[#08d9d6]' : data.trend === 'down' ? 'text-rose-500' : 'text-gray-400'

  return (
    <Card className="bg-[#0f172a] border-slate-800 shadow-2xl overflow-hidden relative">
      <CardHeader>
        <CardTitle className="text-white text-lg font-bold">Growth Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-6xl font-bold bg-gradient-to-r from-[#b822e4] to-[#e97be4] bg-clip-text text-transparent">
            {data.score}
          </div>
          <div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-5 w-5" />
              <span className="text-sm font-semibold capitalize">{data.trend} trend</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wider">Neuro-Growth Index</p>
          </div>
        </div>

        <div className="space-y-4">
          {(Object.keys(data.breakdown) as Array<keyof GrowthScore['breakdown']>).map((key) => (
            <div key={key} className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400 group-hover:text-white transition-colors">{BREAKDOWN_LABELS[key]}</span>
                <span className="font-bold text-white">{data.breakdown[key]}%</span>
              </div>
              <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#b822e4] to-[#e97be4] transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(184,34,228,0.4)]"
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
