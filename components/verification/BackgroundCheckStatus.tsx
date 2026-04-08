import type { VerificationStatus } from '@/types/reputation'

interface Props {
  status: VerificationStatus
  requestedAt?: string
  completedAt?: string
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string }> = {
  pending: { label: 'In Progress', color: 'text-yellow-600' },
  verified: { label: 'Passed', color: 'text-green-600' },
  failed: { label: 'Failed', color: 'text-red-600' },
  expired: { label: 'Expired', color: 'text-gray-500' },
}

export default function BackgroundCheckStatus({ status, requestedAt, completedAt }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Background Check</h3>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
      <div className="space-y-2">
        {requestedAt && (
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Requested</p>
              <p className="text-sm text-gray-700">{new Date(requestedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        {completedAt && (
          <div className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-sm text-gray-700">{new Date(completedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        {!requestedAt && !completedAt && (
          <p className="text-sm text-gray-400">No timeline available</p>
        )}
      </div>
    </div>
  )
}
