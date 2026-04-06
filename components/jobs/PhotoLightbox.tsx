'use client'

import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download, User, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import type { JobPhoto } from '@/types'

interface PhotoLightboxProps {
  photos: JobPhoto[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onGoTo?: (index: number) => void
}

const TYPE_BADGE_VARIANT: Record<JobPhoto['type'], 'warning' | 'success' | 'info'> = {
  before: 'warning',
  after: 'success',
  progress: 'info',
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onGoTo,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative flex flex-col lg:flex-row max-w-5xl w-full max-h-[90vh] mx-4 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Close lightbox"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.caption || 'Job photo'}
            className="max-w-full max-h-[70vh] object-contain"
          />

          {/* Prev / Next */}
          {photos.length > 1 && (
            <>
              <button
                onClick={onPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={onNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Photo counter */}
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        {/* Metadata sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0 p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={TYPE_BADGE_VARIANT[photo.type]}>
              {photo.type.charAt(0).toUpperCase() + photo.type.slice(1)}
            </Badge>
            {photo.approvalStatus === 'approved' && (
              <Badge variant="success">Approved</Badge>
            )}
            {photo.approvalStatus === 'flagged' && (
              <Badge variant="danger">Flagged</Badge>
            )}
          </div>

          <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {photo.caption || 'No caption'}
          </p>

          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>{photo.workerName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDateTime(photo.createdAt)}</span>
            </div>
          </div>

          {photo.qualityScore !== undefined && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Quality Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${photo.qualityScore}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {photo.qualityScore}
                </span>
              </div>
            </div>
          )}

          {photo.moderatorNote && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-700 dark:text-yellow-400">
              <strong>Note:</strong> {photo.moderatorNote}
            </div>
          )}

          {/* Download */}
          <a
            href={photo.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block"
          >
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </a>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-1">
              {photos.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => onGoTo ? onGoTo(idx) : undefined}
                  className={`aspect-square rounded overflow-hidden border-2 transition-colors ${
                    idx === currentIndex
                      ? 'border-primary-500'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl || p.url}
                    alt={p.caption || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
