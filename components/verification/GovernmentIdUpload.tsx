'use client'

import type { VerificationStatus } from '@/types/reputation'

interface Props {
  onUpload: (file: File) => void
  status: VerificationStatus
}

const STATUS_STYLES: Record<VerificationStatus, string> = {
  verified: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
}

export default function GovernmentIdUpload({ onUpload, status }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-3 hover:border-blue-400 transition-colors">
      <div className="text-4xl">🪪</div>
      <p className="text-sm font-medium text-gray-700">Upload Government ID</p>
      <p className="text-xs text-gray-400">JPG, PNG or PDF · Max 10MB</p>
      <label className="inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
        Choose File
        <input type="file" accept="image/*,.pdf" id="gov-id-upload" aria-label="Upload government ID" className="hidden" onChange={handleChange} />
      </label>
      <div className={`inline-block ml-2 px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}>
        {status}
      </div>
    </div>
  )
}
