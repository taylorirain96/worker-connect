'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VerificationItem } from '@/types/reputation'

interface Props {
  insurance: VerificationItem
  onUpload?: (file: File, expiryDate: string) => Promise<void>
  className?: string
}

export default function InsuranceVerification({ insurance, onUpload, className }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [expiry, setExpiry] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!file || !expiry) return
    setLoading(true)
    try {
      await onUpload?.(file, expiry)
      setFile(null)
      setExpiry('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🛡️</span>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Insurance Verification</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {insurance.status === 'verified'
              ? `Verified – expires ${insurance.expiryDate ?? 'N/A'}`
              : 'Upload certificate of insurance (COI)'}
          </p>
        </div>
      </div>

      {insurance.status !== 'verified' && (
        <>
          <label className="block cursor-pointer">
            <div className={cn(
              'border-2 border-dashed rounded-xl p-5 text-center transition-colors',
              file
                ? 'border-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            )}>
              {file ? (
                <p className="text-sm text-gray-700 dark:text-gray-200">{file.name}</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">PDF or image of your COI</p>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">Policy Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !file || !expiry}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'Uploading…' : 'Submit Insurance'}
          </button>
        </>
      )}

      {insurance.status === 'verified' && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <span>✓</span>
          <span className="text-sm font-medium">Insurance verified</span>
        </div>
      )}
    </div>
  )
}
