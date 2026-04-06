'use client'

import { useEffect, useCallback } from 'react'
import type { JobPhoto } from '@/types'
import { X, ChevronLeft, ChevronRight, Download, User, Clock } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface PhotoLightboxProps {
  photos: JobPhoto[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const TYPE_LABEL: Record<string, string> = {
  before: 'Before',
  after: 'After',
  general: 'General',
}

export default function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) {
  const photo = photos[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
    },
    [onClose, hasPrev, hasNext, currentIndex, onNavigate]
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

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = `photo-${photo.id}.jpg`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
          className="absolute left-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
          className="absolute right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors z-10"
          aria-label="Next photo"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      )}

      {/* Image */}
      <div
        className="flex flex-col items-center max-w-4xl w-full mx-8 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption || 'Job photo'}
          className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
        />

        {/* Metadata bar */}
        <div className="w-full bg-gray-900/80 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              photo.type === 'before'
                ? 'bg-orange-500/30 text-orange-300'
                : photo.type === 'after'
                ? 'bg-green-500/30 text-green-300'
                : 'bg-gray-500/30 text-gray-300'
            }`}>
              {TYPE_LABEL[photo.type] ?? photo.type}
            </span>
            {photo.caption && <span className="text-gray-300">{photo.caption}</span>}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
            {photo.workerName && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {photo.workerName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeDate(photo.uploadedAt)}
            </span>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onNavigate(i)}
                className={`flex-shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentIndex
                    ? 'border-primary-400'
                    : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-xs">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  )
}
