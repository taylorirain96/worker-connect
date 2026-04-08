'use client'

import { useState, useRef } from 'react'
import { Camera, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  displayName?: string | null
  onUpload?: (photoUrl: string) => void
  className?: string
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  displayName,
  onUpload,
  className,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(displayName ?? 'W')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create an object URL for immediate preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // In production this would upload to Firebase Storage
      // For now we simulate a successful upload with a placeholder URL
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
      const uploadedUrl = `storage://profile-photos/${Date.now()}_${encodeURIComponent(file.name)}`

      onUpload?.(uploadedUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(currentPhotoUrl ?? null)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
    onUpload?.('')
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar preview */}
      <div className="relative">
        <div
          className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-primary-100 shadow-md dark:border-gray-700 dark:bg-primary-900"
          aria-label="Profile photo preview"
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={displayName ?? 'Profile photo'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-semibold text-primary-600 dark:text-primary-400">
              {initials}
            </span>
          )}
        </div>

        {/* Upload trigger overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload profile photo"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload new profile photo"
        >
          {uploading ? 'Uploading…' : 'Choose Photo'}
        </Button>
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
            aria-label="Remove profile photo"
          >
            <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        PNG, JPG, GIF up to 5 MB
      </p>
    </div>
  )
}
