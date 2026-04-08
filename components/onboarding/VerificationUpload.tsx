'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { WorkerVerificationRecord } from '@/types'

interface VerificationUploadProps {
  verificationId: string
  verificationType: WorkerVerificationRecord['type']
  onSuccess?: (verificationId: string) => void
  className?: string
}

export default function VerificationUpload({
  verificationId,
  verificationType,
  onSuccess,
  className,
}: VerificationUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const typeLabels: Record<WorkerVerificationRecord['type'], string> = {
    government_id: 'Government ID',
    background_check: 'Background Check',
    insurance: 'Insurance Document',
    certification: 'Certification',
    bbb: 'BBB Accreditation',
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setFileName(file.name)

    try {
      // In production, upload to Firebase Storage and get download URL
      // For now, we use a placeholder URL (file name encoded)
      const documentUrl = `storage://worker-verifications/${verificationId}/${encodeURIComponent(file.name)}`

      const res = await fetch('/api/workers/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          verificationId,
          documentUrl,
          metadata: { originalName: file.name, size: file.size, type: file.type },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')

      setSubmitted(true)
      onSuccess?.(verificationId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
          className
        )}
        role="status"
      >
        <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">
          {typeLabels[verificationType]} submitted for review
          {fileName && <span className="ml-1 text-xs opacity-75">({fileName})</span>}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        aria-label={`Upload ${typeLabels[verificationType]}`}
        onChange={handleFileChange}
        disabled={uploading}
      />
      <Button
        variant="outline"
        size="md"
        loading={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label={`Upload ${typeLabels[verificationType]}`}
        className="w-full"
      >
        {!uploading && <Upload className="h-4 w-4" aria-hidden="true" />}
        {uploading ? 'Uploading…' : `Upload ${typeLabels[verificationType]}`}
      </Button>
      {error && (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  )
}
