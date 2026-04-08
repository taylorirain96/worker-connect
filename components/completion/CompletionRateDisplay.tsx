import type { CompletionStats } from '@/types/reputation'

interface Props {
  stats: CompletionStats
}

const LABEL_STYLES: Record<string, string> = {
  pro: 'bg-green-100 text-green-700',
  standard: 'bg-blue-100 text-blue-700',
  job_hopper: 'bg-red-100 text-red-700',
}

const LABEL_TEXT: Record<string, string> = {
  pro: 'Pro',
  standard: 'Standard',
  job_hopper: 'Job Hopper',
}

export default function CompletionRateDisplay({ stats }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Completion Rate</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_STYLES[stats.label]}`}>
          {LABEL_TEXT[stats.label]}
        </span>
      </div>
      <div className="text-center py-4">
        <p className="text-5xl font-bold text-gray-900">{stats.completionRate}%</p>
        <p className="text-gray-500 text-sm mt-1">Completion Rate</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="font-semibold text-gray-900">{stats.totalJobs}</p>
          <p className="text-gray-400 text-xs">Total</p>
        </div>
        <div>
          <p className="font-semibold text-green-600">{stats.completedJobs}</p>
          <p className="text-gray-400 text-xs">Completed</p>
        </div>
        <div>
          <p className="font-semibold text-red-500">{stats.cancelledJobs}</p>
          <p className="text-gray-400 text-xs">Cancelled</p>
        </div>
      </div>
    </div>
  )
}
