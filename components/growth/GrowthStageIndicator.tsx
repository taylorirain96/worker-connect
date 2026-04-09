'use client'
import { Card, CardContent } from '@/components/ui/Card'
import type { LifecycleStage } from '@/types'

interface Props { data: LifecycleStage }

const STAGE_CONFIG = {
  new:       { label: 'New',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  active:    { label: 'Active',   color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  pro:       { label: 'Pro',      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  master:    { label: 'Master',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  'at-risk': { label: 'At Risk',  color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300' },
}

export default function GrowthStageIndicator({ data }: Props) {
  const config = STAGE_CONFIG[data.stage]

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>{config.label}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{data.description}</span>
        </div>
        {data.nextStage && (
          <>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress to {data.nextStage}</span>
              <span>{data.progressToNext}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${data.progressToNext}%` }} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
