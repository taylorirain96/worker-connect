'use client'
import { TrendingUp, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import type { GrowthScore, ChurnRiskProfile, LifecycleStage } from '@/types'

interface Props {
  growthScore: GrowthScore
  churnRisk: ChurnRiskProfile
  lifecycle: LifecycleStage
}

const RISK_COLORS = {
  low:      'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  medium:   'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  high:     'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
  critical: 'text-red-600 bg-red-50 dark:bg-red-900/20',
}

const STAGE_COLORS = {
  new:       'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  active:    'text-green-500 bg-green-50 dark:bg-green-900/20',
  pro:       'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  master:    'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  'at-risk': 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
}

export default function QuickInsightsPanel({ growthScore, churnRisk, lifecycle }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <div className={`inline-flex p-2 rounded-lg mb-3 ${growthScore.score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <TrendingUp className={`h-5 w-5 ${growthScore.score >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Growth Score</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{growthScore.score}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{growthScore.trend} trend</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className={`inline-flex p-2 rounded-lg mb-3 ${RISK_COLORS[churnRisk.level]}`}>
            <Shield className={`h-5 w-5 ${RISK_COLORS[churnRisk.level].split(' ')[0]}`} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Churn Risk</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 capitalize">{churnRisk.level}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Score: {churnRisk.score}/100</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className={`inline-flex p-2 rounded-lg mb-3 ${STAGE_COLORS[lifecycle.stage]}`}>
            <Star className={`h-5 w-5 ${STAGE_COLORS[lifecycle.stage].split(' ')[0]}`} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lifecycle Stage</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{lifecycle.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lifecycle.progressToNext}% to next</p>
        </CardContent>
      </Card>
    </div>
  )
}
