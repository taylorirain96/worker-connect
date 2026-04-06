'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, ImagePlus, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import type { PhotoType } from '@/types'
import {
  validatePhotoFile,
  validatePhotoCount,
  compressImage,
  formatFileSize,
  createPreviewUrl,
  revokePreviewUrl,
  PHOTO_CONSTRAINTS,
} from '@/lib/photos/uploadLogic'

interface PendingPhoto {
  file: File
  previewUrl: string
  caption: string
  type: PhotoType
  uploadProgress?: number
  uploaded?: boolean
  error?: string
}

interface PhotoUploadFormProps {
  jobId: string
  workerId: string
  workerName: string
  onUploadComplete: (uploadedCount: number) => void
  onCancel?: () => void
}

const TYPE_OPTIONS: { value: PhotoType; label: string; emoji: string }[] = [
  { value: 'before', label: 'Before', emoji: '🔴' },
  { value: 'after', label: 'After', emoji: '🟢' },
  { value: 'progress', label: 'Progress', emoji: '🔵' },
  { value: 'other', label: 'Other', emoji: '⚪' },
]

export default function PhotoUploadForm({
  jobId,
  workerId,
  workerName,
  onUploadComplete,
  onCancel,
}: PhotoUploadFormProps) {
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const newFiles = Array.from(files)
    const validFiles: PendingPhoto[] = []

    for (const file of newFiles) {
      const result = validatePhotoFile(file)
      if (!result.valid) {
        setGlobalError(result.error ?? 'Invalid file.')
        continue
      }
      const compressed = await compressImage(file)
      validFiles.push({
        file: compressed,
        previewUrl: createPreviewUrl(compressed),
        caption: '',
        type: 'other',
      })
    }

    setPhotos((prev) => {
      const merged = [...prev, ...validFiles].slice(0, PHOTO_CONSTRAINTS.maxFiles)
      return merged
    })
    setGlobalError(null)
  }, [])

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      revokePreviewUrl(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updateCaption = (index: number, caption: string) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, caption } : p)))
  }

  const updateType = (index: number, type: PhotoType) => {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, type } : p)))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const handleSubmit = async () => {
    const countResult = validatePhotoCount(photos.length)
    if (!countResult.valid) {
      setGlobalError(countResult.error ?? 'Invalid photo count.')
      return
    }

    setUploading(true)
    setGlobalError(null)

    // Dynamically import to avoid SSR issues with Firebase Storage
    const { uploadJobPhoto } = await import('@/lib/photos/firebase')

    let successCount = 0
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i]
      if (p.uploaded) {
        successCount++
        continue
      }
      try {
        await uploadJobPhoto(
          jobId,
          workerId,
          workerName,
          p.file,
          p.caption,
          p.type,
          (pct) => {
            setPhotos((prev) =>
              prev.map((item, idx) => (idx === i ? { ...item, uploadProgress: pct } : item))
            )
          }
        )
        setPhotos((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, uploaded: true, uploadProgress: 100 } : item
          )
        )
        successCount++
      } catch {
        setPhotos((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, error: 'Upload failed. Please retry.' } : item
          )
        )
      }
    }

    setUploading(false)
    if (successCount > 0) {
      onUploadComplete(successCount)
    }
  }

  const countResult = validatePhotoCount(photos.length)
  const canSubmit = photos.length >= PHOTO_CONSTRAINTS.minFiles && !uploading

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={PHOTO_CONSTRAINTS.acceptedExtensions.join(',')}
          multiple
          className="sr-only"
          onChange={handleFileInput}
          aria-label="Upload photos"
        />
        <ImagePlus className="h-10 w-10 mx-auto mb-3 text-gray-400" />
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Drag &amp; drop photos here
        </p>
        <p className="text-sm text-gray-500 mt-1">
          JPEG or PNG · max {formatFileSize(PHOTO_CONSTRAINTS.maxSizeBytes)} each ·{' '}
          {PHOTO_CONSTRAINTS.minFiles}–{PHOTO_CONSTRAINTS.maxFiles} photos
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" />
          Browse Files
        </Button>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {globalError}
        </div>
      )}

      {/* Photo count hint */}
      {photos.length > 0 && (
        <div className={`text-sm flex items-center gap-2 ${countResult.valid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {countResult.valid
            ? <CheckCircle className="h-4 w-4" />
            : <AlertCircle className="h-4 w-4" />}
          {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
          {!countResult.valid && ` — ${countResult.error}`}
        </div>
      )}

      {/* Photo list */}
      {photos.length > 0 && (
        <div className="space-y-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              {/* Preview */}
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {/* Upload progress overlay */}
                {photo.uploadProgress !== undefined && !photo.uploaded && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{photo.uploadProgress}%</span>
                  </div>
                )}
                {photo.uploaded && (
                  <div className="absolute inset-0 bg-green-600/70 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="flex-1 space-y-2">
                {/* Type selector */}
                <div className="flex gap-1.5 flex-wrap">
                  {TYPE_OPTIONS.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateType(index, value)}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${
                        photo.type === value
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                      }`}
                    >
                      {emoji} {label}
                    </button>
                  ))}
                </div>

                {/* Caption */}
                <input
                  type="text"
                  value={photo.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Add a caption (optional)…"
                  maxLength={200}
                  className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {/* File info */}
                <p className="text-xs text-gray-400">{formatFileSize(photo.file.size)}</p>

                {/* Per-photo error */}
                {photo.error && (
                  <p className="text-xs text-red-500">{photo.error}</p>
                )}
              </div>

              {/* Remove */}
              {!photo.uploaded && (
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={uploading} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          loading={uploading}
          disabled={!canSubmit}
          className="flex-1"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading…' : `Upload ${photos.length || ''} Photo${photos.length !== 1 ? 's' : ''}`}
        </Button>
      </div>

      {/* Gamification hint */}
      <p className="text-xs text-center text-gray-400 dark:text-gray-500">
        🏆 Upload 2+ photos to earn <strong className="text-primary-600">+25 points</strong>. Upload within 24 hours for a <strong className="text-yellow-600">1.5× bonus!</strong>
      </p>
    </div>
  )
}
