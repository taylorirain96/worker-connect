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
  low:      'text-[#08d9d6] bg-[#08d9d6]/10', // Vibrant Teal
  medium:   'text-[#e97be4] bg-[#e97be4]/10', // Moody Pink
  high:     'text-rose-500 bg-rose-500/10',
  critical: 'text-red-600 bg-red-600/10',
}

const STAGE_COLORS = {
  new:       'text-slate-400 bg-slate-800',
  active:    'text-[#08d9d6] bg-[#08d9d6]/10',
  pro:       'text-[#b822e4] bg-[#b822e4]/10',
  master:    'text-[#e97be4] bg-[#e97be4]/10',
  'at-risk': 'text-rose-500 bg-rose-500/10',
}

export default function QuickInsightsPanel({ growthScore, churnRisk, lifecycle }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Growth Score Card */}
      <Card className="bg-[#0f172a] border-slate-800 breathing-glow">
        <CardContent className="p-6">
          <div className={`inline-flex p-2 rounded-lg mb-3 bg-[#b822e4]/10`}>
            <TrendingUp className="h-5 w-5 text-[#b822e4]" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Growth Score</p>
          <p className="text-3xl font-bold text-white mt-1">{growthScore.score}</p>
          <p className="text-xs text-[#08d9d6] mt-1 font-semibold uppercase tracking-wider capitalize">
            {growthScore.trend} trend
          </p>
        </CardContent>
      </Card>

      {/* Churn Risk Card */}
    <Card className="bg-[#0f172a] border-slate-800 shadow-glow transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className={`inline-flex p-2 rounded-lg mb-3 ${RISK_COLORS[churnRisk.level]}`}>
            <Shield className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Churn Risk</p>
          <p className="text-3xl font-bold text-white mt-1 capitalize">{churnRisk.level}</p>
          <p className="text-xs text-slate-400 mt-1">Score: {churnRisk.score}/100</p>
        </CardContent>
      </Card>

      {/* Lifecycle Stage Card */}
      <Card className="bg-[#0f172a] border-slate-800">
        <CardContent className="p-6">
          <div className={`inline-flex p-2 rounded-lg mb-3 ${STAGE_COLORS[lifecycle.stage]}`}>
            <Star className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Lifecycle Stage</p>
          <p className="text-3xl font-bold text-white mt-1">{lifecycle.label}</p>
          <p className="text-xs text-slate-400 mt-1">{lifecycle.progressToNext}% to next level</p>
        </CardContent>
      </Card>
    </div>
  )
}
