'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validatePhotos, createPhotoPreview, revokePhotoPreview } from '@/lib/photoService'
import { MAX_PHOTOS, MAX_PHOTO_SIZE_BYTES, ALLOWED_IMAGE_TYPES } from '@/lib/reviewValidation'

interface PhotoPreview {
  file: File
  previewUrl: string
  uploading?: boolean
  uploadProgress?: number
  error?: string
}

interface PhotoUploadProps {
  /** Currently selected files */
  value?: File[]
  /** Called when the file list changes */
  onChange?: (files: File[]) => void
  /** Maximum photos allowed (defaults to MAX_PHOTOS = 10) */
  maxPhotos?: number
  disabled?: boolean
  className?: string
}

export default function PhotoUpload({
  value,
  onChange,
  maxPhotos = MAX_PHOTOS,
  disabled = false,
  className,
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<PhotoPreview[]>([])
  const [dragging, setDragging] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync external value → previews (for controlled usage)
  useEffect(() => {
    if (!value) return
    // Only update if lengths differ (avoid infinite loops)
    if (value.length !== previews.length) {
      // Revoke old previews
      previews.forEach((p) => revokePhotoPreview(p.previewUrl))
      setPreviews(
        value.map((file) => ({ file, previewUrl: createPhotoPreview(file) }))
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => revokePhotoPreview(p.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setValidationErrors([])
      const fileArray = Array.from(newFiles)
      const combined = [...previews.map((p) => p.file), ...fileArray]

      const validation = validatePhotos(combined)
      if (!validation.valid) {
        setValidationErrors(validation.errors.map((e) => e.error))
        // Filter to valid files only
        const validNew = fileArray.filter((file) => {
          const isTypeOk = ALLOWED_IMAGE_TYPES.includes(
            file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
          )
          const isSizeOk = file.size <= MAX_PHOTO_SIZE_BYTES
          return isTypeOk && isSizeOk
        })
        if (validNew.length === 0) return
        const allowedNew = validNew.slice(0, maxPhotos - previews.length)
        const newPreviews = allowedNew.map((file) => ({
          file,
          previewUrl: createPhotoPreview(file),
        }))
        const updated = [...previews, ...newPreviews]
        setPreviews(updated)
        onChange?.(updated.map((p) => p.file))
        return
      }

      // Respect max count
      const allowed = fileArray.slice(0, maxPhotos - previews.length)
      const newPreviews = allowed.map((file) => ({
        file,
        previewUrl: createPhotoPreview(file),
      }))
      const updated = [...previews, ...newPreviews]
      setPreviews(updated)
      onChange?.(updated.map((p) => p.file))
    },
    [previews, maxPhotos, onChange]
  )

  function removePhoto(idx: number) {
    const removed = previews[idx]
    if (removed) revokePhotoPreview(removed.previewUrl)
    const updated = previews.filter((_, i) => i !== idx)
    setPreviews(updated)
    onChange?.(updated.map((p) => p.file))
    setValidationErrors([])
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = '' // reset so same file can be re-selected
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const remaining = maxPhotos - previews.length
  const isAtMax = remaining <= 0

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      {!isAtMax && !disabled && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photos – click or drag and drop"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors select-none',
            dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {dragging ? 'Drop photos here' : 'Click or drag & drop photos'}
          </p>
          <p className="text-xs text-gray-400">
            JPG, PNG, WEBP, GIF · max {MAX_PHOTO_SIZE_BYTES / 1024 / 1024}MB each · {remaining} slot
            {remaining !== 1 ? 's' : ''} left
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <Image
                src={preview.previewUrl}
                alt={`Preview ${idx + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Upload progress overlay */}
              {preview.uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                  <span className="text-xs text-white font-medium">{preview.uploadProgress ?? 0}%</span>
                </div>
              )}
              {/* Error overlay */}
              {preview.error && (
                <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-1">
                  <p className="text-xs text-white text-center leading-tight">{preview.error}</p>
                </div>
              )}
              {/* Remove button */}
              {!preview.uploading && !disabled && (
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                  aria-label={`Remove photo ${idx + 1}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {/* Empty placeholder slots (up to max) */}
          {!isAtMax && !disabled && Array.from({ length: Math.min(remaining, 2) }).map((_, i) => (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Add another photo"
            >
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
