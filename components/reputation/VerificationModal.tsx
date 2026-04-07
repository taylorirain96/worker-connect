'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VerificationType } from '@/types/reputation'

interface Props {
  type: VerificationType
  isOpen: boolean
  onClose: () => void
  onSubmit?: (type: VerificationType, file?: File) => Promise<void>
}

const TYPE_CONFIG: Record<VerificationType, { title: string; description: string; accept?: string }> = {
  governmentId: {
    title: 'Government ID Verification',
    description: 'Upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID).',
    accept: 'image/*,.pdf',
  },
  backgroundCheck: {
    title: 'Background Check',
    description: 'We\'ll initiate a background check through our trusted provider. This typically takes 2–3 business days.',
  },
  insurance: {
    title: 'Insurance Verification',
    description: 'Upload your current certificate of insurance (COI). Accepted formats: PDF, JPG, PNG.',
    accept: 'image/*,.pdf',
  },
  certifications: {
    title: 'Professional Certifications',
    description: 'Upload your professional certifications or licenses to showcase your credentials.',
    accept: 'image/*,.pdf',
  },
  bbbRating: {
    title: 'BBB / Google Rating',
    description: 'Provide your BBB business profile link or Google Business URL to verify your external ratings.',
  },
}

export default function VerificationModal({ type, isOpen, onClose, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)
  const config = TYPE_CONFIG[type]

  if (!isOpen) return null

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit?.(type, file ?? undefined)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const needsFile = type === 'governmentId' || type === 'insurance' || type === 'certifications'
  const needsLink = type === 'bbbRating'
  const isBackgroundCheck = type === 'backgroundCheck'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6',
        'border border-gray-200 dark:border-gray-700'
      )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close"
        >
          ✕
        </button>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{config.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{config.description}</p>

        {needsFile && (
          <label className="block mb-4">
            <span className="sr-only">Upload document</span>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
              {file ? (
                <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-1">{config.accept?.replace('image/*,', 'Images, ')}</p>
                </>
              )}
              <input
                type="file"
                accept={config.accept}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </div>
          </label>
        )}

        {needsLink && (
          <input
            type="url"
            placeholder="https://www.bbb.org/your-profile"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        )}

        {isBackgroundCheck && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              By proceeding, you authorise a background check conducted by our partner. Results are kept confidential.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (needsFile && !file) || (needsLink && !link)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl py-2.5 text-sm font-medium text-white transition-colors"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
