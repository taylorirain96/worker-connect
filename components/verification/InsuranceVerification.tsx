'use client'

import type { VerificationStatus } from '@/types/reputation'

interface Props {
  status: VerificationStatus
  expiresAt?: string
  onUpload: (file: File) => void
}

export default function InsuranceVerification({ status, expiresAt, onUpload }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }

  const isExpiring = expiresAt ? new Date(expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Insurance Verification</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          status === 'verified' ? 'bg-green-100 text-green-700' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>{status}</span>
      </div>
      {expiresAt && (
        <p className={`text-sm ${isExpiring ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
          {isExpiring ? '⚠ Expires soon: ' : 'Expires: '}
          {new Date(expiresAt).toLocaleDateString()}
        </p>
      )}
      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-fit">
        📄 Upload Insurance Document
        <input type="file" accept="image/*,.pdf" aria-label="Upload insurance document" className="hidden" onChange={handleChange} />
      </label>
    </div>
  )
}
