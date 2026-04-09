'use client'
import { Shield, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { ChurnRiskProfile } from '@/types'

interface Props { data: ChurnRiskProfile }

const LEVEL_CONFIG = {
  low:      { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', bar: 'bg-emerald-500', icon: Shield },
  medium:   { color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',     bar: 'bg-amber-500',   icon: AlertTriangle },
  high:     { color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20',       bar: 'bg-rose-500',    icon: AlertTriangle },
  critical: { color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20',         bar: 'bg-red-600',     icon: AlertTriangle },
}

export default function ChurnRiskIndicator({ data }: Props) {
  const config = LEVEL_CONFIG[data.level]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader><CardTitle>Churn Risk Assessment</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${config.bg}`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${config.color} capitalize`}>{data.level} Risk</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score: {data.score}/100</p>
          </div>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div className={`h-full ${config.bar} rounded-full`} style={{ width: `${data.score}%` }} />
        </div>
        <div className="space-y-2 mb-4">
          {data.factors.map((f) => (
            <div key={f.factor} className="flex items-start gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0"></span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{f.factor}:</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">{f.description}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</p>
          <ul className="space-y-1">
            {data.recommendations.map((r, i) => (
              <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                <span className="text-primary-500 font-bold mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
