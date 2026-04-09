'use client'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { LifecycleStage } from '@/types'

interface Props { data: LifecycleStage }

const STAGES = ['new', 'active', 'pro', 'master'] as const
const STAGE_LABELS: Record<string, string> = { new: 'New', active: 'Active', pro: 'Pro', master: 'Master', 'at-risk': 'At Risk' }
const STAGE_COLORS: Record<string, string> = {
  new: 'text-blue-500', active: 'text-green-500', pro: 'text-purple-500',
  master: 'text-amber-500', 'at-risk': 'text-rose-500',
}

export default function LifecycleStageCard({ data }: Props) {
  const currentIdx = STAGES.indexOf(data.stage as typeof STAGES[number])

  return (
    <Card>
      <CardHeader><CardTitle>Lifecycle Stage</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {STAGES.map((stage, i) => {
            const isDone = i < currentIdx
            const isCurrent = i === currentIdx
            return (
              <div key={stage} className="flex items-center gap-1 shrink-0">
                <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}>
                  {isDone ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <Circle className={`h-6 w-6 ${isCurrent ? STAGE_COLORS[stage] : 'text-gray-300 dark:text-gray-600'}`} />
                  )}
                  <span className={`text-xs mt-1 ${isCurrent ? `font-bold ${STAGE_COLORS[stage]}` : 'text-gray-400'}`}>{STAGE_LABELS[stage]}</span>
                </div>
                {i < STAGES.length - 1 && <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1" />}
              </div>
            )
          })}
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{data.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{data.description}</p>
          {data.nextStage && (
            <>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress to {STAGE_LABELS[data.nextStage] ?? data.nextStage}</span>
                <span>{data.progressToNext}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${data.progressToNext}%` }} />
              </div>
              <ul className="mt-3 space-y-1">
                {data.requirements.map((r, i) => (
                  <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                    <span className="text-primary-500 font-bold">•</span>{r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
