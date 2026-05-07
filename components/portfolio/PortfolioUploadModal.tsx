'use client'
import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { Upload, X, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { storage } from '@/lib/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import type { PortfolioPhoto } from '@/types'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Generate a unique ID with fallback for environments where crypto.randomUUID() is unavailable */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback: combine high-resolution time with multiple random segments for sufficient entropy
  const time = typeof performance !== 'undefined' ? performance.now().toString(36) : Date.now().toString(36)
  const r1 = Math.random().toString(36).slice(2, 10)
  const r2 = Math.random().toString(36).slice(2, 10)
  const r3 = Math.random().toString(36).slice(2, 10)
  return `${time}-${r1}-${r2}-${r3}`
}

/** Type guard that validates a value looks like a PortfolioPhoto */
function isPortfolioPhoto(v: unknown): v is PortfolioPhoto {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.uid === 'string' &&
    typeof o.url === 'string' &&
    typeof o.title === 'string' &&
    typeof o.category === 'string' &&
    typeof o.order === 'number'
  )
}

export const PORTFOLIO_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'HVAC',
  'Roofing',
  'Landscaping',
  'Painting',
  'Flooring',
  'Cleaning',
  'Moving',
  'General',
  'Other',
]

interface UploadingFile {
  id: string
  file: File
  preview: string
  progress: number
  error?: string
}

interface PortfolioUploadModalProps {
  uid: string
  currentCount: number
  maxPhotos?: number
  onSuccess: (photos: PortfolioPhoto[]) => void
  onClose: () => void
}

export default function PortfolioUploadModal({
  uid,
  currentCount,
  maxPhotos = 20,
  onSuccess,
  onClose,
}: PortfolioUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(PORTFOLIO_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const remaining = maxPhotos - currentCount

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: only JPG, PNG and WEBP images are allowed`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: file must be under 5 MB`
    }
    return null
  }

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return
    const toAdd = Array.from(fileList).slice(0, remaining - files.length)
    const errors: string[] = []
    const valid: File[] = []
    for (const file of toAdd) {
      const err = validateFile(file)
      if (err) {
        errors.push(err)
      } else {
        valid.push(file)
      }
    }
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e))
    }
    if (valid.length === 0) return
    const newFiles: UploadingFile[] = valid.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const found = prev.find((f) => f.id === id)
      if (found) URL.revokeObjectURL(found.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your photos')
      return
    }
    if (files.length === 0) {
      toast.error('Please select at least one photo')
      return
    }
    if (!storage) {
      toast.error('Storage not available')
      return
    }

    setSaving(true)
    const saved: PortfolioPhoto[] = []

    for (let i = 0; i < files.length; i++) {
      const uploadFile = files[i]
      const photoId = generateId()
      const path = `portfolio/${uid}/${photoId}`
      const sRef = storageRef(storage, path)
      const task = uploadBytesResumable(sRef, uploadFile.file)

      await new Promise<void>((resolve) => {
        task.on(
          'state_changed',
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            setFiles((prev) =>
              prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: pct } : f)),
            )
          },
          (err) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, error: err.message } : f,
              ),
            )
            toast.error(`Failed to upload ${uploadFile.file.name}`)
            resolve()
          },
          async () => {
            try {
              const url = await getDownloadURL(task.snapshot.ref)
              const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': uid,
                },
                body: JSON.stringify({
                  url,
                  title: title.trim(),
                  category,
                  description: description.trim() || undefined,
                  order: currentCount + saved.length,
                }),
              })
              if (res.ok) {
                const data = await res.json() as { photo?: unknown }
                if (isPortfolioPhoto(data.photo)) {
                  saved.push(data.photo)
                } else {
                  toast.error('Unexpected response from server')
                }
              } else {
                const data = await res.json() as { error?: string }
                toast.error(data.error ?? 'Failed to save photo')
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Unknown error'
              toast.error(`Failed to upload ${uploadFile.file.name}: ${msg}`)
            } finally {
              resolve()
            }
          },
        )
      })
    }

    setSaving(false)

    // Clean up object URLs
    files.forEach((f) => URL.revokeObjectURL(f.preview))

    if (saved.length > 0) {
      toast.success(`${saved.length} photo${saved.length !== 1 ? 's' : ''} added to your portfolio!`)
      onSuccess(saved)
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary-600" />
            Add Portfolio Photos
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click or drag photos here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or WEBP · Max 5 MB each · Up to {remaining} more photo{remaining !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Selected file previews */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                  {f.progress > 0 && f.progress < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{f.progress}%</span>
                    </div>
                  )}
                  {!saving && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {f.error && (
                    <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-1 text-center">Error</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom renovation in Wellington"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {PORTFOLIO_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project, materials used, any challenges overcome…"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <Button
            onClick={handleSave}
            disabled={saving || files.length === 0 || !title.trim()}
            className="flex-1"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Uploading…
              </span>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Save to Portfolio
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
