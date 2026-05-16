'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import { storage } from '@/lib/firebase'
import { ref as storageRef, deleteObject } from 'firebase/storage'
import { ArrowLeft, Trash2, GripVertical, X, ImageIcon, Plus, Camera } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import type { PortfolioPhoto } from '@/types'
import PortfolioUploadModal from '@/components/portfolio/PortfolioUploadModal'

const MAX_PHOTOS = 20

interface LightboxState {
  photo: PortfolioPhoto
}

export default function WorkerPortfolioPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [photos, setPhotos] = useState<PortfolioPhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Drag-to-reorder state
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

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

  const handleUploadSuccess = (newPhotos: PortfolioPhoto[]) => {
    setPhotos((prev) => [...prev, ...newPhotos])
    setShowUploadModal(false)
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
      {/* Lightbox */}
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
              aria-label="Close lightbox"
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

      {/* Upload Modal */}
      {showUploadModal && user && (
        <PortfolioUploadModal
          uid={user.uid}
          currentCount={photos.length}
          maxPhotos={MAX_PHOTOS}
          onSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
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
                onClick={() => setShowUploadModal(true)}
                className="hidden sm:flex"
              >
                <Plus className="h-4 w-4" />
                Add Photos
              </Button>
            )}
          </div>

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
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4" />
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
                      aria-label="View full size"
                    >
                      <ImageIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(photo)}
                      className="p-2 bg-red-500/90 rounded-full hover:bg-red-500 transition-colors"
                      aria-label="Delete photo"
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
                  onClick={() => setShowUploadModal(true)}
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
              <Button onClick={() => setShowUploadModal(true)} className="w-full">
                <Plus className="h-4 w-4" />
                Add Photos
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
