import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { VerificationStatus } from '@/types/reputation'

interface Props {
  status: VerificationStatus
  submittedAt?: string
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', icon: <AlertCircle className="h-5 w-5" />, bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  pending: { label: 'Under Review', icon: <Clock className="h-5 w-5" />, bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  verified: { label: 'Clear', icon: <CheckCircle className="h-5 w-5" />, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  failed: { label: 'Issues Found', icon: <XCircle className="h-5 w-5" />, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  expired: { label: 'Expired', icon: <AlertCircle className="h-5 w-5" />, bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
}

export default function BackgroundCheckStatus({ status, submittedAt }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${config.bg} ${config.border}`}>
      <span className={config.text}>{config.icon}</span>
      <div>
        <p className={`text-sm font-semibold ${config.text}`}>Background Check: {config.label}</p>
        {submittedAt && (
          <p className="text-xs text-gray-500 mt-0.5">
            Submitted {new Date(submittedAt).toLocaleDateString()}
          </p>
        )}
        {status === 'pending' && (
          <p className="text-xs text-yellow-600 mt-0.5">Typically takes 3–5 business days</p>
        )}
      </div>
    </div>
  )
}
