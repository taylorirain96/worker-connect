'use client'
import { Lightbulb } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { RateBenchmark } from '@/types'

interface Props { benchmarks: RateBenchmark[] }

export default function OptimizationRecommendations({ benchmarks }: Props) {
  const suggestions = benchmarks
    .filter((b) => b.workerRate < b.marketAvg)
    .map((b) => ({
      skill: b.skill,
      currentRate: b.workerRate,
      suggestedRate: Math.round(b.marketAvg * 1.05),
      increase: Math.round(((b.marketAvg - b.workerRate) / b.workerRate) * 100),
    }))

  return (
    <Card>
      <CardHeader><CardTitle>Rate Optimization Tips</CardTitle></CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Your rates are competitive! Consider targeting top-percentile rates.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div key={s.skill} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.skill}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Raise from ${s.currentRate}/hr → ${s.suggestedRate}/hr</p>
                </div>
                <span className="text-sm font-bold text-emerald-500">+{s.increase}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
