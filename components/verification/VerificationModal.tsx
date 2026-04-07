'use client'

import { X } from 'lucide-react'
import type { VerificationType } from '@/types/reputation'
import { GovernmentIdUpload } from './GovernmentIdUpload'
import { BackgroundCheckStatus } from './BackgroundCheckStatus'
import { InsuranceVerification } from './InsuranceVerification'
import { CertificationUpload } from './CertificationUpload'
import { BBBIntegration } from './BBBIntegration'

interface Props {
  type: VerificationType
  workerId: string
  onClose: () => void
  onSubmit: () => void
}

const TYPE_LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID Verification',
  background_check: 'Background Check',
  insurance: 'Insurance Verification',
  certification: 'Certification Upload',
  bbb_google: 'BBB / Google Business',
}

export function VerificationModal({ type, workerId, onClose, onSubmit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{TYPE_LABELS[type]}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {type === 'government_id' && (
            <GovernmentIdUpload workerId={workerId} onComplete={onSubmit} />
          )}
          {type === 'background_check' && (
            <BackgroundCheckStatus
              record={{
                id: '',
                workerId,
                type: 'background_check',
                status: 'pending',
                submittedAt: new Date().toISOString(),
              }}
            />
          )}
          {type === 'insurance' && (
            <InsuranceVerification workerId={workerId} onComplete={onSubmit} />
          )}
          {type === 'certification' && (
            <CertificationUpload workerId={workerId} onComplete={onSubmit} />
          )}
          {type === 'bbb_google' && (
            <BBBIntegration workerId={workerId} onComplete={onSubmit} />
          )}
        </div>
      </div>
    </div>
  )
}
