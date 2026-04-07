'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  onUpload?: (file: File) => Promise<void>
  currentDocUrl?: string
  status?: 'unverified' | 'pending' | 'verified' | 'rejected'
  className?: string
}

export default function GovernmentIdUpload({ onUpload, currentDocUrl, status = 'unverified', className }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (selected: File) => {
    setFile(selected)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(selected)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    try {
      await onUpload?.(file)
      setFile(null)
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">🪪</span>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Government ID</h4>
          <StatusBadge status={status} />
        </div>
      </div>

      {status !== 'verified' && (
        <>
          <label className="block cursor-pointer">
            <div className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
              preview
                ? 'border-blue-400 dark:border-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
            )}>
              {preview ? (
                <img src={preview} alt="ID preview" className="mx-auto max-h-40 object-contain rounded-lg" />
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload passport, driver&apos;s license, or national ID</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF – max 10 MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {file && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Uploading…' : 'Submit for Verification'}
            </button>
          )}
        </>
      )}

      {status === 'verified' && currentDocUrl && (
        <p className="text-xs text-green-600 dark:text-green-400">✓ Document verified and securely stored</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: Props['status'] }) {
  const map = {
    unverified: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
    pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    verified: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    rejected: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  }
  const labels = { unverified: 'Not verified', pending: 'Pending review', verified: 'Verified', rejected: 'Rejected' }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', map[status ?? 'unverified'])}>
      {labels[status ?? 'unverified']}
    </span>
  )
}
