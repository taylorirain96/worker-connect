'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compressImage, validatePhotos, createPreviewUrl, revokePreviewUrls } from '@/lib/photoService'
import { MAX_PHOTOS, MAX_TOTAL_PHOTO_BYTES } from '@/lib/reviewValidation'

interface PhotoItem {
  file: File
  previewUrl: string
  uploading?: boolean
}

interface PhotoUploadProps {
  /** Current list of already-uploaded photo URLs (from the server/storage) */
  uploadedUrls?: string[]
  /** Called when files are selected and ready for upload */
  onFilesChange: (files: File[]) => void
  /** Max photos including already-uploaded ones */
  maxPhotos?: number
  disabled?: boolean
  className?: string
}

export default function PhotoUpload({
  uploadedUrls = [],
  onFilesChange,
  maxPhotos = MAX_PHOTOS,
  disabled = false,
  className,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<PhotoItem[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)

  const remaining = maxPhotos - uploadedUrls.length - items.length

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      setErrors([])
      const combined = [...items.map((i) => i.file), ...rawFiles]
      const { valid, errors: validationErrors, validFiles } = validatePhotos(combined, {
        maxCount: maxPhotos - uploadedUrls.length,
        maxTotalBytes: MAX_TOTAL_PHOTO_BYTES,
      })

      if (!valid) {
        setErrors(validationErrors)
      }

      // Compress + preview
      const newItems: PhotoItem[] = await Promise.all(
        validFiles.slice(items.length).map(async (file) => {
          const compressed = await compressImage(file)
          return { file: compressed, previewUrl: createPreviewUrl(compressed) }
        })
      )

      const updated = [...items, ...newItems]
      setItems(updated)
      onFilesChange(updated.map((i) => i.file))
    },
    [items, maxPhotos, uploadedUrls.length, onFilesChange]
  )

  function removeItem(idx: number) {
    setItems((prev) => {
      const removed = prev[idx]
      if (removed) revokePreviewUrls([removed.previewUrl])
      const next = prev.filter((_, i) => i !== idx)
      onFilesChange(next.map((i) => i.file))
      return next
    })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) processFiles(files)
    // Reset input so same files can be re-selected
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) processFiles(files)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      {remaining > 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer',
            dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && fileInputRef.current?.click()}
          aria-label="Upload photos"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag &amp; drop photos here, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Up to {maxPhotos} photos · Max {MAX_TOTAL_PHOTO_BYTES / (1024 * 1024)}MB total · JPEG, PNG, WebP
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            disabled={disabled}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <ul className="space-y-0.5">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview grid */}
      {(items.length > 0 || uploadedUrls.length > 0) && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {uploadedUrls.map((url, idx) => (
            <div
              key={`uploaded-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
            >
              <Image src={url} alt={`Photo ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
          {items.map((item, idx) => (
            <div
              key={`pending-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
            >
              <Image src={item.previewUrl} alt={`Preview ${idx + 1}`} fill className="object-cover" />
              {item.uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={disabled}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
                  aria-label={`Remove photo ${idx + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-400">
        {uploadedUrls.length + items.length} / {maxPhotos} photos selected
        {remaining <= 3 && remaining > 0 && (
          <span className="text-orange-500"> ({remaining} remaining)</span>
        )}
      </p>
    </div>
  )
}
