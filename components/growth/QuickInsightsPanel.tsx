// @ts-nocheck
'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react'

interface QuickInsightsPanelProps {
  growthScore: number
  growthTrend: 'up' | 'down' | 'stable'
  churnRisk: number
  lifecycleStage: 'new' | 'active' | 'pro' | 'master' | 'at-risk'
}

export default function QuickInsightsPanel({
  growthScore,
  growthTrend,
  churnRisk,
  lifecycleStage,
}: QuickInsightsPanelProps) {
  const STAGE_LABELS = {
    new: 'New Worker',
    active: 'Active',
    pro: 'Professional',
    master: 'Master',
    'at-risk': 'At Risk',
  }

  const STAGE_COLORS = {
    new: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    active: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    pro: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    master: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'at-risk': 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Growth Score Card */}
      <div className="bg-[#0f172a] rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Growth Score</h3>
          {growthTrend === 'up' && <TrendingUp className="h-4 w-4 text-[#08d9d6]" />}
          {growthTrend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
        </div>
        <p className="text-3xl font-bold text-white">{growthScore}</p>
        <p className={`text-xs mt-1 ${growthTrend === 'up' ? 'text-[#08d9d6]' : 'text-gray-400'}`}> 
          {growthTrend === 'up' ? '↑ Trending up' : growthTrend === 'down' ? '↓ Trending down' : '→ Stable'}
        </p>
      </div>

      {/* Churn Risk Card with Moody Glow */}
      <Link
        href="/growth/trust"
        className="sweep-border breathing-glow bg-[#0f172a] rounded-lg p-5 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Churn Risk</h3>
          <AlertTriangle className={`h-4 w-4 ${churnRisk > 50 ? 'text-red-400' : 'text-yellow-400'}`} />
        </div>
        <p className={`text-3xl font-bold ${churnRisk > 50 ? 'text-red-400' : 'text-yellow-400'}`}> 
          {churnRisk}%
        </p>
        <p className="text-xs mt-1 text-gray-400 group-hover:text-[#08d9d6] transition-colors">
          Click to view trust & mediation →
        </p>
      </Link>

      {/* Lifecycle Stage Card */}
      <div className="bg-[#0f172a] rounded-lg p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-400">Stage</h3>
          <Award className="h-4 w-4 text-gray-400" />
        </div>
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${
            STAGE_COLORS[lifecycleStage]
          }`} 
        >
          {STAGE_LABELS[lifecycleStage]}
        </div>
        <p className="text-xs mt-2 text-gray-400">Current classification</p>
      </div>
    </div>
  )
}