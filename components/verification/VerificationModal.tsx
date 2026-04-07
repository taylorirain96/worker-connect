'use client'
import { X } from 'lucide-react'
import type { VerificationType } from '@/types/reputation'
import GovernmentIdUpload from './GovernmentIdUpload'
import InsuranceVerification from './InsuranceVerification'
import CertificationUpload from './CertificationUpload'

const TYPE_LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID',
  background_check: 'Background Check',
  insurance: 'Insurance Verification',
  certification: 'Certification Upload',
  bbb_google: 'BBB / Google Rating',
}

type VerificationSubmitData =
  | { file: File }
  | { provider: string; policyNumber: string; expiryDate: string }
  | { name: string; issuer: string; file: File }
  | Record<string, never>

interface Props {
  type: VerificationType
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: VerificationSubmitData) => Promise<void>
}

export default function VerificationModal({ type, isOpen, onClose, onSubmit }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{TYPE_LABELS[type]}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {type === 'government_id' && (
            <GovernmentIdUpload onSubmit={(file) => onSubmit({ file })} />
          )}
          {type === 'insurance' && (
            <InsuranceVerification onSubmit={onSubmit} />
          )}
          {type === 'certification' && (
            <CertificationUpload onSubmit={onSubmit} />
          )}
          {(type === 'background_check' || type === 'bbb_google') && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-4">
                {type === 'background_check'
                  ? 'A background check request will be submitted. You will be notified within 3-5 business days.'
                  : 'Connect your BBB or Google Business profile to import your ratings automatically.'}
              </p>
              <button
                onClick={() => onSubmit({})}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                {type === 'background_check' ? 'Submit Request' : 'Connect Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
