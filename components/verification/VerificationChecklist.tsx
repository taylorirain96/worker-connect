'use client'
import { CheckCircle, Clock, XCircle, AlertCircle, Circle } from 'lucide-react'
import type { VerificationRecord, VerificationType, VerificationStatus } from '@/types/reputation'

const TYPE_LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID',
  background_check: 'Background Check',
  insurance: 'Insurance Verification',
  certification: 'Certifications',
  bbb_google: 'BBB / Google Rating',
}

const STATUS_CONFIG: Record<VerificationStatus, { label: string; icon: React.ReactNode; className: string }> = {
  not_started: { label: 'Not Started', icon: <Circle className="h-5 w-5" />, className: 'text-gray-400' },
  pending: { label: 'Pending', icon: <Clock className="h-5 w-5" />, className: 'text-yellow-500' },
  verified: { label: 'Verified', icon: <CheckCircle className="h-5 w-5" />, className: 'text-green-500' },
  failed: { label: 'Failed', icon: <XCircle className="h-5 w-5" />, className: 'text-red-500' },
  expired: { label: 'Expired', icon: <AlertCircle className="h-5 w-5" />, className: 'text-orange-500' },
}

const ALL_TYPES: VerificationType[] = ['government_id', 'background_check', 'insurance', 'certification', 'bbb_google']

interface Props {
  verifications: VerificationRecord[]
  onStartVerification: (type: VerificationType) => void
}

export default function VerificationChecklist({ verifications, onStartVerification }: Props) {
  const getRecord = (type: VerificationType) => verifications.find((v) => v.type === type)

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {ALL_TYPES.map((type) => {
        const record = getRecord(type)
        const status: VerificationStatus = record?.status ?? 'not_started'
        const config = STATUS_CONFIG[status]
        return (
          <div key={type} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className={config.className}>{config.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{TYPE_LABELS[type]}</p>
                <p className={`text-xs ${config.className}`}>{config.label}</p>
              </div>
            </div>
            {(status === 'not_started' || status === 'failed' || status === 'expired') && (
              <button
                onClick={() => onStartVerification(type)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {status === 'not_started' ? 'Start' : 'Retry'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
