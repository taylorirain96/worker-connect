'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, ImagePlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { validateImageFile, compressImage, createPreviewURL, revokePreviewURL, formatFileSize } from '@/lib/photos/uploadLogic'
import { uploadJobPhoto } from '@/lib/photos/firebase'
import type { PhotoUploadItem } from '@/types'

const MIN_PHOTOS = 2
const MAX_PHOTOS = 10

interface PhotoUploadFormProps {
  jobId: string
  workerId: string
  workerName: string
  onComplete: (uploadedCount: number, pointsEarned: number) => void
}

export default function PhotoUploadForm({
  jobId,
  workerId,
  workerName,
  onComplete,
}: PhotoUploadFormProps) {
  const [items, setItems] = useState<PhotoUploadItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Add files ──────────────────────────────────────────────────────────────

  const addFiles = useCallback((files: File[]) => {
    setGlobalError(null)
    const remaining = MAX_PHOTOS - items.length
    if (remaining <= 0) {
      setGlobalError(`Maximum ${MAX_PHOTOS} photos allowed.`)
      return
    }

    const toAdd: PhotoUploadItem[] = []
    for (const file of files.slice(0, remaining)) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setGlobalError(validation.error ?? 'Invalid file.')
        continue
      }
      toAdd.push({
        file,
        preview: createPreviewURL(file),
        caption: '',
        type: 'progress',
        progress: 0,
        status: 'idle',
      })
    }
    setItems((prev) => [...prev, ...toAdd])
  }, [items.length])

  // ─── Drag and drop ──────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    },
    [addFiles]
  )

  // ─── Remove item ────────────────────────────────────────────────────────────

  const removeItem = (idx: number) => {
    setItems((prev) => {
      revokePreviewURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // ─── Update item field ──────────────────────────────────────────────────────

  const updateItem = (idx: number, patch: Partial<PhotoUploadItem>) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (items.length < MIN_PHOTOS) {
      setGlobalError(`Please add at least ${MIN_PHOTOS} photos.`)
      return
    }
    setSubmitting(true)
    setGlobalError(null)
    let uploadedCount = 0

    for (let i = 0; i < items.length; i++) {
      updateItem(i, { status: 'uploading', progress: 0 })
      try {
        const compressed = await compressImage(items[i].file)
        await uploadJobPhoto({
          file: compressed,
          jobId,
          workerId,
          workerName,
          caption: items[i].caption,
          type: items[i].type,
          onProgress: (pct) => updateItem(i, { progress: pct }),
        })
        updateItem(i, { status: 'done', progress: 100 })
        uploadedCount++
      } catch {
        updateItem(i, { status: 'error', errorMessage: 'Upload failed. Please retry.' })
      }
    }

    setSubmitting(false)

    // Award 25 pts if at least 2 uploaded; 37 pts if early upload (mocked here)
    const pointsEarned = uploadedCount >= MIN_PHOTOS ? 25 : 0
    onComplete(uploadedCount, pointsEarned)
  }

  const canSubmit = items.length >= MIN_PHOTOS && !submitting && items.every((it) => it.status !== 'uploading')

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Drag & drop photos here, or <span className="text-primary-600 dark:text-primary-400">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPEG, PNG or WebP · max 5 MB each · {MIN_PHOTOS}–{MAX_PHOTOS} photos
        </p>
      </div>

      {/* Error */}
      {globalError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {globalError}
        </div>
      )}

      {/* Photo items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
            >
              {/* Thumbnail */}
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />

                {/* Upload progress overlay */}
                {item.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{item.progress}%</span>
                  </div>
                )}
                {item.status === 'done' && (
                  <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Type selector */}
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(idx, { type: e.target.value as PhotoUploadItem['type'] })}
                    disabled={item.status !== 'idle'}
                    className="text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="before">Before</option>
                    <option value="progress">Progress</option>
                    <option value="after">After</option>
                  </select>

                  {/* File size */}
                  <span className="text-xs text-gray-400">{formatFileSize(item.file.size)}</span>

                  {item.status === 'error' && (
                    <Badge variant="danger" className="text-[10px]">Error</Badge>
                  )}

                  {/* Remove button */}
                  {item.status !== 'uploading' && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Caption */}
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => updateItem(idx, { caption: e.target.value })}
                  disabled={item.status !== 'idle'}
                  placeholder="Add a caption (optional)"
                  maxLength={120}
                  className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />

                {/* Error message */}
                {item.errorMessage && (
                  <p className="text-xs text-red-500">{item.errorMessage}</p>
                )}

                {/* Upload progress bar */}
                {item.status === 'uploading' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 rounded-full h-1.5 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add more */}
      {items.length > 0 && items.length < MAX_PHOTOS && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          <ImagePlus className="h-4 w-4" />
          Add more photos ({MAX_PHOTOS - items.length} remaining)
        </button>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
          className="flex-1"
        >
          <Upload className="h-4 w-4" />
          Upload {items.length} Photo{items.length !== 1 ? 's' : ''}
        </Button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        🏆 Upload {MIN_PHOTOS}+ photos to earn <strong>+25 points</strong>
        {' '}· Upload within 24 hours for a <strong>1.5× bonus</strong>!
      </p>
    </div>
  )
}
