'use client'

import type { VerificationType } from '@/types/reputation'

const INSTRUCTIONS: Record<VerificationType, string> = {
  government_id: "Upload a clear photo of your government-issued ID (passport, driver's license, or national ID).",
  background_check: 'Authorize a background check. This typically takes 2-5 business days.',
  insurance: 'Upload proof of your current insurance policy including coverage dates.',
  certification: 'Upload your professional certification documents.',
  bbb_rating: 'Connect your BBB (Better Business Bureau) profile for verification.',
}

const LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID',
  background_check: 'Background Check',
  insurance: 'Insurance Verification',
  certification: 'Certification Upload',
  bbb_rating: 'BBB Rating Integration',
}

interface Props {
  isOpen: boolean
  onClose: () => void
  type: VerificationType
  onComplete: () => void
}

export default function VerificationModal({ isOpen, onClose, type, onComplete }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{LABELS[type]}</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <p className="text-sm text-gray-600">{INSTRUCTIONS[type]}</p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { onComplete(); onClose() }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Start Verification
          </button>
        </div>
      </div>
    </div>
  )
}
