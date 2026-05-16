'use client'
import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { JobPhoto } from '@/types'
import { formatDateTime } from '@/lib/utils'

interface PhotoLightboxProps {
  photos: JobPhoto[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex]

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(currentIndex - 1)
  }, [currentIndex, onNavigate])

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
  }, [currentIndex, photos.length, onNavigate])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  if (!photo) return null

  const TYPE_LABELS: Record<string, string> = {
    before: 'Before',
    after: 'After',
    progress: 'Progress',
    other: 'Other',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Content — stop propagation so clicking inside doesn't close */}
      <div
        className="relative flex flex-col items-center max-w-5xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white p-1 rounded"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Counter */}
        <span className="absolute -top-10 left-0 text-white/60 text-sm">
          {currentIndex + 1} / {photos.length}
        </span>

        {/* Main image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || `Photo ${currentIndex + 1}`}
          className="max-h-[75vh] max-w-full rounded-lg object-contain"
        />

        {/* Navigation */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Metadata bar */}
        <div className="mt-4 w-full bg-gray-900/80 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            {photo.caption && (
              <p className="text-white font-medium text-sm">{photo.caption}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="capitalize px-2 py-0.5 rounded bg-primary-700/50 text-primary-300 font-medium">
                {TYPE_LABELS[photo.type] ?? photo.type}
              </span>
              <span>By {photo.workerName}</span>
              <span>{formatDateTime(photo.uploadedAt)}</span>
            </div>
          </div>
          <a
            href={photo.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 max-w-full">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onNavigate(i)}
                className={`flex-shrink-0 h-14 w-14 rounded overflow-hidden border-2 transition-colors ${
                  i === currentIndex
                    ? 'border-primary-400'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnailUrl ?? p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
