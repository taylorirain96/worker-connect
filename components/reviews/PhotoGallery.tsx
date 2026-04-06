'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: string[]
  /** Alt text prefix; individual photos get suffix " N" */
  altPrefix?: string
  className?: string
}

export default function PhotoGallery({ photos, altPrefix = 'Review photo', className }: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length))
  }, [photos.length])

  const next = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % photos.length))
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return
    function handleKey(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape': closeLightbox(); break
        case 'ArrowLeft': prev(); break
        case 'ArrowRight': next(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIdx, prev, next])

  if (photos.length === 0) return null

  return (
    <>
      {/* Grid */}
      <div
        className={cn(
          'grid gap-2',
          photos.length === 1 && 'grid-cols-1',
          photos.length === 2 && 'grid-cols-2',
          photos.length >= 3 && 'grid-cols-3',
          className
        )}
      >
        {photos.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openLightbox(idx)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={`${altPrefix} ${idx + 1} – click to expand`}
          >
            <Image
              src={url}
              alt={`${altPrefix} ${idx + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
              <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-3xl max-h-[85vh] aspect-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIdx]}
              alt={`${altPrefix} ${lightboxIdx + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          {/* Next */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Counter */}
          {photos.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
              {lightboxIdx + 1} / {photos.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
