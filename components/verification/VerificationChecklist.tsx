'use client'

import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import type { VerificationProfile, VerificationType, VerificationStatus } from '@/types/reputation'

interface Props {
  profile: VerificationProfile
  onStart: (type: VerificationType) => void
}

const VERIFICATION_TYPES: { type: VerificationType; label: string; description: string }[] = [
  { type: 'government_id', label: 'Government ID', description: 'Verify your identity with a government-issued ID' },
  { type: 'background_check', label: 'Background Check', description: 'Run a professional background check' },
  { type: 'insurance', label: 'Insurance', description: 'Upload proof of insurance coverage' },
  { type: 'certification', label: 'Certification', description: 'Upload professional certifications' },
  { type: 'bbb_google', label: 'BBB / Google', description: 'Link your BBB or Google Business profile' },
]

const STATUS_ICON: Record<VerificationStatus, React.ReactNode> = {
  verified: <CheckCircle className="w-5 h-5 text-green-500" />,
  in_review: <Clock className="w-5 h-5 text-yellow-500" />,
  pending: <Clock className="w-5 h-5 text-gray-400" />,
  rejected: <XCircle className="w-5 h-5 text-red-500" />,
  expired: <AlertCircle className="w-5 h-5 text-orange-500" />,
}

const STATUS_LABEL: Record<VerificationStatus, string> = {
  verified: 'Verified',
  in_review: 'In Review',
  pending: 'Pending',
  rejected: 'Rejected',
  expired: 'Expired',
}

export function VerificationChecklist({ profile, onStart }: Props) {
  const recordMap = new Map(profile.records.map((r) => [r.type, r]))

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Verification Checklist</h3>
        <span className="text-sm text-gray-500">
          {profile.verificationLevel} / 5 verified
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all"
          style={{ width: `${(profile.verificationLevel / 5) * 100}%` }}
        />
      </div>

      {VERIFICATION_TYPES.map(({ type, label, description }) => {
        const record = recordMap.get(type)
        const status = record?.status
        const canStart = !status || status === 'rejected' || status === 'expired'

        return (
          <div
            key={type}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              {status ? STATUS_ICON[status] : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {status && (
                <span className="text-xs text-gray-500">{STATUS_LABEL[status]}</span>
              )}
              {canStart && (
                <button
                  onClick={() => onStart(type)}
                  className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {status === 'rejected' || status === 'expired' ? (
                    <>
                      <RefreshCw className="w-3 h-3" /> Retry
                    </>
                  ) : (
                    'Start'
                  )}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
