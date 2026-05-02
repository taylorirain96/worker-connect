'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { storage } from '@/lib/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { ArrowLeft, Upload, Trash2, GripVertical, X, ImageIcon, Plus, Camera } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { PortfolioPhoto } from '@/types'

const MAX_PHOTOS = 20
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const CATEGORIES = [
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

interface UploadingPhoto {
  id: string
  file: File
  preview: string
  progress: number
  error?: string
}

interface LightboxState {
  photo: PortfolioPhoto
}

export default function WorkerPortfolioPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [photos, setPhotos] = useState<PortfolioPhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [uploading, setUploading] = useState<UploadingPhoto[]>([])
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  // Add photo form state
  const [addTitle, setAddTitle] = useState('')
  const [addCategory, setAddCategory] = useState(CATEGORIES[0])
  const [addDescription, setAddDescription] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Drag-to-reorder state
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect non-workers
  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'worker'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  const fetchPhotos = useCallback(async () => {
    if (!user?.uid) return
    setLoadingPhotos(true)
    try {
      const res = await fetch(`/api/portfolio?uid=${user.uid}`)
      if (res.ok) {
        const data = await res.json() as { photos: PortfolioPhoto[] }
        setPhotos(data.photos ?? [])
      }
    } finally {
      setLoadingPhotos(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid) fetchPhotos()
  }, [user?.uid, fetchPhotos])

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: only JPG, PNG and WEBP images are allowed`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: file must be under 5 MB`
    }
    return null
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !user?.uid) return

    const remaining = MAX_PHOTOS - photos.length - uploading.length
    if (remaining <= 0) {
      toast.error(`You've reached the maximum of ${MAX_PHOTOS} photos`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    for (const file of toUpload) {
      const err = validateFile(file)
      if (err) {
        toast.error(err)
        return
      }
    }

    if (!showAddForm) setShowAddForm(true)

    const newUploads: UploadingPhoto[] = toUpload.map((file) => ({
      id: `upload_${Date.now()}_${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }))
    setUploading((prev) => [...prev, ...newUploads])
  }

  const removeUpload = (id: string) => {
    setUploading((prev) => {
      const found = prev.find((u) => u.id === id)
      if (found) URL.revokeObjectURL(found.preview)
      return prev.filter((u) => u.id !== id)
    })
  }

  const handleAddPhotos = async () => {
    if (!user?.uid || uploading.length === 0) return
    if (!addTitle.trim()) {
      toast.error('Please enter a title for your photos')
      return
    }

    for (const upload of uploading) {
      if (!storage) {
        toast.error('Storage not available')
        return
      }

      const photoId = `${Date.now()}_${Math.random().toString(36).slice(2)}`
      const path = `portfolio/${user.uid}/${photoId}`
      const sRef = storageRef(storage, path)
      const task = uploadBytesResumable(sRef, upload.file)

      await new Promise<void>((resolve) => {
        task.on(
          'state_changed',
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
            setUploading((prev) =>
              prev.map((u) => (u.id === upload.id ? { ...u, progress: pct } : u)),
            )
          },
          (err) => {
            setUploading((prev) =>
              prev.map((u) =>
                u.id === upload.id ? { ...u, error: err.message } : u,
              ),
            )
            resolve()
          },
          async () => {
            try {
              const url = await getDownloadURL(task.snapshot.ref)
              const res = await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': user.uid,
                },
                body: JSON.stringify({
                  url,
                  title: addTitle.trim(),
                  category: addCategory,
                  description: addDescription.trim() || undefined,
                  order: photos.length,
                }),
              })
              if (!res.ok) {
                const data = await res.json() as { error?: string }
                toast.error(data.error ?? 'Failed to save photo')
              }
            } catch {
              toast.error('Failed to upload photo')
            } finally {
              resolve()
            }
          },
        )
      })
    }

    // Clean up previews
    uploading.forEach((u) => URL.revokeObjectURL(u.preview))
    setUploading([])
    setAddTitle('')
    setAddDescription('')
    setShowAddForm(false)
    await fetchPhotos()
    toast.success('Photos added to your portfolio!')
  }

  const handleDelete = async (photo: PortfolioPhoto) => {
    if (!user?.uid) return
    const confirmed = window.confirm(`Delete "${photo.title}" from your portfolio?`)
    if (!confirmed) return

    try {
      // Remove from Firebase Storage
      if (storage) {
        try {
          const path = `portfolio/${user.uid}/${photo.id}`
          await deleteObject(storageRef(storage, path))
        } catch {
          // Storage deletion may fail if file doesn't exist – continue anyway
        }
      }

      const res = await fetch(`/api/portfolio?photoId=${photo.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to delete photo')
      }
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      toast.success('Photo removed from portfolio')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete photo')
    }
  }

  // Drag-and-drop reorder
  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) return

    const reordered = [...photos]
    const [moved] = reordered.splice(dragItem.current, 1)
    reordered.splice(dragOverItem.current, 0, moved)
    dragItem.current = null
    dragOverItem.current = null

    setPhotos(reordered)

    // Persist order
    try {
      await fetch('/api/portfolio/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user!.uid,
        },
        body: JSON.stringify({ orderedIds: reordered.map((p) => p.id) }),
      })
    } catch {
      toast.error('Failed to save photo order')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading…</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800">
              <Image
                src={lightbox.photo.url}
                alt={lightbox.photo.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lightbox.photo.title}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">{lightbox.photo.category}</p>
              {lightbox.photo.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{lightbox.photo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolio</h1>
              <p className="text-sm text-gray-500 mt-1">
                Showcase your past work to win more jobs.{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {photos.length}/{MAX_PHOTOS} photos
                </span>
              </p>
            </div>
            {photos.length < MAX_PHOTOS && (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4" />
                Add Photos
              </Button>
            )}
          </div>

          {/* Upload Form */}
          {showAddForm && uploading.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Add Photos to Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Previews */}
                <div className="flex flex-wrap gap-3">
                  {uploading.map((u) => (
                    <div key={u.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.preview} alt="preview" className="w-full h-full object-cover" />
                      {u.progress > 0 && u.progress < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{u.progress}%</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeUpload(u.id)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. Bathroom renovation in Wellington"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Describe the project, materials used, any challenges overcome…"
                    rows={2}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleAddPhotos} disabled={!addTitle.trim()}>
                    <Upload className="h-4 w-4" />
                    Save to Portfolio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      uploading.forEach((u) => URL.revokeObjectURL(u.preview))
                      setUploading([])
                      setShowAddForm(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Grid */}
          {loadingPhotos ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
              <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No portfolio photos yet
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Upload photos of your past work to build trust with homeowners and win more jobs.
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload Your First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-grab active:cursor-grabbing"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setLightbox({ photo })}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ImageIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 bg-black/50 rounded text-white">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                    <p className="text-white/70 text-xs truncate">{photo.category}</p>
                  </div>
                </div>
              ))}

              {/* Add more tile */}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary-600 hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
                >
                  <Plus className="h-8 w-8" />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              )}
            </div>
          )}

          {/* Drag-to-reorder hint */}
          {photos.length > 1 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              Drag and drop photos to reorder them
            </p>
          )}

          {/* Mobile add button */}
          {photos.length < MAX_PHOTOS && (
            <div className="mt-6 sm:hidden">
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                <Plus className="h-4 w-4" />
                Add Photos
              </Button>
            </div>
          )}
        </div>
      </main>

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

      <Footer />
    </div>
  )
}
