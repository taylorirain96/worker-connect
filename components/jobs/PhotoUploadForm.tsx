'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import type { JobPhoto, JobPhotoUpload, PhotoType } from '@/types'
import { uploadJobPhoto } from '@/lib/photos/firebase'
import { validatePhotoFile, compressImage, createPreviewUrl, blobToFile, MIN_PHOTOS, MAX_PHOTOS } from '@/lib/photos/uploadLogic'
import { awardPhotoPoints } from '@/lib/photos/gamificationLogic'
import Button from '@/components/ui/Button'
import { BADGE_DEFINITIONS } from '@/lib/services/gamificationService'
import { Upload, X, Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PhotoUploadFormProps {
  jobId: string
  workerId: string
  workerName: string
  jobCompletedAt?: string | null
  onComplete?: (photos: JobPhoto[]) => void
}

const TYPE_OPTIONS: { value: PhotoType; label: string; description: string }[] = [
  { value: 'before', label: 'Before', description: 'State before work began' },
  { value: 'after',  label: 'After',  description: 'Result after work done' },
  { value: 'general', label: 'General', description: 'General progress photo' },
]

interface PendingPhoto extends JobPhotoUpload {
  id: string          // temp client-side id
  uploadProgress: number
  uploaded: boolean
  error?: string
}

export default function PhotoUploadForm({
  jobId,
  workerId,
  workerName,
  jobCompletedAt,
  onComplete,
}: PhotoUploadFormProps) {
  const [pending, setPending] = useState<PendingPhoto[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    const remaining = MAX_PHOTOS - pending.length
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`)
      return
    }
    const toAdd = arr.slice(0, remaining)
    const newItems: PendingPhoto[] = []
    for (const file of toAdd) {
      const err = validatePhotoFile(file)
      if (err) { toast.error(err.message); continue }
      const preview = await createPreviewUrl(file)
      newItems.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: 'general',
        caption: '',
        preview,
        uploadProgress: 0,
        uploaded: false,
      })
    }
    setPending((prev) => [...prev, ...newItems])
  }, [pending.length])

  const removePhoto = (id: string) => setPending((prev) => prev.filter((p) => p.id !== id))

  const updatePhoto = (id: string, patch: Partial<PendingPhoto>) =>
    setPending((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  // Drag-and-drop handlers
  const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = () => setIsDragOver(false)
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (pending.length < MIN_PHOTOS) {
      toast.error(`Upload at least ${MIN_PHOTOS} photos`)
      return
    }
    setSubmitting(true)
    const uploaded: JobPhoto[] = []

    for (const item of pending) {
      try {
        // Compress before upload
        let fileToUpload = item.file
        try {
          const compressed = await compressImage(item.file)
          fileToUpload = blobToFile(compressed, item.file.name)
        } catch {
          // fallback to original
        }

        const photo = await uploadJobPhoto(
          jobId,
          workerId,
          workerName,
          fileToUpload,
          item.type,
          item.caption,
          (pct) => updatePhoto(item.id, { uploadProgress: pct })
        )
        updatePhoto(item.id, { uploaded: true, uploadProgress: 100 })
        uploaded.push(photo)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        updatePhoto(item.id, { error: msg })
        toast.error(`Failed to upload ${item.file.name}`)
      }
    }

    // Award gamification points
    if (uploaded.length >= MIN_PHOTOS) {
      try {
        const result = await awardPhotoPoints(workerId, jobCompletedAt ?? null, uploaded.length)
        if (result.pointsAwarded > 0) {
          toast.success(`🎉 +${result.pointsAwarded} points for uploading photos!`)
        }
        for (const badge of result.badgesAwarded) {
          const def = BADGE_DEFINITIONS[badge]
          if (def) toast.success(`${def.icon} Badge unlocked: ${def.label}!`)
        }
      } catch {
        // ignore gamification errors
      }
    }

    setSubmitting(false)
    setDone(true)
    onComplete?.(uploaded)
    toast.success(`${uploaded.length} photo${uploaded.length !== 1 ? 's' : ''} uploaded successfully!`)
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">Photos uploaded!</h3>
        <p className="text-sm text-gray-500">Your job documentation has been submitted for review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer
          ${isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'
          }`}
      >
        <Camera className="h-10 w-10 text-gray-400" />
        <div className="text-center">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Drag &amp; drop photos here
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            or click to select — JPEG &amp; PNG, max 5 MB each
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{pending.length} / {MAX_PHOTOS} photos</span>
          <span>·</span>
          <span>min {MIN_PHOTOS} required</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={onFileChange}
        />
      </div>

      {/* Photo list */}
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((item) => (
            <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              {/* Preview */}
              <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                <Image
                  src={item.preview}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
                {item.uploadProgress > 0 && !item.uploaded && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{item.uploadProgress}%</span>
                  </div>
                )}
                {item.uploaded && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs text-gray-500 truncate">{item.file.name}</p>

                {/* Type selector */}
                <div className="flex gap-1 flex-wrap">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updatePhoto(item.id, { type: opt.value })}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        item.type === opt.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                          : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Caption */}
                <input
                  type="text"
                  placeholder="Add a caption (optional)"
                  value={item.caption}
                  onChange={(e) => updatePhoto(item.id, { caption: e.target.value })}
                  maxLength={120}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                {item.error && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {item.error}
                  </p>
                )}

                {/* Upload progress bar */}
                {item.uploadProgress > 0 && !item.uploaded && (
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div
                      className="bg-primary-500 h-1 rounded-full transition-all"
                      style={{ width: `${item.uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove */}
              {!submitting && !item.uploaded && (
                <button
                  onClick={() => removePhoto(item.id)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
        <Upload className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>+25 points</strong> for uploading 2+ photos. Upload within 24 hours for a <strong>1.5× bonus</strong>!
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={pending.length < MIN_PHOTOS || submitting}
        loading={submitting}
        className="w-full"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
        ) : (
          <><Upload className="h-4 w-4" /> Submit {pending.length} Photo{pending.length !== 1 ? 's' : ''}</>
        )}
      </Button>
    </div>
  )
}
